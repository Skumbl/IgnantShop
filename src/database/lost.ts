import { db } from './index.js';
import type Database from 'better-sqlite3';

export interface LostRecord {
    user_id: string;
    amount: number;
    created_at: string;
    updated_at: string;
}

export function createLostRecord(user_id: string, amount: number): boolean {
    if (amount <= 0) return false;
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO lost (user_id, amount, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
    const result: Database.RunResult = stmt.run(user_id, amount);
    return result.changes > 0;
}

// check if LostRecord exists to update and if not create one and update
export function addLostRecord(user_id: string, amount: number): boolean {
    if (amount <= 0) return false;
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO lost (user_id, amount, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET amount = amount + excluded.amount, updated_at = CURRENT_TIMESTAMP`);
    const result: Database.RunResult = stmt.run(user_id, amount);
    return result.changes > 0;
}

export function getLostRecord(user_id: string): LostRecord | null {
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM lost WHERE user_id = ?`);
    const result: LostRecord | undefined = stmt.get(user_id) as LostRecord | undefined;
    return result ?? null;
}

export function getAllLostRecords(): LostRecord[] {
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM lost`);
    const results: LostRecord[] = stmt.all() as LostRecord[];
    return results;
}
