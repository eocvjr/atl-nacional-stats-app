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
    player_name TEXT,
    position TEXT,
    rating REAL,
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

    conn.commit()
    conn.close()
    print("Database initialized successfully.")


if __name__ == "__main__":
    init_db()