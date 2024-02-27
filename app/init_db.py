import sqlite3

def init_db():
    """Initialize the SQLite database."""
    conn = sqlite3.connect('../data/territorial_stats.db')
    c = conn.cursor()
    
    # Drop the existing clan_stats table if it exists
    c.execute('DROP TABLE IF EXISTS clan_stats')

    # Create the clan_stats table with the updated schema
    c.execute('''
        CREATE TABLE clan_stats (
            clan_id TEXT,
            timestamp TEXT,
            score REAL,
            PRIMARY KEY (clan_id, timestamp)
        );
    ''')

    # Insert fake data for testing
    fake_data = [
    ('clan1', '2023-01-01', 100.0),
    ('clan1', '2023-01-02', 110.0),
    ('clan1', '2023-01-03', 104.0),
    ('clan1', '2023-01-04', 112.0),
    ('clan2', '2023-01-01', 123.0),
    ('clan2', '2023-01-02', 80.0),
    ('clan2', '2023-01-03', 145.0),
    ('clan2', '2023-01-04', 209.6),
    ('clan3', '2023-01-01', 200.0),
    ('clan3', '2023-01-02', 210.0),
    ('clan3', '2023-01-03', 220.0),
    ('clan3', '2023-01-04', 230.0),
    ('clan4', '2023-01-01', 250.0),
    ('clan4', '2023-01-02', 260.0),
    ('clan4', '2023-01-03', 270.0),
    ('clan4', '2023-01-04', 280.0),
    ('clan5', '2023-01-01', 300.0),
    ('clan5', '2023-01-02', 310.0),
    ('clan5', '2023-01-03', 320.0),
    ('clan5', '2023-01-04', 330.0)
]

    c.executemany('INSERT INTO clan_stats VALUES (?, ?, ?)', fake_data)

    # Commit changes and close connection
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
