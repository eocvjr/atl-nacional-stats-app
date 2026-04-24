import time

from .db import get_connection
from .api import BASE, safe_get_json


NACIONAL_ID = 6106
UNIQUE_TOURNAMENT_ID = 11539
SEASON_ID = 88503
SEASON_NAME = "2026-I"


def safe_num(value, default=0):
    if value is None:
        return default

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value, default=0):
    if value is None:
        return default

    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def per_match(total, appearances):
    total = safe_num(total)
    appearances = safe_num(appearances)

    if not appearances:
        return 0

    return round(total / appearances, 1)


def get_nacional_players_from_db():
    conn = get_connection()
    cur = conn.cursor()

    rows = cur.execute("""
        SELECT
            player_id,
            player_name,
            position,
            COUNT(*) AS appearances_db,
            ROUND(AVG(rating), 2) AS avg_rating_db
        FROM lineups
        WHERE team_id = ?
          AND player_id IS NOT NULL
          AND player_name IS NOT NULL
        GROUP BY player_id, player_name, position
        ORDER BY player_name
    """, (NACIONAL_ID,)).fetchall()

    conn.close()
    return rows


def fetch_player_season_stats(player_id):
    url = (
        f"{BASE}/api/v1/player/{player_id}/unique-tournament/"
        f"{UNIQUE_TOURNAMENT_ID}/season/{SEASON_ID}/statistics/overall"
    )

    data = safe_get_json(url)

    if not isinstance(data, dict):
        return {}

    if data.get("_rate_limited"):
        return {"_rate_limited": True}

    return data.get("statistics", {}) or {}


def upsert_player_stats(player_row, stats):
    player_id, player_name, position, appearances_db, avg_rating_db = player_row

    appearances = safe_int(stats.get("appearances"), appearances_db or 0)
    avg_rating = safe_num(stats.get("rating"), avg_rating_db or 0)

    goals = safe_int(stats.get("goals"))
    assists = safe_int(stats.get("assists"))
    goals_assists = safe_int(stats.get("goalsAssistsSum"), goals + assists)

    xg_scored = safe_num(stats.get("expectedGoals"))
    xa_assisted = safe_num(stats.get("expectedAssists"))
    xg_xa = round(xg_scored + xa_assisted, 2)

    penalty_goals = safe_int(stats.get("penaltyGoals"))
    penalties_taken = safe_int(stats.get("penaltiesTaken"))

    big_chances_missed = safe_int(stats.get("bigChancesMissed"))
    big_chances_created = safe_int(stats.get("bigChancesCreated"))

    accurate_passes = safe_num(stats.get("accuratePasses"))
    accurate_passes_pct = safe_num(stats.get("accuratePassesPercentage"))
    accurate_passes_per_match = per_match(accurate_passes, appearances)

    key_passes_total = safe_num(
        stats.get("keyPasses")
        or stats.get("totalAttemptAssist")
    )
    key_passes_per_match = per_match(key_passes_total, appearances)

    successful_dribbles_total = safe_num(
        stats.get("successfulDribbles")
        or stats.get("wonContest")
    )
    successful_dribbles_per_match = per_match(successful_dribbles_total, appearances)
    successful_dribbles_pct = safe_num(stats.get("successfulDribblesPercentage"))

    penalties_won = safe_int(
        stats.get("penaltyWon")
        or stats.get("penaltiesWon")
    )

    tackles_total = safe_num(
        stats.get("tackles")
        or stats.get("totalTackle")
    )
    interceptions_total = safe_num(
        stats.get("interceptions")
        or stats.get("interceptionWon")
    )
    clearances_total = safe_num(
        stats.get("clearances")
        or stats.get("totalClearance")
    )

    tackles_per_match = per_match(tackles_total, appearances)
    interceptions_per_match = per_match(interceptions_total, appearances)
    clearances_per_match = per_match(clearances_total, appearances)

    defensive_contributions_per_match = round(
        tackles_per_match + interceptions_per_match + clearances_per_match,
        1
    )

    dispossessed_total = safe_num(
        stats.get("dispossessed")
        or stats.get("possessionLostCtrl")
    )
    dispossessed_per_match = per_match(dispossessed_total, appearances)

    yellow_cards = safe_int(stats.get("yellowCards"))
    red_cards = safe_int(
        stats.get("redCards")
        or stats.get("directRedCards")
    )

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO season_player_stats (
            player_name,
            position,
            team_name,
            season_name,

            avg_rating,
            appearances,

            goals,
            assists,
            goals_assists,

            xg_scored,
            xa_assisted,
            xg_xa,

            penalty_goals,
            penalties_taken,

            big_chances_missed,
            big_chances_created,

            accurate_passes_per_match,
            accurate_passes_pct,

            key_passes_per_match,
            successful_dribbles_per_match,
            successful_dribbles_pct,

            penalties_won,

            tackles_per_match,
            interceptions_per_match,
            clearances_per_match,
            defensive_contributions_per_match,

            dispossessed_per_match,

            yellow_cards,
            red_cards
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(player_name, season_name)
        DO UPDATE SET
            position=excluded.position,
            team_name=excluded.team_name,

            avg_rating=excluded.avg_rating,
            appearances=excluded.appearances,

            goals=excluded.goals,
            assists=excluded.assists,
            goals_assists=excluded.goals_assists,

            xg_scored=excluded.xg_scored,
            xa_assisted=excluded.xa_assisted,
            xg_xa=excluded.xg_xa,

            penalty_goals=excluded.penalty_goals,
            penalties_taken=excluded.penalties_taken,

            big_chances_missed=excluded.big_chances_missed,
            big_chances_created=excluded.big_chances_created,

            accurate_passes_per_match=excluded.accurate_passes_per_match,
            accurate_passes_pct=excluded.accurate_passes_pct,

            key_passes_per_match=excluded.key_passes_per_match,
            successful_dribbles_per_match=excluded.successful_dribbles_per_match,
            successful_dribbles_pct=excluded.successful_dribbles_pct,

            penalties_won=excluded.penalties_won,

            tackles_per_match=excluded.tackles_per_match,
            interceptions_per_match=excluded.interceptions_per_match,
            clearances_per_match=excluded.clearances_per_match,
            defensive_contributions_per_match=excluded.defensive_contributions_per_match,

            dispossessed_per_match=excluded.dispossessed_per_match,

            yellow_cards=excluded.yellow_cards,
            red_cards=excluded.red_cards
    """, (
        player_name,
        position,
        "Atlético Nacional",
        SEASON_NAME,

        avg_rating,
        appearances,

        goals,
        assists,
        goals_assists,

        xg_scored,
        xa_assisted,
        xg_xa,

        penalty_goals,
        penalties_taken,

        big_chances_missed,
        big_chances_created,

        accurate_passes_per_match,
        accurate_passes_pct,

        key_passes_per_match,
        successful_dribbles_per_match,
        successful_dribbles_pct,

        penalties_won,

        tackles_per_match,
        interceptions_per_match,
        clearances_per_match,
        defensive_contributions_per_match,

        dispossessed_per_match,

        yellow_cards,
        red_cards,
    ))

    conn.commit()
    conn.close()

    print(
        f"Saved {player_name}: "
        f"G {goals}, A {assists}, xG {xg_scored}, xA {xa_assisted}, "
        f"YC {yellow_cards}, RC {red_cards}"
    )


def main():
    players = get_nacional_players_from_db()

    if not players:
        print("No Nacional players with player_id found in lineups.")
        return

    for player in players:
        player_id, player_name, *_ = player

        print(f"Fetching season stats for {player_name} ({player_id})")

        try:
            stats = fetch_player_season_stats(player_id)

            if stats.get("_rate_limited"):
                print("Rate limit reached. Stop and try again later.")
                break

            if not stats:
                print(f"No season stats returned for {player_name}")
                continue

            upsert_player_stats(player, stats)

        except Exception as exc:
            print(f"Error fetching {player_name} ({player_id}): {exc}")

        time.sleep(0.35)

    print("Season player stats ingested.")


if __name__ == "__main__":
    main()