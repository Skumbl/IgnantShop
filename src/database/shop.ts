import { db } from './index.js';
import type Database from 'better-sqlite3';

export function createItem(itemName: string, itemValue: number): boolean {
    if (!itemName || !itemValue || itemExistsByName(itemName)) return false;

    const stmt: Database.Statement = db.prepare(`
        INSERT INTO shop (item_name, price, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result: Database.RunResult = stmt.run(itemName, itemValue);
    return result.changes > 0;
}

export function updateItem(itemId: number, itemName: string, itemValue: number): boolean {
    if (!itemName || !itemValue || itemExistsById(itemId)) return false;

    const stmt: Database.Statement = db.prepare(`
        UPDATE shop SET item_name = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ?
    `);
    const result: Database.RunResult = stmt.run(itemName, itemValue, itemId);
    return result.changes > 0;
}

export function deleteItem(itemId: number): boolean {
    if (!itemId || !itemExistsById(itemId)) return false;

    const stmt: Database.Statement = db.prepare(`
        DELETE FROM shop WHERE item_id = ?
    `);
    const result: Database.RunResult = stmt.run(itemId);
    return result.changes > 0;
}

function itemExistsByName(itemName: string): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM shop WHERE item_name = ?
    `);
    const result: { count: number } = stmt.get(itemName) as { count: number };
    return result.count > 0;
}

// helper functions
function itemExistsById(itemId: number): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM shop WHERE item_id = ?
    `);
    const result: { count: number } = stmt.get(itemId) as { count: number };
    return result.count > 0;
}
