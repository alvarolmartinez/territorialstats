-- schema.sql

CREATE TABLE IF NOT EXISTS clan_stats (
    clan_id INTEGER PRIMARY KEY,
    timestamp TEXT,
    score REAL,
);
