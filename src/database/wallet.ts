import { db } from './index.js';
import type Database from 'better-sqlite3';

export function createNewAccount(userId: string, amount: number): boolean {
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO wallet (user_id, balance, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
    const info: Database.RunResult = stmt.run(userId, amount);
    return info.changes > 0;
}
