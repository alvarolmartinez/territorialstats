-- schema.sql

CREATE TABLE IF NOT EXISTS clan_stats (
    clan_id TEXT,
    timestamp TEXT,
    score REAL,
    PRIMARY KEY (clan_id, timestamp)
);
