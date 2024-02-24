-- schema.sql

CREATE TABLE IF NOT EXISTS clan_stats (
    clan_id TEXT PRIMARY KEY,
    timestamp TEXT,
    score REAL
);
