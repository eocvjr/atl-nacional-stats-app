from flask import Flask, jsonify
from flask_cors import CORS
from api import get_next_match, find_team_match_today
import json
import os

app = Flask(__name__)
CORS(app) 

CACHE_PATH = os.path.join(os.path.dirname(__file__), "cache.json")

def load_cache():
    with open(CACHE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.route("/api/next-match")
def next_match():
    data = get_next_match()
    return jsonify(data)


@app.route("/api/previous-matches")
def previous_matches():
    cache = load_cache()
    return jsonify(cache["matches"])


@app.route("/api/previous-matches/<int:event_id>")
def previous_match_detail(event_id):
    cache = load_cache()
    match = next((m for m in cache["matches"] if m["event_id"] == event_id), None)
    if not match:
        return jsonify({"error": "Match not found"}), 404
    return jsonify(match)


if __name__ == "__main__":
    app.run(debug=True)