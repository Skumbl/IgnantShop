import { db } from './index.js';
import type Database from 'better-sqlite3';
import { logFailure } from './logger.js';

export interface Wallet {
    user_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
}

export function createNewAccount(userId: string, amount: number): boolean {
    if (!userId || amount < 0) {
        logFailure('createNewAccount', 'wallet', { userId, amount });
        return false;
    }
    if (accountExists(userId)) {
        logFailure('createNewAccount', 'wallet', { userId });
        return false;
    }

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

export function getWallet(userId: string): Wallet | null {
    if (!userId) return null;
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM wallet WHERE user_id = ?
    `);
    const result: Wallet | undefined = stmt.get(userId) as Wallet | undefined;
    return result || null;
}

export function award(userId: string, amount: number): boolean {
    if (!userId || amount <= 0 || !accountExists(userId)) return false;
    const stmt: Database.Statement = db.prepare(`
        UPDATE wallet SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?
    `);
    const info: Database.RunResult = stmt.run(amount, userId);
    return info.changes > 0;
}

export function deduct(userId: string, amount: number): boolean {
    if (!userId || amount <= 0 || !accountExists(userId)) return false;

    const balance: number | null = getBalance(userId);
    if (balance == null || balance < amount) return false;

    const stmt: Database.Statement = db.prepare(`
        UPDATE wallet SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?
    `);
    const info: Database.RunResult = stmt.run(amount, userId);
    return info.changes > 0;
}

export function getAllWallets(): { user_id: string; balance: number }[] {
    const stmt: Database.Statement = db.prepare(`
        SELECT user_id, balance FROM wallet ORDER BY balance DESC
    `);
    return stmt.all() as { user_id: string; balance: number }[];
}

// helper functions
function accountExists(userId: string): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM wallet WHERE user_id = ?
    `);
    const result: { count: number } | undefined = stmt.get(userId) as { count: number } | undefined;
    return result ? result.count > 0 : false;
}
