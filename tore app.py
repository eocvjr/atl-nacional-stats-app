[1mdiff --git a/app/api.py b/app/api.py[m
[1mindex 483d5a4..cd0118f 100644[m
[1m--- a/app/api.py[m
[1m+++ b/app/api.py[m
[36m@@ -129,6 +129,7 @@[m [mdef get_match_info(event_id):[m
             "tournament_name": "Dato no disponible",[m
             "country_name": "Dato no disponible",[m
             "season_name": "Dato no disponible",[m
[32m+[m[32m            "stadium": None,[m
         }[m
 [m
     event = data.get("event", {})[m
[36m@@ -139,6 +140,13 @@[m [mdef get_match_info(event_id):[m
     home_score = event.get("homeScore", {}).get("current")[m
     away_score = event.get("awayScore", {}).get("current")[m
 [m
[32m+[m[32m    venue = event.get("venue", {}) or {}[m
[32m+[m[32m    stadium = ([m
[32m+[m[32m        venue.get("name")[m
[32m+[m[32m        or venue.get("stadium", {}).get("name")[m
[32m+[m[32m        or event.get("ground", {}).get("name")[m
[32m+[m[32m    )[m
[32m+[m
     return {[m
         "home_team": event.get("homeTeam", {}).get("name"),[m
         "away_team": event.get("awayTeam", {}).get("name"),[m
[36m@@ -151,9 +159,9 @@[m [mdef get_match_info(event_id):[m
         "tournament_name": unique_tournament.get("name"),[m
         "country_name": tournament.get("category", {}).get("name"),[m
         "season_name": season.get("name"),[m
[32m+[m[32m        "stadium": stadium,[m
     }[m
 [m
[31m-[m
 def get_table(tournament_id, season_id):[m
     url = f"{BASE}/api/v1/unique-tournament/{tournament_id}/season/{season_id}/standings/total"[m
     data = safe_get_json(url)[m
[36m@@ -617,6 +625,13 @@[m [mdef get_next_match(team_id=TEAM_ID):[m
 [m
     match_date, match_time = format_timestamp(next_event.get("startTimestamp"))[m
 [m
[32m+[m[32m    venue = next_event.get("venue", {}) or {}[m
[32m+[m[32m    stadium = ([m
[32m+[m[32m        venue.get("name")[m
[32m+[m[32m        or venue.get("stadium", {}).get("name")[m
[32m+[m[32m        or next_event.get("ground", {}).get("name")[m
[32m+[m[32m    )[m
[32m+[m
     return {[m
         "event_id": next_event.get("id"),[m
         "home_team": home_team.get("name"),[m
[36m@@ -625,6 +640,7 @@[m [mdef get_next_match(team_id=TEAM_ID):[m
         "away_position": positions.get("away_position"),[m
         "opponent": opponent,[m
         "venue_label": venue_label,[m
[32m+[m[32m        "stadium": stadium,[m
         "tournament_name": unique_tournament.get("name"),[m
         "country_name": tournament.get("category", {}).get("name"),[m
         "season_name": season.get("name"),[m
[36m@@ -633,7 +649,6 @@[m [mdef get_next_match(team_id=TEAM_ID):[m
         "status": next_event.get("status", {}).get("description"),[m
     }[m
 [m
[31m-[m
 def get_full_match_center(event_id, tournament_id, season_id):[m
     match_info = get_match_info(event_id)[m
     time.sleep(1)[m
[1mdiff --git a/app/app.py b/app/app.py[m
[1mindex 7493f90..1f003b5 100644[m
[1m--- a/app/app.py[m
[1m+++ b/app/app.py[m
[36m@@ -1,39 +1,103 @@[m
[31m-from flask import Flask, jsonify[m
[32m+[m[32mfrom flask import Flask, jsonify, render_template[m
 from flask_cors import CORS[m
[31m-from api import get_next_match, find_team_match_today[m
[32m+[m[32mfrom api import get_next_match, get_full_match_center, TEAM_ID, BASE, safe_get_json[m
 import json[m
 import os[m
 [m
[31m-app = Flask(__name__)[m
[31m-CORS(app) [m
[32m+[m[32mapp = Flask(__name__, static_folder='static', template_folder='templates')[m
[32m+[m[32mCORS(app)[m
[32m+[m
[32m+[m[32m@app.route("/")[m
[32m+[m[32mdef index():[m
[32m+[m[32m    return render_template("main.html")[m
 [m
 CACHE_PATH = os.path.join(os.path.dirname(__file__), "cache.json")[m
 [m
[32m+[m
 def load_cache():[m
[32m+[m[32m    if not os.path.exists(CACHE_PATH):[m
[32m+[m[32m        return {"matches": []}[m
     with open(CACHE_PATH, "r", encoding="utf-8") as f:[m
         return json.load(f)[m
 [m
 [m
 @app.route("/api/next-match")[m
[31m-def next_match():[m
[32m+[m[32mdef next_match_route():[m
     data = get_next_match()[m
[31m-    return jsonify(data)[m
[32m+[m[32m    return jsonify(data or {})[m
 [m
 [m
 @app.route("/api/previous-matches")[m
[31m-def previous_matches():[m
[32m+[m[32mdef previous_matches_route():[m
[32m+[m[32m    """[m
[32m+[m[32m    Devuelve una lista simple de partidos pasados[m
[32m+[m[32m    para alimentar la tarjeta de 'PARTIDOS RECIENTES'[m
[32m+[m[32m    """[m
     cache = load_cache()[m
[31m-    return jsonify(cache["matches"])[m
[32m+[m[32m    out = [][m
[32m+[m[32m    for m in cache.get("matches", []):[m
[32m+[m[32m        info = m["match_info"][m
[32m+[m[32m        out.append({[m
[32m+[m[32m            "event_id": m["event_id"],[m
[32m+[m[32m            "date": m["date"],[m
[32m+[m[32m            "time": m["time"],[m
[32m+[m[32m            "home_team": info["home_team"],[m
[32m+[m[32m            "away_team": info["away_team"],[m
[32m+[m[32m            "home_score": info["home_score"],[m
[32m+[m[32m            "away_score": info["away_score"],[m
[32m+[m[32m            "tournament_name": info["tournament_name"],[m
[32m+[m[32m        })[m
[32m+[m[32m    # ordena del más reciente al más antiguo[m
[32m+[m[32m    out.sort(key=lambda x: x["event_id"], reverse=True)[m
[32m+[m[32m    return jsonify(out)[m
 [m
 [m
[31m-@app.route("/api/previous-matches/<int:event_id>")[m
[31m-def previous_match_detail(event_id):[m
[32m+[m[32m@app.route("/api/last-match-detail")[m
[32m+[m[32mdef last_match_detail():[m
[32m+[m[32m    """[m
[32m+[m[32m    Devuelve 1 solo partido (el más reciente del cache)[m
[32m+[m[32m    con tabla, alineaciones, stats, etc.[m
[32m+[m[32m    Para la columna derecha (ratings/jugadores).[m
[32m+[m[32m    """[m
     cache = load_cache()[m
[31m-    match = next((m for m in cache["matches"] if m["event_id"] == event_id), None)[m
[31m-    if not match:[m
[31m-        return jsonify({"error": "Match not found"}), 404[m
[31m-    return jsonify(match)[m
[32m+[m[32m    if not cache.get("matches"):[m
[32m+[m[32m        return jsonify({})[m
[32m+[m
[32m+[m[32m    last = sorted(cache["matches"], key=lambda x: x["event_id"], reverse=True)[0][m
[32m+[m[32m    return jsonify(last)[m
[32m+[m
[32m+[m
[32m+[m[32mif __name__ == "__main__":[m
[32m+[m[32m    app.run(debug=True)[m
[32m+[m
[32m+[m
[32m+[m[32m# your new endpoint goes here[m
[32m+[m[32m@app.route("/api/next-match/detail")[m
[32m+[m[32mdef next_match_detail():[m
[32m+[m[32m    from api import get_next_match, get_odds, get_lineups, get_main_odds_market_from_markets[m
[32m+[m[32m    import time[m
[32m+[m
[32m+[m[32m    next_match = get_next_match()[m
[32m+[m[32m    if not next_match:[m
[32m+[m[32m        return jsonify({"error": "No next match found"}), 404[m
[32m+[m
[32m+[m[32m    event_id = next_match.get("event_id")[m
[32m+[m[32m    if not event_id:[m
[32m+[m[32m        return jsonify({"error": "No event ID"}), 404[m
[32m+[m
[32m+[m[32m    time.sleep(0.5)[m
[32m+[m[32m    odds = get_odds(event_id)[m
[32m+[m[32m    time.sleep(0.5)[m
[32m+[m[32m    lineups = get_lineups(event_id)[m
[32m+[m
[32m+[m[32m    main_odds = get_main_odds_market_from_markets(odds)[m
[32m+[m
[32m+[m[32m    return jsonify({[m
[32m+[m[32m        "match": next_match,[m
[32m+[m[32m        "odds": main_odds,[m
[32m+[m[32m        "lineups": lineups,[m
[32m+[m[32m    })[m
 [m
 [m
 if __name__ == "__main__":[m
[31m-    app.run(debug=True)[m
\ No newline at end of file[m
[32m+[m[32m    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))[m
\ No newline at end of file[m
