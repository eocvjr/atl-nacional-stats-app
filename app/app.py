from flask import Flask, jsonify, render_template
from flask_cors import CORS
from .api import get_next_match, get_odds, get_main_odds_market_from_markets
from .db import get_connection
import os
import time
import sqlite3

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

TEAM_ID = 6106


def row_has_key(row, key):
    try:
        return key in row.keys()
    except Exception:
        return False


def row_value(row, key, default=None):
    if row_has_key(row, key):
        value = row[key]
        return default if value is None else value

    return default


def bool_from_db(value):
    try:
        return bool(int(value or 0))
    except Exception:
        return bool(value)


def int_from_db(value, default=0):
    try:
        if value is None or value == "":
            return default
        return int(value)
    except Exception:
        return default


def compute_result_class(home_team, away_team, home_score, away_score):
    result_class = "score-draw"

    if home_score is not None and away_score is not None:
        nac_is_home = home_team == "Atlético Nacional"
        nac_score = home_score if nac_is_home else away_score
        rival_score = away_score if nac_is_home else home_score

        if nac_score > rival_score:
            result_class = "score-win"
        elif nac_score < rival_score:
            result_class = "score-loss"

    return result_class


def row_to_player(row):
    is_substitute = int_from_db(row_value(row, "is_substitute", 0))
    subbed_in = bool_from_db(row_value(row, "subbed_in", 0))
    subbed_out = bool_from_db(row_value(row, "subbed_out", 0))

    return {
        "id": row_value(row, "player_id"),
        "player_id": row_value(row, "player_id"),

        "team_side": row_value(row, "team_side"),
        "team_id": row_value(row, "team_id"),
        "team_name": row_value(row, "team_name"),

        "name": row_value(row, "player_name"),
        "player_name": row_value(row, "player_name"),

        "shirt_number": row_value(row, "shirt_number"),
        "position": row_value(row, "position"),
        "rating": row_value(row, "rating"),

        "goals": int_from_db(row_value(row, "goals", 0)),
        "assists": int_from_db(row_value(row, "assists", 0)),
        "yellow_cards": int_from_db(row_value(row, "yellow_cards", 0)),
        "red_cards": int_from_db(row_value(row, "red_cards", 0)),

        "is_substitute": is_substitute,
        "subbed_in": subbed_in,
        "subbed_out": subbed_out,

        "goal_minute": row_value(row, "goal_minute"),
        "goal_minutes": row_value(row, "goal_minute"),
        
        "assist_minute": row_value(row, "assist_minute"),
        "assist_minutes": row_value(row, "assist_minute"),
        
        "yellow_card_minute": row_value(row, "yellow_card_minute"),
        "yellow_card_minutes": row_value(row, "yellow_card_minute"),
        "red_card_minute": row_value(row, "red_card_minute"),
        "red_card_minutes": row_value(row, "red_card_minute"),
        
        "subbed_in_minute": row_value(row, "subbed_in_minute"),
        "subbed_out_minute": row_value(row, "subbed_out_minute"),

        "has_detail": row_value(row, "team_id") == TEAM_ID and row_value(row, "player_id") is not None,
    }


def build_lineups_from_rows(lineup_rows):
    lineups = {
        "confirmed": True,
        "home_xi": [],
        "away_xi": [],
        "home_subs": [],
        "away_subs": [],
    }

    for row in lineup_rows:
        player = row_to_player(row)
        team_side = row_value(row, "team_side")
        is_substitute = bool_from_db(row_value(row, "is_substitute", 0))

        if team_side == "home" and not is_substitute:
            lineups["home_xi"].append(player)
        elif team_side == "away" and not is_substitute:
            lineups["away_xi"].append(player)
        elif team_side == "home" and is_substitute:
            lineups["home_subs"].append(player)
        elif team_side == "away" and is_substitute:
            lineups["away_subs"].append(player)

    return lineups


def get_previous_matches_from_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT event_id, date, time, home_team, away_team, home_score, away_score,
               tournament_name, status, start_time
        FROM matches
        ORDER BY start_time DESC
    """)
    rows = cur.fetchall()
    conn.close()

    out = []
    for row in rows:
        item = dict(row)
        item["result_class"] = compute_result_class(
            item["home_team"],
            item["away_team"],
            item["home_score"],
            item["away_score"],
        )
        out.append(item)

    return out


def get_stats_by_period_from_rows(stat_rows):
    stats_by_period = {"TOTAL": [], "1T": [], "2T": []}

    for row in stat_rows:
        period = row_value(row, "period", "TOTAL")

        if period not in stats_by_period:
            stats_by_period[period] = []

        stats_by_period[period].append({
            "name": row_value(row, "stat_name"),
            "home": row_value(row, "home_value"),
            "away": row_value(row, "away_value"),
        })

    return stats_by_period


def get_lineup_rows_for_event(cur, event_id):
    cur.execute("""
        SELECT
            team_side,
            team_id,
            team_name,
            player_id,
            player_name,
            shirt_number,
            position,
            rating,
            goals,
            assists,
            yellow_cards,
            red_cards,
            is_substitute,
            subbed_in,
            subbed_out,
            goal_minute,
            assist_minute,
            yellow_card_minute,
            red_card_minute,
            subbed_in_minute,
            subbed_out_minute
        FROM lineups
        WHERE event_id = ?
        ORDER BY
            team_side ASC,
            is_substitute ASC,
            CASE position
                WHEN 'POR' THEN 1
                WHEN 'DEF' THEN 2
                WHEN 'MED' THEN 3
                WHEN 'DEL' THEN 4
                ELSE 5
            END,
            shirt_number ASC,
            player_name ASC
    """, (event_id,))

    return cur.fetchall()


def get_match_detail_from_db(event_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM matches WHERE event_id = ?", (event_id,))
    match = cur.fetchone()

    if not match:
        conn.close()
        return None

    cur.execute("""
        SELECT position, team_name, played, wins, draws, losses,
               goals_for, goals_against, goal_diff, points
        FROM standings
        WHERE event_id = ?
        ORDER BY position ASC
    """, (event_id,))
    flat_table = [dict(r) for r in cur.fetchall()]

    lineup_rows = get_lineup_rows_for_event(cur, event_id)

    cur.execute("""
        SELECT period, stat_name, home_value, away_value
        FROM match_stats
        WHERE event_id = ?
        ORDER BY id ASC
    """, (event_id,))
    stat_rows = cur.fetchall()

    conn.close()

    return {
        "event_id": match["event_id"],
        "date": match["date"],
        "time": match["time"],
        "match_info": dict(match),
        "flat_table": flat_table,
        "lineups": build_lineups_from_rows(lineup_rows),
        "stats_by_period": get_stats_by_period_from_rows(stat_rows),
    }


def get_latest_match_detail_from_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT *
        FROM matches
        ORDER BY start_time DESC
        LIMIT 1
    """)
    match = cur.fetchone()

    if not match:
        conn.close()
        return None

    event_id = match["event_id"]

    cur.execute("""
        SELECT position, team_name, played, wins, draws, losses,
               goals_for, goals_against, goal_diff, points
        FROM standings
        WHERE event_id = ?
        ORDER BY position ASC
    """, (event_id,))
    flat_table = [dict(r) for r in cur.fetchall()]

    lineup_rows = get_lineup_rows_for_event(cur, event_id)

    cur.execute("""
        SELECT period, stat_name, home_value, away_value
        FROM match_stats
        WHERE event_id = ?
        ORDER BY id ASC
    """, (event_id,))
    stat_rows = cur.fetchall()

    conn.close()

    return {
        "event_id": match["event_id"],
        "date": match["date"],
        "time": match["time"],
        "match_info": dict(match),
        "flat_table": flat_table,
        "lineups": build_lineups_from_rows(lineup_rows),
        "stats_by_period": get_stats_by_period_from_rows(stat_rows),
    }


def get_last_used_lineup_for_team(team_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT event_id
        FROM matches
        ORDER BY start_time DESC
        LIMIT 1
    """)
    latest = cur.fetchone()

    if not latest:
        conn.close()
        return []

    event_id = latest["event_id"]

    cur.execute("""
        SELECT player_name, position, rating
        FROM lineups
        WHERE event_id = ?
          AND team_id = ?
          AND COALESCE(is_substitute, 0) = 0
        ORDER BY
            CASE position
                WHEN 'POR' THEN 1
                WHEN 'DEF' THEN 2
                WHEN 'MED' THEN 3
                WHEN 'DEL' THEN 4
                ELSE 5
            END,
            player_name ASC
    """, (event_id, team_id))

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    return rows


@app.route("/")
def index():
    return render_template("main.html")


@app.route("/calendario")
def calendario():
    matches = get_previous_matches_from_db()
    return render_template("calendario.html", matches=matches)


@app.route("/tabla")
def tabla():
    return render_template("tabla.html")


@app.route("/match/<int:event_id>")
def match_detail(event_id):
    return render_template("match_detail.html", event_id=event_id)


@app.route("/api/next-match")
def next_match_route():
    data = get_next_match()
    return jsonify(data or {})


@app.route("/api/previous-matches")
def previous_matches_route():
    return jsonify(get_previous_matches_from_db())


@app.route("/api/last-match-detail")
def last_match_detail():
    detail = get_latest_match_detail_from_db()
    return jsonify(detail or {})


@app.route("/api/match/<int:event_id>")
def match_detail_api(event_id):
    detail = get_match_detail_from_db(event_id)

    if not detail:
        return jsonify({"error": "not found"}), 404

    return jsonify(detail)


@app.route("/api/tabla")
def tabla_api():
    conn = get_connection()
    cur = conn.cursor()

    try:
        latest = cur.execute("""
            SELECT event_id, date, time, tournament_name, season_name
            FROM matches
            WHERE status IN ('finished', 'Ended', 'ended', 'FT', 'Full time')
               OR status LIKE '%finish%'
               OR status LIKE '%Ended%'
            ORDER BY start_time DESC
            LIMIT 1
        """).fetchone()

        if latest is None:
            latest = cur.execute("""
                SELECT event_id, date, time, tournament_name, season_name
                FROM matches
                ORDER BY start_time DESC
                LIMIT 1
            """).fetchone()

        if latest is None:
            return jsonify({
                "table": [],
                "event_id": None,
                "updated": None,
                "message": "No matches found."
            })

        rows = cur.execute("""
            SELECT
                position,
                team_name,
                team_name AS team,
                played,
                wins,
                draws,
                losses,
                goals_for,
                goals_against,
                goal_diff,
                goal_diff AS goal_difference,
                points
            FROM standings
            WHERE event_id = ?
            ORDER BY position ASC
        """, (latest["event_id"],)).fetchall()

        table = [dict(row) for row in rows]

        return jsonify({
            "table": table,
            "event_id": latest["event_id"],
            "updated": latest["date"],
            "tournament_name": latest["tournament_name"],
            "season_name": latest["season_name"]
        })

    finally:
        conn.close()


@app.route("/estadisticas")
def estadisticas():
    return render_template("estadisticas.html")


@app.route("/api/estadisticas")
def api_estadisticas():
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    matches = cur.execute("""
        SELECT
            home_team,
            away_team,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            start_time
        FROM matches
        WHERE home_score IS NOT NULL
          AND away_score IS NOT NULL
          AND (home_team_id = 6106 OR away_team_id = 6106)
        ORDER BY start_time ASC
    """).fetchall()

    if not matches:
        conn.close()
        return jsonify({
            "summary": {},
            "recent_form": [],
            "top_players": [],
            "players": []
        })

    played = len(matches)
    wins = 0
    draws = 0
    losses = 0
    goals_for = 0
    goals_against = 0
    recent_form = []

    for m in matches:
        nac_is_home = m["home_team_id"] == 6106

        nac_score = m["home_score"] if nac_is_home else m["away_score"]
        opp_score = m["away_score"] if nac_is_home else m["home_score"]

        nac_score = nac_score or 0
        opp_score = opp_score or 0

        goals_for += nac_score
        goals_against += opp_score

        if nac_score > opp_score:
            wins += 1
            recent_form.append("W")
        elif nac_score < opp_score:
            losses += 1
            recent_form.append("L")
        else:
            draws += 1
            recent_form.append("D")

    points = wins * 3 + draws

    player_rows = cur.execute("""
        SELECT
            l.player_name,
            COALESCE(s.position, MAX(l.position)) AS position,
            COUNT(l.id) AS appearances,
            ROUND(AVG(l.rating), 2) AS avg_rating,

            COALESCE(s.goals, 0) AS goals,
            COALESCE(s.assists, 0) AS assists,
            COALESCE(s.goals_assists, 0) AS goals_assists,

            COALESCE(s.xg_scored, 0) AS xg_scored,
            COALESCE(s.xa_assisted, 0) AS xa_assisted,
            COALESCE(s.xg_xa, 0) AS xg_xa,

            COALESCE(s.penalty_goals, 0) AS penalty_goals,
            COALESCE(s.penalties_taken, 0) AS penalties_taken,

            COALESCE(s.big_chances_missed, 0) AS big_chances_missed,
            COALESCE(s.big_chances_created, 0) AS big_chances_created,

            COALESCE(s.accurate_passes_per_match, 0) AS accurate_passes_per_match,
            COALESCE(s.accurate_passes_pct, 0) AS accurate_passes_pct,

            COALESCE(s.key_passes_per_match, 0) AS key_passes_per_match,
            COALESCE(s.successful_dribbles_per_match, 0) AS successful_dribbles_per_match,
            COALESCE(s.successful_dribbles_pct, 0) AS successful_dribbles_pct,

            COALESCE(s.penalties_won, 0) AS penalties_won,

            COALESCE(s.tackles_per_match, 0) AS tackles_per_match,
            COALESCE(s.interceptions_per_match, 0) AS interceptions_per_match,
            COALESCE(s.clearances_per_match, 0) AS clearances_per_match,
            COALESCE(s.defensive_contributions_per_match, 0) AS defensive_contributions_per_match,

            COALESCE(s.dispossessed_per_match, 0) AS dispossessed_per_match,

            COALESCE(s.yellow_cards, 0) AS yellow_cards,
            COALESCE(s.red_cards, 0) AS red_cards

        FROM lineups l
        LEFT JOIN season_player_stats s
            ON s.player_name = l.player_name
           AND s.season_name = '2026-I'

        WHERE l.team_id = 6106
          AND l.player_name IS NOT NULL

        GROUP BY l.player_name
        ORDER BY avg_rating DESC, appearances DESC
    """).fetchall()

    players = []

    for row in player_rows:
        players.append({
            "player_name": row["player_name"],
            "position": row["position"],
            "appearances": row["appearances"] or 0,
            "avg_rating": row["avg_rating"] or 0,

            "goals": row["goals"] or 0,
            "assists": row["assists"] or 0,
            "goals_assists": row["goals_assists"] or 0,

            "xg_scored": row["xg_scored"] or 0,
            "xa_assisted": row["xa_assisted"] or 0,
            "xg_xa": row["xg_xa"] or 0,

            "penalty_goals": row["penalty_goals"] or 0,
            "penalties_taken": row["penalties_taken"] or 0,

            "big_chances_missed": row["big_chances_missed"] or 0,
            "big_chances_created": row["big_chances_created"] or 0,

            "accurate_passes_per_match": row["accurate_passes_per_match"] or 0,
            "accurate_passes_pct": row["accurate_passes_pct"] or 0,

            "key_passes_per_match": row["key_passes_per_match"] or 0,
            "successful_dribbles_per_match": row["successful_dribbles_per_match"] or 0,
            "successful_dribbles_pct": row["successful_dribbles_pct"] or 0,

            "penalties_won": row["penalties_won"] or 0,

            "tackles_per_match": row["tackles_per_match"] or 0,
            "interceptions_per_match": row["interceptions_per_match"] or 0,
            "clearances_per_match": row["clearances_per_match"] or 0,
            "defensive_contributions_per_match": row["defensive_contributions_per_match"] or 0,

            "dispossessed_per_match": row["dispossessed_per_match"] or 0,

            "yellow_cards": row["yellow_cards"] or 0,
            "red_cards": row["red_cards"] or 0,
        })

    top_players = sorted(
        players,
        key=lambda p: (p["avg_rating"], p["appearances"]),
        reverse=True
    )[:8]

    conn.close()

    return jsonify({
        "summary": {
            "played": played,
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "goals_for": goals_for,
            "goals_against": goals_against,
            "goal_diff": goals_for - goals_against,
            "points": points,
            "goals_per_game": round(goals_for / played, 2) if played else 0,
            "goals_against_per_game": round(goals_against / played, 2) if played else 0
        },
        "recent_form": recent_form[-5:],
        "top_players": top_players,
        "players": players
    })


@app.route("/plantel")
def plantel():
    return render_template("plantel.html")


@app.route("/api/plantel")
def plantel_api():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            player_name,
            MAX(player_id) AS player_id,
            MAX(position) AS position,
            MAX(shirt_number) AS shirt_number,
            COUNT(*) AS appearances,
            ROUND(AVG(rating), 2) AS avg_rating
        FROM lineups
        WHERE team_id = 6106
          AND player_name IS NOT NULL
        GROUP BY player_name
        ORDER BY
            CASE MAX(position)
                WHEN 'POR' THEN 1
                WHEN 'DEF' THEN 2
                WHEN 'MED' THEN 3
                WHEN 'DEL' THEN 4
                ELSE 5
            END,
            appearances DESC,
            avg_rating DESC,
            player_name ASC
    """)

    players = [dict(r) for r in cur.fetchall()]
    conn.close()

    HEADSHOTS = {
        "David Ospina": "https://images.fotmob.com/image_resources/playerimages/50065.png",
        "Harlen Castillo": "https://images.fotmob.com/image_resources/playerimages/1435218.png",
        "Kevin Cataño": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
        "Kevin Catano": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
        "Kevin Castaño": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
        "Kevin Castano": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
        "Andrés Román": "https://images.fotmob.com/image_resources/playerimages/925847.png",
        "Andres Roman": "https://images.fotmob.com/image_resources/playerimages/925847.png",
        "Milton Casco": "https://images.fotmob.com/image_resources/playerimages/174813.png",
        "César Haydar": "https://images.fotmob.com/image_resources/playerimages/1139171.png",
        "Cesar Haydar": "https://images.fotmob.com/image_resources/playerimages/1139171.png",
        "William Tesillo": "https://images.fotmob.com/image_resources/playerimages/207383.png",
        "Wiliam Tesillo": "https://images.fotmob.com/image_resources/playerimages/207383.png",
        "Samuel Velásquez": "https://images.fotmob.com/image_resources/playerimages/1433031.png",
        "Samuel Velasquez": "https://images.fotmob.com/image_resources/playerimages/1433031.png",
        "Juan Manuel Rengifo": "https://images.fotmob.com/image_resources/playerimages/1798773.png",
        "Jorman Campuzano": "https://images.fotmob.com/image_resources/playerimages/922875.png",
        "Edwin Cardona": "https://images.fotmob.com/image_resources/playerimages/177507.png",
        "Andrés Sarmiento": "https://images.fotmob.com/image_resources/playerimages/942987.png",
        "Andres Sarmiento": "https://images.fotmob.com/image_resources/playerimages/942987.png",
        "Nicolás Rodríguez": "https://images.fotmob.com/image_resources/playerimages/1460577.png",
        "Nicolas Rodriguez": "https://images.fotmob.com/image_resources/playerimages/1460577.png",
        "Juan Zapata": "https://images.fotmob.com/image_resources/playerimages/1199834.png",
        "Marlos Moreno": "https://images.fotmob.com/image_resources/playerimages/677249.png",
        "Cristian Arango": "https://images.fotmob.com/image_resources/playerimages/452368.png",
        "Eduard Bello": "https://images.fotmob.com/image_resources/playerimages/495825.png",
        "Matías Lozano": "https://images.fotmob.com/image_resources/playerimages/1895028.png",
        "Matias Lozano": "https://images.fotmob.com/image_resources/playerimages/1895028.png",
        "Alfredo Morelos": "https://images.fotmob.com/image_resources/playerimages/579660.png",
        "Dairon Asprilla": "https://images.fotmob.com/image_resources/playerimages/425783.png",
    }

    for player in players:
        name = player.get("player_name") or ""
        player["image_url"] = HEADSHOTS.get(name)

    return jsonify({"players": players})


@app.route("/next-match")
def next_match_page():
    return render_template("next_match.html")


@app.route("/api/next-match/detail")
def next_match_detail():
    next_match = get_next_match()

    if not next_match:
        return jsonify({"error": "No next match found"}), 404

    event_id = next_match.get("event_id")
    odds = {"choices": []}

    if event_id:
        try:
            time.sleep(0.5)
            raw_odds = get_odds(event_id)
            odds = get_main_odds_market_from_markets(raw_odds)
        except Exception as e:
            print("Error fetching odds:", e)

    nacional_last_xi = get_last_used_lineup_for_team(TEAM_ID)

    return jsonify({
        "match": next_match,
        "odds": odds,
        "nacional_last_xi": nacional_last_xi
    })


@app.route("/api/top-performer-last-five")
def top_performer_last_five():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT event_id
        FROM matches
        ORDER BY start_time DESC
        LIMIT 5
    """)
    recent_matches = [row["event_id"] for row in cur.fetchall()]

    if not recent_matches:
        conn.close()
        return jsonify({"player": None})

    placeholders = ",".join(["?"] * len(recent_matches))

    query = f"""
        SELECT
            player_name,
            MAX(position) AS position,
            COUNT(*) AS matches_played,
            ROUND(AVG(rating), 2) AS avg_rating,
            COALESCE(SUM(goals), 0) AS goals,
            COALESCE(SUM(assists), 0) AS assists
        FROM lineups
        WHERE team_id = 6106
          AND rating IS NOT NULL
          AND event_id IN ({placeholders})
        GROUP BY player_name
        HAVING COUNT(*) >= 2
        ORDER BY avg_rating DESC, matches_played DESC
        LIMIT 1
    """

    cur.execute(query, recent_matches)
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"player": None})

    player = dict(row)

    HEADSHOTS = {
        "Ospina": "https://images.fotmob.com/image_resources/playerimages/50065.png",
        "Castillo": "https://images.fotmob.com/image_resources/playerimages/1435218.png",
        "Cataño": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
        "Castaño": "https://images.fotmob.com/image_resources/playerimages/1886618.png",
        "Román": "https://images.fotmob.com/image_resources/playerimages/925847.png",
        "Roman": "https://images.fotmob.com/image_resources/playerimages/925847.png",
        "Casco": "https://images.fotmob.com/image_resources/playerimages/174813.png",
        "García": "https://images.fotmob.com/image_resources/playerimages/1579303.png",
        "Garcia": "https://images.fotmob.com/image_resources/playerimages/1579303.png",
        "Tesillo": "https://images.fotmob.com/image_resources/playerimages/207383.png",
        "Campuzano": "https://images.fotmob.com/image_resources/playerimages/922875.png",
        "Uribe": "https://images.fotmob.com/image_resources/playerimages/320618.png",
        "Cardona": "https://images.fotmob.com/image_resources/playerimages/177507.png",
        "Arango": "https://images.fotmob.com/image_resources/playerimages/452368.png",
        "Bello": "https://images.fotmob.com/image_resources/playerimages/495825.png",
        "Morelos": "https://images.fotmob.com/image_resources/playerimages/579660.png",
        "Asprilla": "https://images.fotmob.com/image_resources/playerimages/425783.png",
        "Rengifo": "https://images.fotmob.com/image_resources/playerimages/1798773.png",
    }

    image_url = None
    name = player.get("player_name") or ""

    for key, url in HEADSHOTS.items():
        if key.lower() in name.lower():
            image_url = url
            break

    player["image_url"] = image_url

    return jsonify({"player": player})


@app.route("/api/match/<int:event_id>/player/<int:player_id>")
def match_player_detail_api(event_id, player_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            player_id,
            player_name,
            position,
            rating,
            team_id,
            team_name,
            team_side,
            shirt_number,
            goals,
            assists,
            yellow_cards,
            red_cards,
            is_substitute,
            subbed_in,
            subbed_out,
            goal_minute,
            assist_minute,
            yellow_card_minute,
            red_card_minute,
            subbed_in_minute,
            subbed_out_minute
        FROM lineups
        WHERE event_id = ?
          AND player_id = ?
          AND team_id = 6106
        LIMIT 1
    """, (event_id, player_id))

    player = cur.fetchone()

    if not player:
        conn.close()
        return jsonify({"error": "Player not found"}), 404

    cur.execute("""
        SELECT stat_name, stat_value, stat_group
        FROM player_match_stats
        WHERE event_id = ?
          AND player_id = ?
          AND team_id = 6106
        ORDER BY stat_group, stat_name
    """, (event_id, player_id))

    stats = [dict(r) for r in cur.fetchall()]
    conn.close()

    stats_dict = {row["stat_name"]: row["stat_value"] for row in stats}

    return jsonify({
        "player_id": player["player_id"],
        "name": player["player_name"],
        "position": player["position"],
        "rating": player["rating"],
        "team_id": player["team_id"],
        "team_name": player["team_name"],
        "team_side": player["team_side"],
        "shirt_number": player["shirt_number"],

        "goals": int_from_db(player["goals"]),
        "assists": int_from_db(player["assists"]),
        "yellow_cards": int_from_db(player["yellow_cards"]),
        "red_cards": int_from_db(player["red_cards"]),

        "is_substitute": int_from_db(player["is_substitute"]),
        "subbed_in": bool_from_db(player["subbed_in"]),
        "subbed_out": bool_from_db(player["subbed_out"]),

        "goal_minute": player["goal_minute"] or stats_dict.get("goal_minute"),
        "goal_minutes": player["goal_minute"] or stats_dict.get("goal_minute"),
        
        "assist_minute": player["assist_minute"] or stats_dict.get("assist_minute"),
        "assist_minutes": player["assist_minute"] or stats_dict.get("assist_minute"),
        
        "yellow_card_minute": player["yellow_card_minute"] or stats_dict.get("yellow_card_minute"),
        "yellow_card_minutes": player["yellow_card_minute"] or stats_dict.get("yellow_card_minute"),
        
        "red_card_minute": player["red_card_minute"] or stats_dict.get("red_card_minute"),
        "red_card_minutes": player["red_card_minute"] or stats_dict.get("red_card_minute"),
        
        "subbed_in_minute": player["subbed_in_minute"] or stats_dict.get("subbed_in_minute") or stats_dict.get("sub_in_minute"),
        "subbed_out_minute": player["subbed_out_minute"] or stats_dict.get("subbed_out_minute") or stats_dict.get("sub_out_minute"),

        "stats": stats
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))