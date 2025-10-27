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

export function getBalance(userId: string): number | null {
    const stmt: Database.Statement = db.prepare(`
        SELECT balance FROM wallet WHERE user_id = ?
        `);
    const result: Database.RunResult = stmt.get(userId);
    return result ? result.balance : null;
}

export function award(userId: string, amount: number): boolean {
    const stmt: Database.Statement = db.prepare(`
        UPDATE wallet SET balance = balance + ? WHERE user_id = ?
        `);
    const info: Database.RunResult = stmt.run(amount, userId);
    return info.changes > 0;
}
