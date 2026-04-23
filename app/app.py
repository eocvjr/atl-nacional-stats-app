from flask import Flask, jsonify, render_template
from flask_cors import CORS
from .api import get_next_match, get_odds, get_lineups, get_main_odds_market_from_markets
from .db import get_connection
import os
import time

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)


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

    cur.execute("""
        SELECT team_side, player_name, position, rating
        FROM lineups
        WHERE event_id = ?
    """, (event_id,))
    lineup_rows = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT period, stat_name, home_value, away_value
        FROM match_stats
        WHERE event_id = ?
    """, (event_id,))
    stat_rows = [dict(r) for r in cur.fetchall()]

    conn.close()

    lineups = {"home_xi": [], "away_xi": []}
    for row in lineup_rows:
        player = {
            "name": row["player_name"],
            "position": row["position"],
            "rating": row["rating"],
        }
        if row["team_side"] == "home":
            lineups["home_xi"].append(player)
        else:
            lineups["away_xi"].append(player)

    stats_by_period = {"TOTAL": [], "1T": [], "2T": []}
    for row in stat_rows:
        stats_by_period.setdefault(row["period"], []).append({
            "name": row["stat_name"],
            "home": row["home_value"],
            "away": row["away_value"],
        })

    return {
        "event_id": match["event_id"],
        "date": match["date"],
        "time": match["time"],
        "match_info": dict(match),
        "flat_table": flat_table,
        "lineups": lineups,
        "stats_by_period": stats_by_period,
    }


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

    cur.execute("""
        SELECT team_side, player_name, position, rating
        FROM lineups
        WHERE event_id = ?
    """, (event_id,))
    lineup_rows = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT period, stat_name, home_value, away_value
        FROM match_stats
        WHERE event_id = ?
    """, (event_id,))
    stat_rows = [dict(r) for r in cur.fetchall()]

    conn.close()

    lineups = {"home_xi": [], "away_xi": []}
    for row in lineup_rows:
        player = {
            "name": row["player_name"],
            "position": row["position"],
            "rating": row["rating"],
        }
        if row["team_side"] == "home":
            lineups["home_xi"].append(player)
        else:
            lineups["away_xi"].append(player)

    stats_by_period = {"TOTAL": [], "1T": [], "2T": []}
    for row in stat_rows:
        stats_by_period.setdefault(row["period"], []).append({
            "name": row["stat_name"],
            "home": row["home_value"],
            "away": row["away_value"],
        })

    return {
        "event_id": match["event_id"],
        "date": match["date"],
        "time": match["time"],
        "match_info": dict(match),
        "flat_table": flat_table,
        "lineups": lineups,
        "stats_by_period": stats_by_period,
    }


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

    cur.execute("""
        SELECT event_id
        FROM matches
        ORDER BY start_time DESC
        LIMIT 1
    """)
    latest = cur.fetchone()

    if not latest:
        conn.close()
        return jsonify({"table": []})

    cur.execute("""
        SELECT position,
               team_name AS team,
               played,
               wins,
               draws,
               losses,
               goals_for,
               goals_against,
               goal_diff AS goal_difference,
               points
        FROM standings
        WHERE event_id = ?
        ORDER BY position ASC
    """, (latest["event_id"],))

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    return jsonify({"table": rows})


@app.route("/api/next-match/detail")
def next_match_detail():
    next_match = get_next_match()
    if not next_match:
        return jsonify({"error": "No next match found"}), 404

    event_id = next_match.get("event_id")
    if not event_id:
        return jsonify({"error": "No event ID"}), 404

    time.sleep(0.5)
    odds = get_odds(event_id)
    time.sleep(0.5)
    lineups = get_lineups(event_id)

    main_odds = get_main_odds_market_from_markets(odds)

    return jsonify({
        "match": next_match,
        "odds": main_odds,
        "lineups": lineups,
    })

@app.route("/estadisticas")
def estadisticas():
    return render_template("estadisticas.html")


@app.route("/api/estadisticas")
def estadisticas_api():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT event_id, home_team, away_team, home_score, away_score, start_time
        FROM matches
        ORDER BY start_time ASC
    """)
    matches = [dict(r) for r in cur.fetchall()]

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
        nac_is_home = m["home_team"] == "Atlético Nacional"
        nac_score = m["home_score"] if nac_is_home else m["away_score"]
        opp_score = m["away_score"] if nac_is_home else m["home_score"]

        goals_for += nac_score or 0
        goals_against += opp_score or 0

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

    cur.execute("""
        SELECT
            player_name,
            COUNT(*) AS appearances,
            ROUND(AVG(rating), 2) AS avg_rating
        FROM lineups
        WHERE team_id = 6106 AND rating IS NOT NULL
        GROUP BY player_name
        ORDER BY avg_rating DESC, appearances DESC
        LIMIT 8
    """)
    top_players = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT
            player_name,
            MAX(position) AS position,
            COUNT(*) AS appearances,
            ROUND(AVG(rating), 2) AS avg_rating
        FROM lineups
        WHERE team_id = 6106
        GROUP BY player_name
        ORDER BY player_name ASC
    """)
    players = [dict(r) for r in cur.fetchall()]

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
            MAX(position) AS position,
            COUNT(*) AS appearances,
            ROUND(AVG(rating), 2) AS avg_rating
        FROM lineups
        WHERE team_id = 6106
        GROUP BY player_name
        ORDER BY appearances DESC, avg_rating DESC, player_name ASC
    """)
    players = [dict(r) for r in cur.fetchall()]

    conn.close()

    return jsonify({"players": players})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))