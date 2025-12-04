import { db } from './index.js';
import type Database from 'better-sqlite3';
import { logFailure, logSuccess } from './logger.js';

export interface LostRecord {
    user_id: string;
    amount: number;
    created_at: string;
    updated_at: string;
}

export function createLostRecord(user_id: string, amount: number): boolean {
    if (amount <= 0) {
        logFailure('createLostRecord', 'lost', { user_id, amount });
        return false;
    }
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO lost (user_id, amount, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
    const result: Database.RunResult = stmt.run(user_id, amount);
    if (result.changes > 0) {
        logSuccess('createLostRecord', 'lost', { user_id, amount });
        return true;
    }
    logFailure('createLostRecord', 'lost', { user_id, amount });
    return false;
}

// check if LostRecord exists to update and if not create one and update
export function addLostRecord(user_id: string, amount: number): boolean {
    if (amount <= 0) {
        logFailure('addLostRecord', 'lost', { user_id, amount });
        return false;
    }
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO lost (user_id, amount, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET amount = amount + excluded.amount, updated_at = CURRENT_TIMESTAMP`);
    const result: Database.RunResult = stmt.run(user_id, amount);
    if (result.changes > 0) {
        logSuccess('addLostRecord', 'lost', { user_id, amount });
        return true;
    }
    logFailure('addLostRecord', 'lost', { user_id, amount });
    return false;
}

export function getLostRecord(user_id: string): LostRecord | null {
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM lost WHERE user_id = ?`);
    const result: LostRecord | undefined = stmt.get(user_id) as LostRecord | undefined;
    if (result) {
        logSuccess('getLostRecord', 'lost', { user_id });
    }
    else {
        logFailure('getLostRecord', 'lost', { user_id });
    }
    return result ?? null;
}

export function getAllLostRecords(): LostRecord[] {
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM lost`);
    const results: LostRecord[] = stmt.all() as LostRecord[];
    logSuccess('getAllLostRecords', 'lost', { count: results.length });
    return results;
}
