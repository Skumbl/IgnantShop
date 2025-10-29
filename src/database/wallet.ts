import { db } from './index.js';
import type Database from 'better-sqlite3';

export function createNewAccount(userId: string, amount: number): boolean {
    if (!userId || !amount) return false;
    if (accountExists(userId)) return false;
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO wallet (user_id, balance, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const info: Database.RunResult = stmt.run(userId, amount);
    return info.changes > 0;
}

export function getBalance(userId: string): number | null {
    if (!userId) return null;
    const stmt: Database.Statement = db.prepare(`
        SELECT balance FROM wallet WHERE user_id = ?
    `);
    const result: { balance: number } | undefined = stmt.get(userId) as { balance: number } | undefined;
    return result ? result.balance : null;
}

export function award(userId: string, amount: number): boolean {
    if (!userId || !amount || !accountExists(userId)) return false;

    const stmt: Database.Statement = db.prepare(`
        UPDATE wallet SET balance = balance + ? WHERE user_id = ?
    `);
    const info: Database.RunResult = stmt.run(amount, userId);
    return info.changes > 0;
}

export function deduct(userId: string, amount: number): boolean {
    if (!userId || !amount || !accountExists(userId)) return false;

    const stmt: Database.Statement = db.prepare(`
        UPDATE wallet SET balance = balance - ? WHERE user_id = ?
    `);
    const info: Database.RunResult = stmt.run(amount, userId);
    return info.changes > 0;
}

// helper functions
function accountExists(userId: string): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM wallet WHERE user_id = ?
    `);
    const result: { count: number } | undefined = stmt.get(userId) as { count: number } | undefined;
    return result ? result.count > 0 : false;
}
