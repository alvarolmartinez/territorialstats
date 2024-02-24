import sqlite3

def init_db():
    """Initialize the SQLite database."""
    conn = sqlite3.connect('data/territorial_stats.db')
    c = conn.cursor()
    
    # Create table if it doesn't exist
    c.execute('''
        CREATE TABLE IF NOT EXISTS clan_stats (
            clan_id TEXT PRIMARY KEY,
            timestamp TEXT,
            score REAL
        );
    ''')

    # Commit changes and close connection
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
