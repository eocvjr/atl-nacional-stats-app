import time
from .db import get_connection
from .api import (
    TEAM_ID,
    safe_get_json,
    BASE,
    get_full_match_center,
    format_timestamp,
)

PAST_FIXTURE_DATES = [
    "2026-01-17",
    "2026-02-04",
    "2026-02-12",
    "2026-02-15",
    "2026-02-21",
    "2026-02-25",
    "2026-03-01",
    "2026-03-07",
    "2026-03-10",
    "2026-03-13",
    "2026-03-17",
    "2026-03-21",
    "2026-03-29",
    "2026-04-01",
    "2026-04-06",
    "2026-04-11",
    "2026-04-20",
]


def find_nacional_match_on_date(match_date, team_id=TEAM_ID):
    url = f"{BASE}/api/v1/sport/football/scheduled-events/{match_date}"
    data = safe_get_json(url)

    if isinstance(data, dict) and data.get("_rate_limited"):
        print(f"Rate limited on {match_date}, stopping.")
        return None

    for event in data.get("events", []):
        home_id = event.get("homeTeam", {}).get("id")
        away_id = event.get("awayTeam", {}).get("id")
        status_type = event.get("status", {}).get("type")

        if home_id == team_id or away_id == team_id:
            print(
                match_date,
                event.get("homeTeam", {}).get("name"),
                "vs",
                event.get("awayTeam", {}).get("name"),
                "| status.type =",
                status_type
            )

            if status_type == "finished":
                return event

    return None


def save_match(cur, event_id, match_data, match_date_str, match_time_str):
    info = match_data["match_info"]

    cur.execute("""
    INSERT OR REPLACE INTO matches (
        event_id, home_team, away_team, home_team_id, away_team_id,
        home_score, away_score, status, start_time, date, time,
        tournament_name, country_name, season_name, stadium
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        info.get("home_team"),
        info.get("away_team"),
        info.get("home_team_id"),
        info.get("away_team_id"),
        info.get("home_score"),
        info.get("away_score"),
        info.get("status"),
        info.get("start_time"),
        match_date_str,
        match_time_str,
        info.get("tournament_name"),
        info.get("country_name"),
        info.get("season_name"),
        info.get("stadium"),
    ))


def save_standings(cur, event_id, flat_table):
    cur.execute("DELETE FROM standings WHERE event_id = ?", (event_id,))

    for row in flat_table:
        cur.execute("""
        INSERT INTO standings (
            event_id, position, team_name, played, wins, draws, losses,
            goals_for, goals_against, goal_diff, points
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event_id,
            row.get("position"),
            row.get("team_name"),
            row.get("played"),
            row.get("wins"),
            row.get("draws"),
            row.get("losses"),
            row.get("goals_for"),
            row.get("goals_against"),
            row.get("goal_diff"),
            row.get("points"),
        ))


def save_lineups(cur, event_id, lineups):
    cur.execute("DELETE FROM lineups WHERE event_id = ?", (event_id,))

    for side_key, players in [("home", lineups.get("home_xi", [])), ("away", lineups.get("away_xi", []))]:
        for player in players:
            cur.execute("""
            INSERT INTO lineups (
                event_id, team_side, player_name, position, rating
            ) VALUES (?, ?, ?, ?, ?)
            """, (
                event_id,
                side_key,
                player.get("name"),
                player.get("position"),
                player.get("rating"),
            ))


def save_stats(cur, event_id, stats_by_period):
    cur.execute("DELETE FROM match_stats WHERE event_id = ?", (event_id,))

    for period, stats in stats_by_period.items():
        for stat in stats:
            cur.execute("""
            INSERT INTO match_stats (
                event_id, period, stat_name, home_value, away_value
            ) VALUES (?, ?, ?, ?, ?)
            """, (
                event_id,
                period,
                stat.get("name"),
                str(stat.get("home")),
                str(stat.get("away")),
            ))


def ingest_matches():
    conn = get_connection()
    cur = conn.cursor()

    inserted = 0

    for match_date in PAST_FIXTURE_DATES:
        print(f"Fetching {match_date}...")
        event = find_nacional_match_on_date(match_date)

        if not event:
            print(f"No match found on {match_date}, skipping.")
            time.sleep(1)
            continue

        event_id = event.get("id")
        tournament = event.get("tournament", {})
        season = event.get("season", {})
        tournament_id = tournament.get("uniqueTournament", {}).get("id")
        season_id = season.get("id")

        print(f"Found match ID {event_id}, fetching full data...")
        time.sleep(1)

        match_data = get_full_match_center(event_id, tournament_id, season_id)
        match_data["match_info"]["start_time"] = event.get("startTimestamp")

        match_date_str, match_time_str = format_timestamp(event.get("startTimestamp"))

        save_match(cur, event_id, match_data, match_date_str, match_time_str)
        save_standings(cur, event_id, match_data.get("flat_table", []))
        save_lineups(cur, event_id, match_data.get("lineups", {}))
        save_stats(cur, event_id, match_data.get("stats_by_period", {}))

        inserted += 1
        print(f"Saved: {match_data['match_info']['home_team']} vs {match_data['match_info']['away_team']}")
        time.sleep(2)

    conn.commit()
    conn.close()
    print(f"Ingestion complete. Saved {inserted} matches.")


if __name__ == "__main__":
    ingest_matches()