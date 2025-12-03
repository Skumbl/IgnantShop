import { db } from './index.js';
import type Database from 'better-sqlite3';
import { logFailure, logSuccess } from './logger.js';

export interface ShopItem {
    item_id: number;
    item_name: string;
    price: number;
    created_at: string;
    updated_at: string;
}

export function createItem(itemName: string, itemValue: number): boolean {
    if (!itemName || !itemValue || itemExistsByName(itemName)) {
        logFailure('createItem', 'shop', 'Invalid item name or value');
        return false;
    }
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO shop (item_name, price, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result: Database.RunResult = stmt.run(itemName, itemValue);
    if (result.changes > 0) {
        logSuccess('createItem', 'shop', `Item ${itemName} created successfully`);
        return true;
    }
    logFailure('createItem', 'shop', 'Failed to create item');
    return false;
}

export function getShopItem(itemId: number): ShopItem | null {
    if (!itemId) return null;
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM shop WHERE item_id = ?
    `);
    const result: ShopItem | undefined = stmt.get(itemId) as ShopItem | undefined;
    return result || null;
}

export function getAllShopItems(): ShopItem[] {
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM shop ORDER BY price ASC
    `);
    return stmt.all() as ShopItem[];
}

export function updateItem(itemId: number, itemName: string, itemValue: number): boolean {
    if (!itemName || !itemValue || !itemExistsById(itemId)) return false;
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

// helper functions
function itemExistsByName(itemName: string): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM shop WHERE item_name = ?
    `);
    const result: { count: number } = stmt.get(itemName) as { count: number };
    return result.count > 0;
}

function itemExistsById(itemId: number): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM shop WHERE item_id = ?
    `);
    const result: { count: number } = stmt.get(itemId) as { count: number };
    return result.count > 0;
}
