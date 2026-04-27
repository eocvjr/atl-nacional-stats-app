from .db import get_connection


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS matches (
        event_id INTEGER PRIMARY KEY,
        home_team TEXT,
        away_team TEXT,
        home_team_id INTEGER,
        away_team_id INTEGER,
        home_score INTEGER,
        away_score INTEGER,
        status TEXT,
        start_time INTEGER,
        date TEXT,
        time TEXT,
        tournament_name TEXT,
        country_name TEXT,
        season_name TEXT,
        stadium TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS standings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        position INTEGER,
        team_name TEXT,
        played INTEGER,
        wins INTEGER,
        draws INTEGER,
        losses INTEGER,
        goals_for INTEGER,
        goals_against INTEGER,
        goal_diff INTEGER,
        points INTEGER,
        FOREIGN KEY (event_id) REFERENCES matches(event_id)
    )
    """)

        cur.execute("""
    CREATE TABLE IF NOT EXISTS lineups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        team_side TEXT,
        team_id INTEGER,
        team_name TEXT,
        player_id INTEGER,
        player_name TEXT,
        shirt_number INTEGER,
        position TEXT,
        rating REAL,
        goals INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        yellow_cards INTEGER DEFAULT 0,
        red_cards INTEGER DEFAULT 0,
        is_substitute INTEGER DEFAULT 0,
        subbed_in INTEGER DEFAULT 0,
        subbed_out INTEGER DEFAULT 0,

        goal_minute TEXT,
        assist_minute TEXT,
        yellow_card_minute TEXT,
        red_card_minute TEXT,
        subbed_in_minute TEXT,
        subbed_out_minute TEXT,

        FOREIGN KEY (event_id) REFERENCES matches(event_id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS player_match_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        team_id INTEGER,
        team_name TEXT,
        player_id INTEGER,
        player_name TEXT,
        position TEXT,
        stat_name TEXT,
        stat_value TEXT,
        stat_group TEXT,
        FOREIGN KEY (event_id) REFERENCES matches(event_id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS match_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        period TEXT,
        stat_name TEXT,
        home_value TEXT,
        away_value TEXT,
        FOREIGN KEY (event_id) REFERENCES matches(event_id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS season_player_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        player_name TEXT NOT NULL,
        position TEXT,
        team_name TEXT DEFAULT 'Atlético Nacional',
        season_name TEXT DEFAULT '2026-I',

        avg_rating REAL DEFAULT 0,
        appearances INTEGER DEFAULT 0,

        goals INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        goals_assists INTEGER DEFAULT 0,

        xg_scored REAL DEFAULT 0,
        xa_assisted REAL DEFAULT 0,
        xg_xa REAL DEFAULT 0,

        penalty_goals INTEGER DEFAULT 0,
        penalties_taken INTEGER DEFAULT 0,

        big_chances_missed INTEGER DEFAULT 0,
        big_chances_created INTEGER DEFAULT 0,

        accurate_passes_per_match REAL DEFAULT 0,
        accurate_passes_pct REAL DEFAULT 0,

        key_passes_per_match REAL DEFAULT 0,
        successful_dribbles_per_match REAL DEFAULT 0,
        successful_dribbles_pct REAL DEFAULT 0,

        penalties_won INTEGER DEFAULT 0,

        tackles_per_match REAL DEFAULT 0,
        interceptions_per_match REAL DEFAULT 0,
        clearances_per_match REAL DEFAULT 0,
        defensive_contributions_per_match REAL DEFAULT 0,

        dispossessed_per_match REAL DEFAULT 0,

        yellow_cards INTEGER DEFAULT 0,
        red_cards INTEGER DEFAULT 0,

        UNIQUE(player_name, season_name)
    )
    """)

    conn.commit()
    conn.close()
    print("Database initialized successfully.")


if __name__ == "__main__":
    init_db()