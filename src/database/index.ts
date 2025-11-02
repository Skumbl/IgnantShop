import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbPath: string = path.join(import.meta.dirname, '..', 'data', 'ignantShop.db');

if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const db: DatabaseType = new Database(dbPath);

db.pragma('foreign_keys = ON');

export function initDB(): void {
    // wallet table
    db.exec(`
        CREATE TABLE IF NOT EXISTS wallet (
            user_id TEXT PRIMARY KEY,
            balance INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
    // shop table (what's available  to buy)
    db.exec(`
        CREATE TABLE IF NOT EXISTS shop (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            price INTEGER NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
    // user inventory table
    db.exec(`
        CREATE TABLE IF NOT EXISTS inventory (
            inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,  -- Changed from PRIMARY KEY
            item_id INTEGER NOT NULL,  -- Changed to INTEGER to match shop.item_id
            item_name TEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES wallet(user_id),
            FOREIGN KEY (item_id) REFERENCES shop(item_id)
        )
    `);

    console.log('[Database] Database initialized');
}
