import requests
import time
from datetime import date, datetime
import os
import json
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


def normalize_name(value):
    if value is None:
        return ""

    text = str(value).lower().strip()

    replacements = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ü": "u",
        "ñ": "n",
    }

    for original, replacement in replacements.items():
        text = text.replace(original, replacement)

    return text


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

def get_match_incidents(event_id):
    url = f"{BASE}/api/v1/event/{event_id}/incidents"
    data = safe_get_json(url)

    if data.get("_rate_limited"):
        return []

    return data.get("incidents", [])


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

def clean_int(value, default=0):
    try:
        if value is None or value == "":
            return default
        return int(value)
    except Exception:
        return default


def clean_float(value, default=None):
    try:
        if value is None or value == "":
            return default
        return float(value)
    except Exception:
        return default


def first_non_empty_list(*values):
    for value in values:
        if isinstance(value, list) and value:
            return value
    return []


def merge_player_lists(primary, secondary):
    merged = {}

    def player_key(player):
        return (
            player.get("player_id")
            or player.get("id")
            or normalize_name(player.get("name"))
        )

    for source in [primary or [], secondary or []]:
        for player in source:
            if not isinstance(player, dict):
                continue

            key = player_key(player)

            if not key:
                continue

            if key not in merged:
                merged[key] = dict(player)
                continue

            existing = merged[key]

            for field, value in player.items():
                if field in ["goals", "assists", "yellow_cards", "red_cards"]:
                    existing[field] = max(
                        clean_int(existing.get(field)),
                        clean_int(value)
                    )

                elif field in ["subbed_in", "subbed_out"]:
                    if value:
                        existing[field] = True

                elif field in [
                    "goal_minute",
                    "goal_minutes",
                    "assist_minute",
                    "assist_minutes",
                    "yellow_card_minute",
                    "yellow_card_minutes",
                    "red_card_minute",
                    "red_card_minutes",
                    "subbed_in_minute",
                    "subbed_out_minute",
                ]:
                    existing[field] = merge_minute_values(existing.get(field), value)

                else:
                    if existing.get(field) in [None, "", [], {}] and value not in [None, "", [], {}]:
                        existing[field] = value

    return list(merged.values())


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


def get_player_rating_from_stats(item, player_info, statistics):
    possible_values = [
        item.get("rating") if isinstance(item, dict) else None,
        item.get("averageRating") if isinstance(item, dict) else None,
        statistics.get("rating") if isinstance(statistics, dict) else None,
        statistics.get("averageRating") if isinstance(statistics, dict) else None,
        player_info.get("rating") if isinstance(player_info, dict) else None,
        player_info.get("averageRating") if isinstance(player_info, dict) else None,
        player_info.get("statistics", {}).get("rating") if isinstance(player_info.get("statistics"), dict) else None,
    ]

    for value in possible_values:
        number = clean_float(value)
        if number is not None:
            return number

    return None


def extract_card_counts(item, player_info, statistics):
    yellow = (
        item.get("yellowCards")
        or item.get("yellow_cards")
        or item.get("yellowCard")
        or player_info.get("yellowCards")
        or player_info.get("yellow_cards")
        or player_info.get("yellowCard")
        or statistics.get("yellowCards")
        or statistics.get("yellow_cards")
        or statistics.get("yellowCard")
        or statistics.get("totalYellowCards")
        or 0
    )

    red = (
        item.get("redCards")
        or item.get("red_cards")
        or item.get("redCard")
        or player_info.get("redCards")
        or player_info.get("red_cards")
        or player_info.get("redCard")
        or statistics.get("redCards")
        or statistics.get("red_cards")
        or statistics.get("redCard")
        or statistics.get("totalRedCards")
        or 0
    )

    return clean_int(yellow), clean_int(red)


def normalize_lineup_player(item):
    if not isinstance(item, dict):
        return None

    player_info = item.get("player", item)

    if not isinstance(player_info, dict):
        return None

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

    statistics = extract_player_statistics(item, player_info)
    rating = get_player_rating_from_stats(item, player_info, statistics)

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

    yellow_cards, red_cards = extract_card_counts(item, player_info, statistics)

    team_id = (
        item.get("teamId")
        or item.get("team_id")
        or player_info.get("teamId")
        or player_info.get("team_id")
        or item.get("team", {}).get("id")
    )

    return {
        "id": player_id,
        "player_id": player_id,
        "team_id": team_id,
        "name": name,
        "shirt_number": shirt_number,
        "position": position,
        "rating": rating,
        "statistics": statistics,

        "goals": clean_int(statistics.get("goals") or statistics.get("goal") or 0),
        "assists": clean_int(statistics.get("goalAssist") or statistics.get("assists") or 0),
        "yellow_cards": yellow_cards,
        "red_cards": red_cards,

        "minutes_played": (
            statistics.get("minutesPlayed")
            or statistics.get("minutes_played")
            or statistics.get("minutes")
        ),
        "xg": statistics.get("expectedGoals") or statistics.get("xg"),
        "xa": statistics.get("expectedAssists") or statistics.get("xa"),
        "subbed_in": False,
        "subbed_out": False,
    }


def is_substitute_item(item):
    player_info = item.get("player", item) if isinstance(item, dict) else {}

    return bool(
        item.get("substitute")
        or item.get("isSubstitute")
        or item.get("isSubstitution")
        or item.get("bench")
        or player_info.get("substitute")
        or player_info.get("isSubstitute")
        or player_info.get("isSubstitution")
        or player_info.get("bench")
    )


def extract_players_from_side(side_data, include_subs=False):
    if not isinstance(side_data, dict):
        return []

    raw_players = first_non_empty_list(
        side_data.get("players"),
        side_data.get("startingLineup"),
        side_data.get("starters"),
        side_data.get("lineup"),
        side_data.get("members"),
        side_data.get("athletes"),
    )

    dedicated_subs = first_non_empty_list(
        side_data.get("substitutes"),
        side_data.get("bench"),
        side_data.get("substitutionPlayers"),
        side_data.get("substitutePlayers"),
    )

    players = []

    if include_subs and dedicated_subs:
        for item in dedicated_subs:
            normalized_player = normalize_lineup_player(item)
            if normalized_player:
                normalized_player["subbed_in"] = normalized_player.get("subbed_in", False)
                players.append(normalized_player)
        return players

    if not raw_players:
        return []

    for item in raw_players:
        if not isinstance(item, dict):
            continue

        is_sub = is_substitute_item(item)

        if include_subs and not is_sub:
            continue

        if not include_subs and is_sub:
            continue

        normalized_player = normalize_lineup_player(item)

        if normalized_player:
            players.append(normalized_player)

    if include_subs:
        return players

    return players[:11]


def incident_blob_text(incident):
    try:
        raw = json.dumps(incident, ensure_ascii=False)
    except Exception:
        raw = str(incident)

    return normalize_name(raw)


def incident_type_text(incident):
    values = [
        incident.get("incidentType"),
        incident.get("type"),
        incident.get("incidentClass"),
        incident.get("class"),
        incident.get("cardType"),
        incident.get("card_type"),
        incident.get("color"),
        incident.get("reason"),
        incident.get("text"),
        incident.get("description"),
    ]

    joined = " ".join(str(v) for v in values if v)
    return normalize_name(joined)


def get_incident_main_type(incident):
    return normalize_name(
        incident.get("incidentType")
        or incident.get("type")
        or ""
    )


def get_incident_class(incident):
    return normalize_name(
        incident.get("incidentClass")
        or incident.get("class")
        or incident.get("cardType")
        or incident.get("card_type")
        or incident.get("color")
        or ""
    )


def get_incident_key(incident, fallback_player_id=None, fallback_player_name=None):
    incident_id = incident.get("id")

    if incident_id:
        return f"id:{incident_id}"

    minute = (
        incident.get("time")
        or incident.get("minute")
        or incident.get("addedTime")
        or ""
    )

    main_type = get_incident_main_type(incident)
    incident_class = get_incident_class(incident)

    player_key = (
        fallback_player_id
        or normalize_name(fallback_player_name)
        or incident_player_id(incident)
        or normalize_name(incident_player_name(incident))
        or ""
    )

    return f"{minute}:{main_type}:{incident_class}:{player_key}"


def is_goal_incident(incident):
    main_type = get_incident_main_type(incident)
    incident_class = get_incident_class(incident)
    text = incident_type_text(incident)

    if "own" in incident_class or "own goal" in text:
        return False

    return main_type == "goal"


def is_assist_incident(incident):
    main_type = get_incident_main_type(incident)
    text = incident_type_text(incident)

    return main_type == "assist" or "assist" in text


def is_yellow_card_incident(incident):
    main_type = get_incident_main_type(incident)
    incident_class = get_incident_class(incident)
    text = incident_type_text(incident)

    return (
        main_type == "card"
        and (
            "yellow" in incident_class
            or "yellow" in text
        )
    )


def is_red_card_incident(incident):
    main_type = get_incident_main_type(incident)
    incident_class = get_incident_class(incident)
    text = incident_type_text(incident)

    return (
        main_type == "card"
        and (
            "red" in incident_class
            or "red" in text
        )
    )


def is_substitution_incident(incident):
    main_type = get_incident_main_type(incident)

    return (
        main_type == "substitution"
        or bool(incident.get("playerIn"))
        or bool(incident.get("playerOut"))
        or bool(incident.get("player_in"))
        or bool(incident.get("player_out"))
    )


def incident_player_id(incident):
    player = incident.get("player") or {}
    player_in = incident.get("playerIn") or incident.get("player_in") or {}
    player_out = incident.get("playerOut") or incident.get("player_out") or {}

    return (
        player.get("id")
        or incident.get("playerId")
        or incident.get("player_id")
        or player_in.get("id")
        or player_out.get("id")
    )


def incident_player_name(incident):
    player = incident.get("player") or {}
    player_in = incident.get("playerIn") or incident.get("player_in") or {}
    player_out = incident.get("playerOut") or incident.get("player_out") or {}

    return (
        player.get("name")
        or player.get("shortName")
        or incident.get("playerName")
        or incident.get("player_name")
        or player_in.get("name")
        or player_in.get("shortName")
        or player_out.get("name")
        or player_out.get("shortName")
    )


def incident_team_id(incident):
    team = incident.get("team") or {}
    return (
        team.get("id")
        or incident.get("teamId")
        or incident.get("team_id")
    )


def incident_side(incident):
    if incident.get("isHome") is True:
        return "home"

    if incident.get("isHome") is False:
        return "away"

    side = str(
        incident.get("side")
        or incident.get("teamSide")
        or incident.get("teamPosition")
        or ""
    ).strip().lower()

    if side in ["home", "h"]:
        return "home"

    if side in ["away", "a"]:
        return "away"

    return None

def incident_minute(incident):
    base = (
        incident.get("time")
        or incident.get("minute")
        or incident.get("matchClock")
        or incident.get("matchMinute")
    )

    added = (
        incident.get("addedTime")
        or incident.get("injuryTime")
        or incident.get("extraTime")
    )

    if base is None or base == "":
        return None

    try:
        base_text = str(int(base))
    except Exception:
        base_text = str(base).replace("'", "").strip()

    if added is not None and added != "":
        try:
            added_text = str(int(added))
        except Exception:
            added_text = str(added).replace("'", "").strip()

        if added_text and added_text != "0":
            return f"{base_text}+{added_text}"

    return base_text


def split_minutes(value):
    if value is None or value == "":
        return []

    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]

    return [
        part.strip()
        for part in str(value).split(",")
        if part.strip()
    ]


def join_minutes(values):
    clean_values = []

    for value in values or []:
        if value is None or value == "":
            continue

        value_text = str(value).replace("'", "").strip()

        if value_text and value_text not in clean_values:
            clean_values.append(value_text)

    return ",".join(clean_values)


def merge_minute_values(existing, incoming):
    return join_minutes(split_minutes(existing) + split_minutes(incoming))


def incident_assist_player(incident):
    possible_assists = [
        incident.get("assist1"),
        incident.get("assist2"),
        incident.get("assist"),
        incident.get("assistPlayer"),
        incident.get("playerAssist"),
    ]

    for assist in possible_assists:
        if isinstance(assist, dict):
            assist_id = assist.get("id")
            assist_name = assist.get("name") or assist.get("shortName")

            if assist_id or assist_name:
                return assist_id, assist_name

    assist_id = (
        incident.get("assistId")
        or incident.get("assist_player_id")
        or incident.get("assistPlayerId")
    )

    assist_name = (
        incident.get("assistName")
        or incident.get("assist_player_name")
        or incident.get("assistPlayerName")
    )

    if assist_id or assist_name:
        return assist_id, assist_name

    return None, None

def add_incident_entry(by_player_id, by_player_name, player_id, player_name, entry):
    if player_id:
        by_player_id.setdefault(str(player_id), []).append(entry)
        return

    key_name = normalize_name(player_name)

    if key_name:
        by_player_name.setdefault(key_name, []).append(entry)


def build_incident_maps(incidents):
    by_player_id = {}
    by_player_name = {}
    seen_event_keys = set()

    for incident in incidents or []:
        if not isinstance(incident, dict):
            continue

        minute = incident_minute(incident)
        player_id = incident_player_id(incident)
        player_name = incident_player_name(incident)

        entry = {
            "incident_key": get_incident_key(incident, player_id, player_name),
            "goals": 0,
            "assists": 0,
            "yellow_cards": 0,
            "red_cards": 0,
            "subbed_in": False,
            "subbed_out": False,
            "goal_minute": None,
            "assist_minute": None,
            "yellow_card_minute": None,
            "red_card_minute": None,
            "subbed_in_minute": None,
            "subbed_out_minute": None,
        }

        if is_goal_incident(incident):
            entry["goals"] = 1
            entry["goal_minute"] = minute

        if is_assist_incident(incident):
            entry["assists"] = 1
            entry["assist_minute"] = minute

        if is_yellow_card_incident(incident):
            entry["yellow_cards"] = 1
            entry["yellow_card_minute"] = minute

        if is_red_card_incident(incident):
            entry["red_cards"] = 1
            entry["red_card_minute"] = minute

        if any([
            entry["goals"],
            entry["assists"],
            entry["yellow_cards"],
            entry["red_cards"],
        ]):
            dedupe_key = (
                entry["incident_key"],
                str(player_id),
                normalize_name(player_name),
                entry["goals"],
                entry["assists"],
                entry["yellow_cards"],
                entry["red_cards"],
                minute,
            )

            if dedupe_key not in seen_event_keys:
                seen_event_keys.add(dedupe_key)

                add_incident_entry(
                    by_player_id,
                    by_player_name,
                    player_id,
                    player_name,
                    entry
                )

        # SofaScore/RapidAPI usually stores assist inside the goal incident.
        if is_goal_incident(incident):
            assist_id, assist_name = incident_assist_player(incident)

            if assist_id or assist_name:
                assist_entry = {
                    "incident_key": get_incident_key(incident, assist_id, assist_name) + ":assist",
                    "goals": 0,
                    "assists": 1,
                    "yellow_cards": 0,
                    "red_cards": 0,
                    "subbed_in": False,
                    "subbed_out": False,
                    "goal_minute": None,
                    "assist_minute": minute,
                    "yellow_card_minute": None,
                    "red_card_minute": None,
                    "subbed_in_minute": None,
                    "subbed_out_minute": None,
                }

                assist_dedupe_key = (
                    assist_entry["incident_key"],
                    str(assist_id),
                    normalize_name(assist_name),
                    "assist",
                    minute,
                )

                if assist_dedupe_key not in seen_event_keys:
                    seen_event_keys.add(assist_dedupe_key)

                    add_incident_entry(
                        by_player_id,
                        by_player_name,
                        assist_id,
                        assist_name,
                        assist_entry
                    )

        if is_substitution_incident(incident):
            player_in = incident.get("playerIn") or incident.get("player_in") or {}
            player_out = incident.get("playerOut") or incident.get("player_out") or {}

            if player_in:
                player_in_id = player_in.get("id")
                player_in_name = player_in.get("name") or player_in.get("shortName")

                sub_in_entry = {
                    "incident_key": get_incident_key(incident, player_in_id, player_in_name) + ":in",
                    "goals": 0,
                    "assists": 0,
                    "yellow_cards": 0,
                    "red_cards": 0,
                    "subbed_in": True,
                    "subbed_out": False,
                    "goal_minute": None,
                    "assist_minute": None,
                    "yellow_card_minute": None,
                    "red_card_minute": None,
                    "subbed_in_minute": minute,
                    "subbed_out_minute": None,
                }

                add_incident_entry(
                    by_player_id,
                    by_player_name,
                    player_in_id,
                    player_in_name,
                    sub_in_entry
                )

            if player_out:
                player_out_id = player_out.get("id")
                player_out_name = player_out.get("name") or player_out.get("shortName")

                sub_out_entry = {
                    "incident_key": get_incident_key(incident, player_out_id, player_out_name) + ":out",
                    "goals": 0,
                    "assists": 0,
                    "yellow_cards": 0,
                    "red_cards": 0,
                    "subbed_in": False,
                    "subbed_out": True,
                    "goal_minute": None,
                    "assist_minute": None,
                    "yellow_card_minute": None,
                    "red_card_minute": None,
                    "subbed_in_minute": None,
                    "subbed_out_minute": minute,
                }

                add_incident_entry(
                    by_player_id,
                    by_player_name,
                    player_out_id,
                    player_out_name,
                    sub_out_entry
                )

    return by_player_id, by_player_name


def merge_incidents_into_player(player, by_player_id, by_player_name):
    player_id = player.get("player_id") or player.get("id")
    player_name = normalize_name(player.get("name"))

    events = []

    if player_id is not None and str(player_id) in by_player_id:
        events = by_player_id[str(player_id)]
    elif player_name in by_player_name:
        events = by_player_name[player_name]

    if not events:
        return player

    merged = dict(player)

    existing_goals = clean_int(merged.get("goals"))
    existing_assists = clean_int(merged.get("assists"))
    existing_yellows = clean_int(merged.get("yellow_cards"))
    existing_reds = clean_int(merged.get("red_cards"))

    seen = set()

    incident_goals = 0
    incident_assists = 0
    incident_yellows = 0
    incident_reds = 0

    goal_minutes = split_minutes(merged.get("goal_minute") or merged.get("goal_minutes"))
    assist_minutes = split_minutes(merged.get("assist_minute") or merged.get("assist_minutes"))
    yellow_minutes = split_minutes(merged.get("yellow_card_minute") or merged.get("yellow_card_minutes"))
    red_minutes = split_minutes(merged.get("red_card_minute") or merged.get("red_card_minutes"))
    sub_in_minutes = split_minutes(merged.get("subbed_in_minute"))
    sub_out_minutes = split_minutes(merged.get("subbed_out_minute"))

    for event in events:
        key = event.get("incident_key")

        if key and key in seen:
            continue

        if key:
            seen.add(key)

        incident_goals += clean_int(event.get("goals"))
        incident_assists += clean_int(event.get("assists"))
        incident_yellows += clean_int(event.get("yellow_cards"))
        incident_reds += clean_int(event.get("red_cards"))

        if event.get("goal_minute"):
            goal_minutes.append(event.get("goal_minute"))

        if event.get("assist_minute"):
            assist_minutes.append(event.get("assist_minute"))

        if event.get("yellow_card_minute"):
            yellow_minutes.append(event.get("yellow_card_minute"))

        if event.get("red_card_minute"):
            red_minutes.append(event.get("red_card_minute"))

        if event.get("subbed_in"):
            merged["subbed_in"] = True

        if event.get("subbed_out"):
            merged["subbed_out"] = True

        if event.get("subbed_in_minute"):
            sub_in_minutes.append(event.get("subbed_in_minute"))

        if event.get("subbed_out_minute"):
            sub_out_minutes.append(event.get("subbed_out_minute"))

    merged["goals"] = max(existing_goals, incident_goals)
    merged["assists"] = max(existing_assists, incident_assists)
    merged["yellow_cards"] = max(existing_yellows, min(incident_yellows, 2))
    merged["red_cards"] = max(existing_reds, min(incident_reds, 1))

    merged["goal_minute"] = join_minutes(goal_minutes)
    merged["goal_minutes"] = merged["goal_minute"]

    merged["assist_minute"] = join_minutes(assist_minutes)
    merged["assist_minutes"] = merged["assist_minute"]

    merged["yellow_card_minute"] = join_minutes(yellow_minutes)
    merged["yellow_card_minutes"] = merged["yellow_card_minute"]

    merged["red_card_minute"] = join_minutes(red_minutes)
    merged["red_card_minutes"] = merged["red_card_minute"]

    merged["subbed_in_minute"] = join_minutes(sub_in_minutes)
    merged["subbed_out_minute"] = join_minutes(sub_out_minutes)

    return merged


def merge_incidents_into_players(players, by_player_id, by_player_name):
    return [
        merge_incidents_into_player(player, by_player_id, by_player_name)
        for player in (players or [])
    ]


def build_subs_from_incidents(incidents, team_id=None, side=None):
    subs = []
    seen = set()

    for incident in incidents or []:
        if not isinstance(incident, dict):
            continue

        if not is_substitution_incident(incident):
            continue

        inc_team_id = incident_team_id(incident)
        inc_side = incident_side(incident)

        if team_id and inc_team_id and str(inc_team_id) != str(team_id):
            continue

        if side and inc_side and inc_side != side:
            continue

        player_in = incident.get("playerIn") or incident.get("player_in") or {}

        if not player_in:
            continue

        player_id = player_in.get("id")
        name = player_in.get("name") or player_in.get("shortName")

        if not player_id and not name:
            continue

        key = player_id or normalize_name(name)

        if key in seen:
            continue

        seen.add(key)

        subs.append({
            "id": player_id,
            "player_id": player_id,
            "team_id": team_id or inc_team_id,
            "name": name or "Jugador",
            "shirt_number": (
                player_in.get("jerseyNumber")
                or player_in.get("shirtNumber")
                or player_in.get("number")
            ),
            "position": normalize_position(
                player_in.get("position")
                or player_in.get("shortPosition")
            ),
            "rating": None,
            "statistics": {},
            "goals": 0,
            "assists": 0,
            "yellow_cards": 0,
            "red_cards": 0,
            "subbed_in": True,
            "subbed_out": False,
            "subbed_in_minute": incident_minute(incident),
            "subbed_out_minute": None,
            "goal_minute": None,
            "assist_minute": None,
            "yellow_card_minute": None,
            "red_card_minute": None,
        })

    return subs


def get_lineups(event_id):
    data = get_raw_lineups(event_id)

    if data.get("_rate_limited"):
        return {
            "confirmed": None,
            "home_xi": [],
            "away_xi": [],
            "home_subs": [],
            "away_subs": [],
        }

    home_side = data.get("home", {})
    away_side = data.get("away", {})

    home_xi = extract_players_from_side(home_side, include_subs=False)
    away_xi = extract_players_from_side(away_side, include_subs=False)

    home_subs = extract_players_from_side(home_side, include_subs=True)
    away_subs = extract_players_from_side(away_side, include_subs=True)

    home_team_id = (
        home_side.get("team", {}).get("id")
        or home_side.get("teamId")
        or home_side.get("id")
    )

    away_team_id = (
        away_side.get("team", {}).get("id")
        or away_side.get("teamId")
        or away_side.get("id")
    )

    incidents = get_match_incidents(event_id)
    by_player_id, by_player_name = build_incident_maps(incidents)

    incident_home_subs = build_subs_from_incidents(
        incidents,
        team_id=home_team_id,
        side="home"
    )

    incident_away_subs = build_subs_from_incidents(
        incidents,
        team_id=away_team_id,
        side="away"
    )

    home_subs = merge_player_lists(home_subs, incident_home_subs)
    away_subs = merge_player_lists(away_subs, incident_away_subs)

    home_xi = merge_incidents_into_players(home_xi, by_player_id, by_player_name)
    away_xi = merge_incidents_into_players(away_xi, by_player_id, by_player_name)
    home_subs = merge_incidents_into_players(home_subs, by_player_id, by_player_name)
    away_subs = merge_incidents_into_players(away_subs, by_player_id, by_player_name)

    return {
        "confirmed": data.get("confirmed"),
        "home_xi": home_xi,
        "away_xi": away_xi,
        "home_subs": home_subs,
        "away_subs": away_subs,
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

def stats_dict_to_array(stats):
    if not isinstance(stats, dict):
        return []

    rows = []

    stat_labels = {
        "minutesPlayed": "Minutes played",
        "minutes_played": "Minutes played",
        "minutes": "Minutes played",
        "goals": "Goals",
        "goal": "Goals",
        "goalAssist": "Assists",
        "assists": "Assists",
        "expectedGoals": "Expected goals (xG)",
        "xg": "Expected goals (xG)",
        "expectedAssists": "Expected assists (xA)",
        "xa": "Expected assists (xA)",
        "keyPass": "Key passes",
        "keyPasses": "Key passes",
        "key_passes": "Key passes",
        "totalCross": "Crosses",
        "crosses": "Crosses",
        "accurateCross": "Accurate crosses",
        "accurate_crosses": "Accurate crosses",
        "accuratePass": "Accurate passes",
        "accurate_passes": "Accurate passes",
        "totalPass": "Total passes",
        "total_passes": "Total passes",
        "totalLongBalls": "Long balls",
        "long_balls": "Long balls",
        "accurateLongBalls": "Accurate long balls",
        "accurate_long_balls": "Accurate long balls",
        "totalShots": "Total shots",
        "shots_total": "Total shots",
        "expectedGoalsOnTarget": "xGOT",
        "xgot": "xGOT",
        "onTargetScoringAttempt": "Shots on target",
        "shots_on_target": "Shots on target",
        "blockedScoringAttempt": "Shots blocked",
        "shots_blocked": "Shots blocked",
        "touches": "Touches",
        "unsuccessfulTouches": "Unsuccessful touches",
        "wonContest": "Dribbles successful",
        "dribbles_won": "Dribbles successful",
        "possessionLostCtrl": "Possession lost",
        "possession_lost": "Possession lost",
        "totalTackle": "Tackles",
        "tackles": "Tackles",
        "wonTackle": "Tackles won",
        "tackles_won": "Tackles won",
        "interceptionWon": "Interceptions",
        "interceptions": "Interceptions",
        "totalClearance": "Clearances",
        "clearances": "Clearances",
        "outfielderBlock": "Blocked shots",
        "blocked_shots": "Blocked shots",
        "ballRecovery": "Recoveries",
        "recoveries": "Recoveries",
        "groundDuelsWon": "Ground duels won",
        "aerialWon": "Aerial duels won",
        "fouls": "Fouls",
        "challengeLost": "Dribbled past",
        "yellowCards": "Yellow cards",
        "yellow_cards": "Yellow cards",
        "redCards": "Red cards",
        "red_cards": "Red cards",
    }

    seen_labels = set()

    for key, label in stat_labels.items():
        value = stats.get(key)

        if value is None or value == "":
            continue

        if label in seen_labels:
            continue

        seen_labels.add(label)

        rows.append({
            "stat_name": label,
            "stat_value": value,
        })

    return rows


def get_all_match_players_from_lineups(event_id):
    lineups = get_lineups(event_id)

    return (
        lineups.get("home_xi", [])
        + lineups.get("away_xi", [])
        + lineups.get("home_subs", [])
        + lineups.get("away_subs", [])
    )


def get_player_match_stats(event_id, player_id):
    players = get_all_match_players_from_lineups(event_id)

    target_player = None

    for player in players:
        if str(player.get("player_id")) == str(player_id) or str(player.get("id")) == str(player_id):
            target_player = player
            break

    if not target_player:
        return {
            "player_id": player_id,
            "name": "Jugador",
            "position": "-",
            "rating": None,
            "team_name": "Atlético Nacional",
            "shirt_number": None,
            "minutes_played": None,
            "goals": 0,
            "assists": 0,
            "yellow_cards": 0,
            "red_cards": 0,
            "subbed_in": False,
            "subbed_out": False,
            "stats": [],
        }

    stats = dict(target_player.get("statistics") or {})

    stats["goals"] = target_player.get("goals", 0)
    stats["assists"] = target_player.get("assists", 0)
    stats["yellow_cards"] = target_player.get("yellow_cards", 0)
    stats["red_cards"] = target_player.get("red_cards", 0)

    stats["goal_minute"] = target_player.get("goal_minute")
    stats["goal_minutes"] = target_player.get("goal_minutes")
    stats["assist_minute"] = target_player.get("assist_minute")
    stats["assist_minutes"] = target_player.get("assist_minutes")
    stats["yellow_card_minute"] = target_player.get("yellow_card_minute")
    stats["yellow_card_minutes"] = target_player.get("yellow_card_minutes")
    stats["red_card_minute"] = target_player.get("red_card_minute")
    stats["red_card_minutes"] = target_player.get("red_card_minutes")
    stats["subbed_in_minute"] = target_player.get("subbed_in_minute")
    stats["subbed_out_minute"] = target_player.get("subbed_out_minute")

    if target_player.get("minutes_played") is not None:
        stats["minutes_played"] = target_player.get("minutes_played")

    if target_player.get("xg") is not None:
        stats["xg"] = target_player.get("xg")

    if target_player.get("xa") is not None:
        stats["xa"] = target_player.get("xa")

    return {
        "player_id": target_player.get("player_id"),
        "name": target_player.get("name"),
        "position": target_player.get("position"),
        "rating": target_player.get("rating"),
        "team_name": "Atlético Nacional",
        "shirt_number": target_player.get("shirt_number"),
        "minutes_played": target_player.get("minutes_played"),
        "goals": target_player.get("goals", 0),
        "assists": target_player.get("assists", 0),
        "yellow_cards": target_player.get("yellow_cards", 0),
        "red_cards": target_player.get("red_cards", 0),
        "subbed_in": target_player.get("subbed_in", False),
        "subbed_out": target_player.get("subbed_out", False),
        "xg": target_player.get("xg"),
        "xa": target_player.get("xa"),
        "stats": stats_dict_to_array(stats),
        "goal_minute": target_player.get("goal_minute"),
        "goal_minutes": target_player.get("goal_minutes"),
        "assist_minute": target_player.get("assist_minute"),
        "assist_minutes": target_player.get("assist_minutes"),
        "yellow_card_minute": target_player.get("yellow_card_minute"),
        "yellow_card_minutes": target_player.get("yellow_card_minutes"),
        "red_card_minute": target_player.get("red_card_minute"),
        "red_card_minutes": target_player.get("red_card_minutes"),
        "subbed_in_minute": target_player.get("subbed_in_minute"),
        "subbed_out_minute": target_player.get("subbed_out_minute"),
    }

