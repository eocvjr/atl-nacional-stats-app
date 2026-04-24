import requests
import time
from datetime import date, datetime
import os
from dotenv import load_dotenv

load_dotenv()

BASE = "https://sportapi7.p.rapidapi.com"
HEADERS = {
    "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
    "X-RapidAPI-Host": "sportapi7.p.rapidapi.com",
}

TODAY = date.today().strftime("%Y-%m-%d")
TEAM_ID = 6106


def safe_get_json(url):
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        return response.json()

    if response.status_code == 429:
        print(f"Rate limit alcanzado: {url} | status=429")
        return {"_rate_limited": True}

    print(f"Request failed: {url} | status={response.status_code}")
    return {}


def format_timestamp(timestamp):
    if not timestamp:
        return "Fecha no disponible", "Hora no disponible"

    try:
        dt = datetime.fromtimestamp(timestamp)
        return dt.strftime("%d/%m/%Y"), dt.strftime("%H:%M")
    except Exception:
        return "Fecha no disponible", "Hora no disponible"


def get_scheduled_events_today():
    url = f"{BASE}/api/v1/sport/football/scheduled-events/{TODAY}"
    data = safe_get_json(url)
    return data.get("events", [])


# Known remaining Liga BetPlay 2026-I fixture dates for Nacional
NACIONAL_FIXTURE_DATES = [
    "2026-04-20",  # Fecha 17 - Nacional vs Bucaramanga
    "2026-04-25",  # Fecha 18 - Pereira vs Nacional
    # Fecha 19 (Once Caldas vs Nacional) - date TBD, add when confirmed
]

def get_next_team_events(team_id, fixture_dates=NACIONAL_FIXTURE_DATES):
    today = date.today()

    for match_date in fixture_dates:
        if match_date < today.strftime("%Y-%m-%d"):
            continue  # skip past dates

        url = f"{BASE}/api/v1/sport/football/scheduled-events/{match_date}"
        data = safe_get_json(url)

        if isinstance(data, dict) and data.get("_rate_limited"):
            return {"_rate_limited": True}

        events = data.get("events", [])

        for event in events:
            home_id = event.get("homeTeam", {}).get("id")
            away_id = event.get("awayTeam", {}).get("id")
            if home_id == team_id or away_id == team_id:
                return [event]

        time.sleep(0.5)

    return []

def find_team_match_today(team_id=TEAM_ID):
    events = get_scheduled_events_today()
    matching_events = []

    for event in events:
        home_team = event.get("homeTeam", {})
        away_team = event.get("awayTeam", {})
        tournament = event.get("tournament", {})
        unique_tournament = tournament.get("uniqueTournament", {})
        season = event.get("season", {})

        home_team_id = home_team.get("id")
        away_team_id = away_team.get("id")

        if home_team_id == team_id or away_team_id == team_id:
            matching_events.append({
                "event_id": event.get("id"),
                "home_team": home_team.get("name"),
                "away_team": away_team.get("name"),
                "home_team_id": home_team_id,
                "away_team_id": away_team_id,
                "tournament_id": unique_tournament.get("id"),
                "season_id": season.get("id"),
                "tournament_name": unique_tournament.get("name"),
                "country_name": tournament.get("category", {}).get("name"),
                "season_name": season.get("name"),
                "start_timestamp": event.get("startTimestamp"),
            })

    return matching_events


def get_match_info(event_id):
    url = f"{BASE}/api/v1/event/{event_id}"
    data = safe_get_json(url)

    if data.get("_rate_limited"):
        return {
            "home_team": "Dato no disponible",
            "away_team": "Dato no disponible",
            "home_team_id": None,
            "away_team_id": None,
            "home_score": 0,
            "away_score": 0,
            "status": "Límite de API alcanzado",
            "start_time": None,
            "tournament_name": "Dato no disponible",
            "country_name": "Dato no disponible",
            "season_name": "Dato no disponible",
            "stadium": None,
        }

    event = data.get("event", {})
    tournament = event.get("tournament", {})
    unique_tournament = tournament.get("uniqueTournament", {})
    season = event.get("season", {})

    home_score = event.get("homeScore", {}).get("current")
    away_score = event.get("awayScore", {}).get("current")

    venue = event.get("venue", {}) or {}
    stadium = (
        venue.get("name")
        or venue.get("stadium", {}).get("name")
        or event.get("ground", {}).get("name")
    )

    return {
        "home_team": event.get("homeTeam", {}).get("name"),
        "away_team": event.get("awayTeam", {}).get("name"),
        "home_team_id": event.get("homeTeam", {}).get("id"),
        "away_team_id": event.get("awayTeam", {}).get("id"),
        "home_score": 0 if home_score is None else home_score,
        "away_score": 0 if away_score is None else away_score,
        "status": event.get("status", {}).get("description"),
        "start_time": event.get("startTimestamp"),
        "tournament_name": unique_tournament.get("name"),
        "country_name": tournament.get("category", {}).get("name"),
        "season_name": season.get("name"),
        "stadium": stadium,
    }

def get_table(tournament_id, season_id):
    url = f"{BASE}/api/v1/unique-tournament/{tournament_id}/season/{season_id}/standings/total"
    data = safe_get_json(url)

    if data.get("_rate_limited"):
        return []

    return data.get("standings", [])


def get_raw_lineups(event_id):
    url = f"{BASE}/api/v1/event/{event_id}/lineups"
    data = safe_get_json(url)

    if data.get("_rate_limited"):
        return {}

    return data


def get_odds(event_id):
    url = f"{BASE}/api/v1/event/{event_id}/odds/1/all"
    data = safe_get_json(url)

    if data.get("_rate_limited"):
        return []

    return data.get("markets", [])


def get_match_stats(event_id):
    url = f"{BASE}/api/v1/event/{event_id}/statistics"
    data = safe_get_json(url)

    if data.get("_rate_limited"):
        return []

    return data.get("statistics", [])


def extract_team_positions(standings_groups, home_team_id, away_team_id):
    result = {
        "home_position": None,
        "away_position": None,
        "home_points": None,
        "away_points": None,
    }

    for group in standings_groups:
        rows = group.get("rows", [])

        for row in rows:
            team = row.get("team", {})
            team_id = team.get("id")

            if team_id == home_team_id:
                result["home_position"] = row.get("position")
                result["home_points"] = row.get("points")

            if team_id == away_team_id:
                result["away_position"] = row.get("position")
                result["away_points"] = row.get("points")

    return result


def flatten_table_rows(standings_groups):
    flat_rows = []

    for group in standings_groups:
        rows = group.get("rows", [])

        for row in rows:
            team = row.get("team", {})
            gf = row.get("scoresFor")
            ga = row.get("scoresAgainst")

            flat_rows.append({
                "position": row.get("position"),
                "team_name": team.get("name"),
                "played": row.get("matches"),
                "wins": row.get("wins"),
                "draws": row.get("draws"),
                "losses": row.get("losses"),
                "goals_for": gf,
                "goals_against": ga,
                "goal_diff": (gf - ga) if gf is not None and ga is not None else None,
                "points": row.get("points"),
            })

    return flat_rows


def fractional_to_decimal(odd_value):
    if odd_value is None:
        return None

    if isinstance(odd_value, (int, float)):
        return f"{float(odd_value):.2f}"

    odd_str = str(odd_value).strip()

    if "/" in odd_str:
        try:
            numerator, denominator = odd_str.split("/")
            decimal = (float(numerator) / float(denominator)) + 1
            return f"{decimal:.2f}"
        except Exception:
            return odd_str

    try:
        return f"{float(odd_str):.2f}"
    except Exception:
        return odd_str


def normalize_choice_name(name):
    mapping = {
        "1": "Local",
        "X": "Empate",
        "2": "Visitante",
    }
    return mapping.get(name, name)


def get_main_odds_market_from_markets(markets):
    for market in markets:
        choices = market.get("choices", [])
        if len(choices) >= 3:
            return {
                "market_name": market.get("marketName") or market.get("name") or "1X2",
                "choices": [
                    {
                        "name": normalize_choice_name(choice.get("name")),
                        "odd": fractional_to_decimal(
                            choice.get("initialFractionalValue")
                            or choice.get("fractionalValue")
                            or choice.get("initialDecimalValue")
                            or choice.get("decimalValue")
                            or choice.get("odds")
                        ),
                    }
                    for choice in choices[:3]
                ]
            }

    return {
        "market_name": None,
        "choices": []
    }


def translate_stat_name(name):
    translations = {
        "Ball possession": "Posesión de balón",
        "Expected goals": "Goles esperados (xG)",
        "Expected goals (xG)": "Goles esperados (xG)",
        "Big chances": "Ocasiones claras",
        "Total shots": "Remates totales",
        "Shots on target": "Remates a puerta",
        "Shots off target": "Remates fuera",
        "Blocked shots": "Remates bloqueados",
        "Goalkeeper saves": "Atajadas del portero",
        "Corner kicks": "Tiros de esquina",
        "Fouls": "Faltas",
        "Passes": "Pases",
        "Accurate passes": "Pases precisos",
        "Tackles": "Entradas",
        "Free kicks": "Tiros libres",
        "Yellow cards": "Tarjetas amarillas",
        "Red cards": "Tarjetas rojas",
        "Offsides": "Fueras de juego",
        "Throw-ins": "Saques de banda",
        "Shots inside box": "Remates dentro del área",
        "Shots outside box": "Remates fuera del área",
        "Hit woodwork": "Balones al palo",
        "Big chances missed": "Ocasiones claras falladas",
        "Fouled in final third": "Faltas recibidas en el último tercio",
        "Final third entries": "Ingresos al último tercio",
        "Long balls": "Balones largos",
        "Crosses": "Centros",
        "Duels": "Duelos",
        "Dispossessed": "Pérdidas de posesión",
        "Ground duels": "Duelos terrestres",
        "Aerial duels": "Duelos aéreos",
        "Dribbles": "Regates",
        "Tackles won": "Entradas ganadas",
        "Total tackles": "Entradas totales",
        "Interceptions": "Intercepciones",
        "Recoveries": "Recuperaciones",
        "Touches in penalty area": "Toques en el área",
        "Final third phase": "Acciones en el último tercio",
        "Goals prevented": "Goles evitados",
        "High claims": "Centros atrapados",
        "Punches": "Despejes de puños",
        "Goal kicks": "Saques de meta",
        "Big chances scored": "Ocasiones claras convertidas",
        "Clearances": "Despejes",
        "Total saves": "Atajadas totales",
    }

    return translations.get(name, name)


REMOVED_STATS = {
    "Remates fuera",
    "Ocasiones claras convertidas",
    "Saques de banda",
    "Pases precisos",
    "Saques de meta",
    "Entradas",
    "Atajadas totales",
}

STAT_ORDER = [
    "Posesión de balón",
    "Goles esperados (xG)",
    "Ocasiones claras",
    "Remates totales",
    "Atajadas del portero",
    "Tiros de esquina",
    "Faltas",
    "Pases",
    "Tiros libres",
    "Tarjetas amarillas",
    "Remates a puerta",
    "Remates bloqueados",
    "Remates dentro del área",
    "Remates fuera del área",
    "Ocasiones claras falladas",
    "Toques en el área",
    "Faltas recibidas en el último tercio",
    "Fueras de juego",
    "Ingresos al último tercio",
    "Acciones en el último tercio",
    "Balones largos",
    "Centros",
    "Duelos",
    "Pérdidas de posesión",
    "Duelos terrestres",
    "Duelos aéreos",
    "Regates",
    "Entradas ganadas",
    "Entradas totales",
    "Intercepciones",
    "Recuperaciones",
    "Balones al palo",
]


def normalize_period(period):
    if period in ("ALL", "TOTAL", "FULL_TIME"):
        return "TOTAL"
    if period in ("1ST", "FIRST_HALF", "FIRST"):
        return "1T"
    if period in ("2ND", "SECOND_HALF", "SECOND"):
        return "2T"
    return str(period)


def flatten_match_stats_by_period(stat_groups):
    stats_by_period = {
        "TOTAL": [],
        "1T": [],
        "2T": [],
    }

    for group in stat_groups:
        period_key = normalize_period(group.get("period"))

        if period_key not in stats_by_period:
            continue

        items = group.get("groups", [])
        seen_names = set()

        for item in items:
            statistics_items = item.get("statisticsItems", [])

            for stat in statistics_items:
                raw_name = stat.get("name")
                translated_name = translate_stat_name(raw_name)
                home = stat.get("home")
                away = stat.get("away")

                if translated_name in REMOVED_STATS:
                    continue

                if translated_name in seen_names:
                    continue

                seen_names.add(translated_name)

                stats_by_period[period_key].append({
                    "name": translated_name,
                    "home": home,
                    "away": away,
                })

    for period_key, stats in stats_by_period.items():
        stats.sort(
            key=lambda x: STAT_ORDER.index(x["name"]) if x["name"] in STAT_ORDER else 999
        )

    return stats_by_period


def get_player_rating(player_obj):
    if not isinstance(player_obj, dict):
        return None

    possible_paths = [
        player_obj.get("rating"),
        player_obj.get("statistics", {}).get("rating"),
        player_obj.get("player", {}).get("rating"),
        player_obj.get("player", {}).get("statistics", {}).get("rating"),
    ]

    for value in possible_paths:
        if value is not None:
            return value

    return None


def normalize_position(pos):
    mapping = {
        "G": "POR",
        "GK": "POR",
        "D": "DEF",
        "M": "MED",
        "F": "DEL",
        "Goalkeeper": "POR",
        "Defender": "DEF",
        "Midfielder": "MED",
        "Forward": "DEL",
    }
    return mapping.get(pos, pos)

def extract_player_statistics(item, player_info):
    stats = {}

    possible_stats = [
        item.get("statistics") if isinstance(item, dict) else None,
        item.get("stats") if isinstance(item, dict) else None,
        player_info.get("statistics") if isinstance(player_info, dict) else None,
        player_info.get("stats") if isinstance(player_info, dict) else None,
    ]

    for candidate in possible_stats:
        if isinstance(candidate, dict):
            stats.update(candidate)

    return stats
def extract_players_from_side(side_data):
    if not isinstance(side_data, dict):
        return []

    candidate_lists = [
        side_data.get("players"),
        side_data.get("startingLineup"),
        side_data.get("starters"),
        side_data.get("lineup"),
    ]

    players = []
    raw_players = None

    for candidate in candidate_lists:
        if isinstance(candidate, list) and candidate:
            raw_players = candidate
            break

    if raw_players is None:
        return players

    for item in raw_players:
        if not isinstance(item, dict):
            continue

        player_info = item.get("player", item)

        if not isinstance(player_info, dict):
            continue

        is_sub = (
            item.get("substitute")
            or item.get("isSubstitute")
            or player_info.get("substitute")
            or player_info.get("isSubstitute")
        )

        if is_sub:
            continue

        name = (
            player_info.get("name")
            or player_info.get("shortName")
            or player_info.get("slug")
            or "Jugador"
        )

        position = (
            item.get("position")
            or player_info.get("position")
            or player_info.get("shortPosition")
        )
        position = normalize_position(position)

        rating = get_player_rating(item)

        if rating is None:
            rating = get_player_rating(player_info)

        statistics = extract_player_statistics(item, player_info)

        player_id = (
            player_info.get("id")
            or item.get("playerId")
            or item.get("id")
        )

        shirt_number = (
            item.get("jerseyNumber")
            or player_info.get("jerseyNumber")
            or item.get("shirtNumber")
            or player_info.get("shirtNumber")
            or item.get("number")
            or player_info.get("number")
        )

        players.append({
            "id": player_id,
            "player_id": player_id,
            "name": name,
            "shirt_number": shirt_number,
            "position": position,
            "rating": rating,
            "statistics": statistics,

            "goals": statistics.get("goals") or statistics.get("goal") or 0,
            "assists": statistics.get("goalAssist") or statistics.get("assists") or 0,
            "minutes_played": (
                statistics.get("minutesPlayed")
                or statistics.get("minutes_played")
                or statistics.get("minutes")
            ),
            "xg": statistics.get("expectedGoals") or statistics.get("xg"),
            "xa": statistics.get("expectedAssists") or statistics.get("xa"),
        })

    return players[:11]


def get_lineups(event_id):
    data = get_raw_lineups(event_id)

    if data.get("_rate_limited"):
        return {
            "confirmed": None,
            "home_xi": [],
            "away_xi": [],
        }

    home_side = data.get("home", {})
    away_side = data.get("away", {})

    return {
        "confirmed": data.get("confirmed"),
        "home_xi": extract_players_from_side(home_side),
        "away_xi": extract_players_from_side(away_side),
    }


def get_next_match(team_id=TEAM_ID):
    events = get_next_team_events(team_id)

    if isinstance(events, dict) and events.get("_rate_limited"):
        return None

    if not events:
        return None

    next_event = events[0]

    home_team = next_event.get("homeTeam", {})
    away_team = next_event.get("awayTeam", {})
    tournament = next_event.get("tournament", {})
    unique_tournament = tournament.get("uniqueTournament", {})
    season = next_event.get("season", {})

    home_team_id = home_team.get("id")
    away_team_id = away_team.get("id")

    is_home = home_team_id == team_id
    opponent = away_team.get("name") if is_home else home_team.get("name")
    venue_label = "Local" if is_home else "Visitante"

    tournament_id = unique_tournament.get("id")
    season_id = season.get("id")

    standings = []
    if tournament_id and season_id:
        standings = get_table(tournament_id, season_id)

    positions = extract_team_positions(
        standings,
        home_team_id,
        away_team_id
    )

    match_date, match_time = format_timestamp(next_event.get("startTimestamp"))

    event_id = next_event.get("id")
    stadium = None

    if event_id:
        match_info = get_match_info(event_id)
        stadium = match_info.get("stadium")

    return {
        "event_id": event_id,
        "home_team": home_team.get("name"),
        "away_team": away_team.get("name"),
        "home_position": positions.get("home_position"),
        "away_position": positions.get("away_position"),
        "opponent": opponent,
        "venue_label": venue_label,
        "stadium": stadium,
        "tournament_name": unique_tournament.get("name"),
        "country_name": tournament.get("category", {}).get("name"),
        "season_name": season.get("name"),
        "date": match_date,
        "time": match_time,
        "status": next_event.get("status", {}).get("description"),
    }

def get_full_match_center(event_id, tournament_id, season_id):
    match_info = get_match_info(event_id)
    time.sleep(1)

    table = get_table(tournament_id, season_id)
    time.sleep(1)

    lineups = get_lineups(event_id)
    time.sleep(1)

    odds = get_odds(event_id)
    time.sleep(1)

    raw_stats = get_match_stats(event_id)

    positions = extract_team_positions(
        table,
        match_info["home_team_id"],
        match_info["away_team_id"]
    )

    flat_table = flatten_table_rows(table)
    stats_by_period = flatten_match_stats_by_period(raw_stats)
    main_odds_market = get_main_odds_market_from_markets(odds)

    return {
        "match_info": match_info,
        "table": table,
        "flat_table": flat_table,
        "lineups": lineups,
        "odds": odds,
        "main_odds_market": main_odds_market,
        "match_stats": raw_stats,
        "stats_by_period": stats_by_period,
        "team_positions": positions,
    }

def get_player_match_stats(event_id, player_id):
    # Replace this with the real endpoint / parsing logic you use
    # Example structure only

    return {
        "player_id": player_id,
        "name": "Juan Manuel Rengifo",
        "position": "MED",
        "rating": 6.4,
        "age": 24,
        "country": "COL",
        "minutes_played": 87,
        "goals": 0,
        "assists": 0,
        "xg": 0.07,
        "xa": 0.04,
        "key_passes": 4,
        "accurate_passes": "48/55 (87%)",
        "touches": 72,
        "shots_total": 2,
        "shots_on_target": 2,
        "dribbles": "2 (1)",
        "possession_lost": 16,
        "tackles_won": "1 (1)",
        "recoveries": 2,
        "ground_duels": "4 (2)",
        "aerial_duels": "1 (0)",
        "fouls": 1,
        "dribbled_past": 0,
        "heatmap_url": None
    }