from flask import Flask, jsonify, request, render_template
import sqlite3

app = Flask(__name__)

DATABASE_PATH = '../data/territorial_stats.db'  

@app.route('/')
def home():
    return render_template('/index.html')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  
    return conn

@app.route('/clan_history', methods=['GET'])
def fetch_clan_history():
    """Endpoint to fetch history data for a given clan."""
    clan_id = request.args.get('clan_id')
    if not clan_id:
        return 'Clan ID is required', 400
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT timestamp, score, ranking FROM clan_stats WHERE clan_id = ? ORDER BY timestamp', (clan_id,))
    data = c.fetchall()
    conn.close()
    return jsonify([{"timestamp": row['timestamp'], "score": row['score'], "ranking": row['ranking']} for row in data])


@app.route('/latest_scores')
def fetch_latest_scores():
    """Endpoint to fetch the latest scores of all clans, defaulting to 0 for clans without a recent entry."""
    conn = get_db_connection()
    query = """
    SELECT DISTINCT all_clans.clan_id, 
           COALESCE(latest_scores.score, 0) AS score
    FROM (
        SELECT DISTINCT clan_id FROM clan_stats
    ) all_clans
    LEFT JOIN (
        SELECT cs1.clan_id, cs1.score
        FROM clan_stats cs1
        INNER JOIN (
            SELECT clan_id, MAX(timestamp) as max_timestamp
            FROM clan_stats
            GROUP BY clan_id
        ) max_date ON cs1.clan_id = max_date.clan_id AND cs1.timestamp = max_date.max_timestamp
    ) latest_scores ON all_clans.clan_id = latest_scores.clan_id
    ORDER BY all_clans.clan_id
    """
    c = conn.cursor()
    c.execute(query)
    data = c.fetchall()
    conn.close()
    return jsonify([{"clan_id": row['clan_id'], "score": row['score']} for row in data])



@app.route('/clan_names')
def clan_names():
    """Endpoint to fetch all the clan names."""
    conn = get_db_connection()
    query = """
    SELECT DISTINCT clan_id FROM clan_stats ORDER BY clan_id;
    """
    c = conn.cursor()
    c.execute(query)
    data = c.fetchall()
    conn.close()
    return jsonify([{"clan_id": row['clan_id']} for row in data])


def check_database_integrity(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Execute the integrity check
        cursor.execute('PRAGMA integrity_check')
        result = cursor.fetchone()

        if result and result[0] == 'ok':
            print("Database integrity check passed.")
        else:
            print("Database integrity check failed:", result)

    except sqlite3.Error as e:
        print("An error occurred:", e)
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)
