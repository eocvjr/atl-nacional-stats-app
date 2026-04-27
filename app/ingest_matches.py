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
    "2026-04-25",
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
                status_type,
            )

            if status_type == "finished":
                return event

    return None


def ensure_lineup_event_columns(cur):
    """
    Adds lineup columns if local DB was created before event/minute support.
    """
    cur.execute("PRAGMA table_info(lineups)")
    existing_columns = {row[1] for row in cur.fetchall()}

    columns_to_add = {
        "yellow_cards": "INTEGER DEFAULT 0",
        "red_cards": "INTEGER DEFAULT 0",
        "is_substitute": "INTEGER DEFAULT 0",
        "subbed_in": "INTEGER DEFAULT 0",
        "subbed_out": "INTEGER DEFAULT 0",

        "goal_minute": "TEXT",
        "assist_minute": "TEXT",
        "yellow_card_minute": "TEXT",
        "red_card_minute": "TEXT",
        "subbed_in_minute": "TEXT",
        "subbed_out_minute": "TEXT",
    }

    for column_name, column_type in columns_to_add.items():
        if column_name not in existing_columns:
            print(f"Adding missing lineups column: {column_name}")
            cur.execute(f"ALTER TABLE lineups ADD COLUMN {column_name} {column_type}")


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


def get_player_id(player):
    return (
        player.get("player_id")
        or player.get("id")
        or player.get("playerId")
    )


def get_shirt_number(player):
    return (
        player.get("shirt_number")
        or player.get("jerseyNumber")
        or player.get("shirtNumber")
        or player.get("jersey_number")
        or player.get("number")
    )


def get_player_stat(player, *keys):
    stats = player.get("statistics") or player.get("stats") or {}

    for key in keys:
        value = player.get(key)

        if value is not None:
            try:
                return int(value)
            except (TypeError, ValueError):
                return 0

        value = stats.get(key)

        if value is not None:
            try:
                return int(value)
            except (TypeError, ValueError):
                return 0

    return 0

def get_player_text_stat(player, *keys):
    stats = player.get("statistics") or player.get("stats") or {}

    for key in keys:
        value = player.get(key)

        if value is not None and value != "":
            return str(value)

        value = stats.get(key)

        if value is not None and value != "":
            return str(value)

    return None

def get_all_lineup_groups(match_data):
    """
    Returns starters and substitutes for both teams in one consistent structure.

    The important change:
    - home_xi / away_xi are starters
    - home_subs / away_subs are substitutes
    """
    info = match_data["match_info"]
    lineups = match_data.get("lineups", {})

    return [
        {
            "side": "home",
            "team_id": info.get("home_team_id"),
            "team_name": info.get("home_team"),
            "players": lineups.get("home_xi", []),
            "is_substitute": 0,
        },
        {
            "side": "away",
            "team_id": info.get("away_team_id"),
            "team_name": info.get("away_team"),
            "players": lineups.get("away_xi", []),
            "is_substitute": 0,
        },
        {
            "side": "home",
            "team_id": info.get("home_team_id"),
            "team_name": info.get("home_team"),
            "players": lineups.get("home_subs", []),
            "is_substitute": 1,
        },
        {
            "side": "away",
            "team_id": info.get("away_team_id"),
            "team_name": info.get("away_team"),
            "players": lineups.get("away_subs", []),
            "is_substitute": 1,
        },
    ]


def save_lineups(cur, event_id, match_data):
    cur.execute("DELETE FROM lineups WHERE event_id = ?", (event_id,))

    teams = get_all_lineup_groups(match_data)

    for team in teams:
        for player in team["players"]:
            goals = get_player_stat(player, "goals", "goal")
            assists = get_player_stat(player, "goalAssist", "assists", "goal_assist")
            yellow_cards = get_player_stat(player, "yellow_cards", "yellowCards", "yellowCard")
            red_cards = get_player_stat(player, "red_cards", "redCards", "redCard")

            cur.execute("""
                INSERT INTO lineups (
                    event_id,
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event_id,
                team["side"],
                team["team_id"],
                team["team_name"],
                get_player_id(player),
                player.get("name") or player.get("player_name"),
                get_shirt_number(player),
                player.get("position"),
                player.get("rating"),
                goals,
                assists,
                yellow_cards,
                red_cards,
                team["is_substitute"],
                1 if player.get("subbed_in") else 0,
                1 if player.get("subbed_out") else 0,

                get_player_text_stat(player, "goal_minute", "goal_minutes"),
                get_player_text_stat(player, "assist_minute", "assist_minutes"),
                get_player_text_stat(player, "yellow_card_minute", "yellow_card_minutes"),
                get_player_text_stat(player, "red_card_minute", "red_card_minutes"),
                get_player_text_stat(player, "subbed_in_minute", "sub_in_minute"),
                get_player_text_stat(player, "subbed_out_minute", "sub_out_minute"),
            ))

def save_player_match_stats(cur, event_id, match_data):
    cur.execute("DELETE FROM player_match_stats WHERE event_id = ?", (event_id,))

    teams = get_all_lineup_groups(match_data)

    for team in teams:
        # Detailed player stats only for Atlético Nacional
        if team["team_id"] != TEAM_ID:
            continue

        for player in team["players"]:
            stats = dict(player.get("statistics") or player.get("stats") or {})
            player_id = get_player_id(player)

            extra_stats = {
                "goals": get_player_stat(player, "goals", "goal"),
                "assists": get_player_stat(player, "goalAssist", "assists", "goal_assist"),
                "yellow_cards": get_player_stat(player, "yellow_cards", "yellowCards", "yellowCard"),
                "red_cards": get_player_stat(player, "red_cards", "redCards", "redCard"),
                "is_substitute": team["is_substitute"],
                "subbed_in": 1 if player.get("subbed_in") else 0,
                "subbed_out": 1 if player.get("subbed_out") else 0,
                "goal_minute": get_player_text_stat(player, "goal_minute", "goal_minutes"),
                "assist_minute": get_player_text_stat(player, "assist_minute", "assist_minutes"),
                "yellow_card_minute": get_player_text_stat(player, "yellow_card_minute", "yellow_card_minutes"),
                "red_card_minute": get_player_text_stat(player, "red_card_minute", "red_card_minutes"),
                "subbed_in_minute": get_player_text_stat(player, "subbed_in_minute", "sub_in_minute"),
                "subbed_out_minute": get_player_text_stat(player, "subbed_out_minute", "sub_out_minute"),
}

            if player.get("minutes_played") is not None:
                extra_stats["minutes_played"] = player.get("minutes_played")

            if player.get("xg") is not None:
                extra_stats["xg"] = player.get("xg")

            if player.get("xa") is not None:
                extra_stats["xa"] = player.get("xa")

            stats.update(extra_stats)

            for stat_name, stat_value in stats.items():
                if stat_value is None:
                    continue

                cur.execute("""
                    INSERT INTO player_match_stats (
                        event_id,
                        team_id,
                        team_name,
                        player_id,
                        player_name,
                        position,
                        stat_name,
                        stat_value,
                        stat_group
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event_id,
                    team["team_id"],
                    team["team_name"],
                    player_id,
                    player.get("name") or player.get("player_name"),
                    player.get("position"),
                    stat_name,
                    str(stat_value),
                    None,
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

    ensure_lineup_event_columns(cur)

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
        save_lineups(cur, event_id, match_data)
        save_player_match_stats(cur, event_id, match_data)
        save_stats(cur, event_id, match_data.get("stats_by_period", {}))

        inserted += 1

        home_subs_count = len(match_data.get("lineups", {}).get("home_subs", []))
        away_subs_count = len(match_data.get("lineups", {}).get("away_subs", []))

        print(
            f"Saved: {match_data['match_info']['home_team']} vs {match_data['match_info']['away_team']} "
            f"| home_subs={home_subs_count} away_subs={away_subs_count}"
        )

        time.sleep(2)

    conn.commit()
    conn.close()
    print(f"Ingestion complete. Saved {inserted} matches.")


if __name__ == "__main__":
    ingest_matches()