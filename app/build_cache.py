import json
import time
from datetime import date
from api import (
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
        if home_id == team_id or away_id == team_id:
            return event

    return None


def build_cache():
    cache = {"matches": []}

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
        match_date_str, match_time_str = format_timestamp(event.get("startTimestamp"))

        cache["matches"].append({
            "event_id": event_id,
            "date": match_date_str,
            "time": match_time_str,
            "match_info": match_data["match_info"],
            "flat_table": match_data["flat_table"],
            "lineups": match_data["lineups"],
            "main_odds_market": match_data["main_odds_market"],
            "stats_by_period": match_data["stats_by_period"],
            "team_positions": match_data["team_positions"],
        })

        print(f"Done: {match_data['match_info']['home_team']} vs {match_data['match_info']['away_team']}")
        time.sleep(2)  # be gentle with the API

    with open("cache.json", "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    print(f"\nCache built successfully with {len(cache['matches'])} matches.")


if __name__ == "__main__":
    build_cache()