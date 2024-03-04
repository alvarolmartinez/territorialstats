from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

def get_clan_data():
    """Fetch clan data from the SQLite database."""
    db_path = '../data/territorial_stats.db'
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    # Adjust the SELECT query to order by clan_id and timestamp
    c.execute('SELECT clan_id, timestamp, score FROM clan_stats ORDER BY clan_id, timestamp')
    data = c.fetchall()
    conn.close()
    return data

@app.route('/data')
def fetch_data():
    """Endpoint to fetch data from the SQLite database."""
    data = get_clan_data()
    formatted_data = [{"clan_id": row[0], "timestamp": row[1], "score": row[2]} for row in data]
    return jsonify(formatted_data)

if __name__ == '__main__':
    app.run(debug=True)
