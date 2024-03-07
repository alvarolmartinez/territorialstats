import requests, sqlite3
import datetime as dt

# Constants specific to how the data is stored on territorial.io
URL = "https://territorial.io/clans"
CLAN_DATA_START = 6

data = list()
conn = None

try:
    # Fetch clan data
    response = requests.get(url=URL)

    # Split the response text by lines
    lines = response.text.split('\n')

    # Extract the timestamp from the second line
    timestamp_str = lines[2].strip()
    timestamp = dt.datetime.strptime(timestamp_str, '%a, %d %b %Y %H:%M:%S GMT')
    sql_timestamp = timestamp.strftime('%Y-%m-%d %H:%M:%S')

    # Process each line to extract the data
    for line in lines[CLAN_DATA_START:]:
        if line:
            parts = line.split(',')
            ranking = parts[0].strip()
            score = parts[-1].strip()
            clan_id = ','.join(parts[1:-1]).strip()  # Join back any commas in the clan name
            data.append((clan_id, sql_timestamp, int(ranking), float(score)))
except requests.RequestException as e:
    print(f"Error fetching data from {URL}: {e}")
except ValueError as e:
    print(f"Error parsing data: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

try:
    # Connect to SQLite database
    conn = sqlite3.connect('../data/territorial_stats.db')
    cursor = conn.cursor()

    # Execute SQL commands from the schema file
    with open('../schema.sql', 'r') as sql_file:
        cursor.executescript(sql_file.read())

    # Insert data into the clan_stats table
    cursor.executemany('INSERT INTO clan_stats VALUES (?,?,?,?)', data)

    # Commit the transaction and close the connection
    conn.commit()
except sqlite3.DatabaseError as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
finally:
    if conn:
        conn.close()
