from flask import Flask, jsonify, render_template
from flask_cors import CORS
from api import get_next_match
from datetime import datetime
import json
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

CACHE_PATH = os.path.join(os.path.dirname(__file__), "cache.json")


def load_cache():
    if not os.path.exists(CACHE_PATH):
        return {"matches": []}
    with open(CACHE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_cached_matches():
    cache = load_cache()
    out = []

    for m in cache.get("matches", []):
        info = m.get("match_info", {})

        home_team = info.get("home_team")
        away_team = info.get("away_team")
        home_score = info.get("home_score")
        away_score = info.get("away_score")
        start_time = info.get("start_time")

        result_class = "score-draw"

        if home_score is not None and away_score is not None:
            nac_is_home = home_team == "Atlético Nacional"
            nac_score = home_score if nac_is_home else away_score
            rival_score = away_score if nac_is_home else home_score

            if nac_score > rival_score:
                result_class = "score-win"
            elif nac_score < rival_score:
                result_class = "score-loss"
            else:
                result_class = "score-draw"

        out.append({
            "event_id": m.get("event_id"),
            "date": m.get("date"),
            "time": m.get("time"),
            "home_team": home_team,
            "away_team": away_team,
            "home_score": home_score,
            "away_score": away_score,
            "tournament_name": info.get("tournament_name"),
            "status": info.get("status"),
            "start_time": start_time,
            "result_class": result_class,
        })

    out.sort(key=lambda x: x.get("start_time") or 0, reverse=True)
    return out


@app.route("/api/last-match-detail")
def last_match_detail():
    cache = load_cache()
    if not cache.get("matches"):
        return jsonify({})

    last = sorted(
        cache["matches"],
        key=lambda x: x.get("match_info", {}).get("start_time") or 0,
        reverse=True
    )[0]
    return jsonify(last)

def get_cached_match_by_event_id(event_id):
    cache = load_cache()
    for match in cache.get("matches", []):
        if str(match.get("event_id")) == str(event_id):
            return match
    return None

@app.route("/match/<int:event_id>")
def match_detail(event_id):
    return render_template("match_detail.html", event_id=event_id)

@app.route("/api/match/<int:event_id>")
def match_detail_api(event_id):
    cache = load_cache()
    match = next((m for m in cache["matches"] if m["event_id"] == event_id), None)
    if not match:
        return jsonify({"error": "not found"}), 404
    return jsonify(match)

@app.route("/")
def index():
    return render_template("main.html")


@app.route("/api/next-match")
def next_match_route():
    data = get_next_match()
    return jsonify(data or {})


@app.route("/api/previous-matches")
def previous_matches_route():
    return jsonify(get_cached_matches())

@app.route("/calendario")
def calendario():
    matches = get_cached_matches()
    return render_template("calendario.html", matches=matches)

@app.route("/api/calendario")
def calendario_api():
    cache = load_cache()
    past = []
    for m in cache.get("matches", []):
        info = m["match_info"]
        past.append({
            "event_id": m["event_id"],
            "date": m["date"],
            "time": m["time"],
            "home_team": info["home_team"],
            "away_team": info["away_team"],
            "home_score": info["home_score"],
            "away_score": info["away_score"],
            "tournament_name": info["tournament_name"],
            "status": info["status"],
        })
    past.sort(key=lambda x: x["event_id"], reverse=True)

    upcoming = [
        {"date": "20/04/2026", "time": "20:30", "home_team": "Atlético Nacional", "away_team": "Atlético Bucaramanga", "tournament_name": "Primera A, Apertura", "status": "Not started"},
        {"date": "25/04/2026", "time": "20:30", "home_team": "Deportivo Pereira", "away_team": "Atlético Nacional", "tournament_name": "Primera A, Apertura", "status": "Not started"},
    ]

    return jsonify({"past": past, "upcoming": upcoming})


@app.route("/api/next-match/detail")
def next_match_detail():
    from api import get_next_match, get_odds, get_lineups, get_main_odds_market_from_markets
    import time

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


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))