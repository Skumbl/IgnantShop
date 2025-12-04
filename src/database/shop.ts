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
        logFailure('createItem', 'shop', { itemName, itemValue });
        return false;
    }
    const stmt: Database.Statement = db.prepare(`
        INSERT INTO shop (item_name, price, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result: Database.RunResult = stmt.run(itemName, itemValue);
    if (result.changes > 0) {
        logSuccess('createItem', 'shop', { itemId: result.lastInsertRowid });
        return true;
    }
    logFailure('createItem', 'shop', { itemName, itemValue });
    return false;
}

export function getShopItem(itemId: number): ShopItem | null {
    if (!itemId) {
        logFailure('getShopItem', 'shop', { itemId });
        return null;
    }
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM shop WHERE item_id = ?
    `);
    const result: ShopItem | undefined = stmt.get(itemId) as ShopItem | undefined;
    if (result) {
        logSuccess('getShopItem', 'shop', `Item ${result.item_name} retrieved successfully`);
        return result;
    }
    logFailure('getShopItem', 'shop', `Item ${itemId} not found`);
    return null;
}

export function getAllShopItems(): ShopItem[] {
    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM shop ORDER BY price ASC
    `);
    const result: ShopItem[] = stmt.all() as ShopItem[];
    logSuccess('getAllShopItems', 'shop', `Retrieved ${result.length} items`);
    return result;
}

export function updateItem(itemId: number, itemName: string, itemValue: number): boolean {
    if (!itemName || !itemValue || !itemExistsById(itemId)) {
        logFailure('updateItem', 'shop', `Item ${itemId} not found`);
        return false;
    }
    const stmt: Database.Statement = db.prepare(`
        UPDATE shop SET item_name = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ?
    `);
    const result: Database.RunResult = stmt.run(itemName, itemValue, itemId);
    if (result.changes > 0) {
        logSuccess('updateItem', 'shop', `Item ${itemId} updated successfully`);
        return true;
    }
    logFailure('updateItem', 'shop', `Item ${itemId} not updated`);
    return false;
}

export function deleteItem(itemId: number): boolean {
    if (!itemId || !itemExistsById(itemId)) {
        logFailure('deleteItem', 'shop', `Item ${itemId} not found`);
        return false;
    }
    const stmt: Database.Statement = db.prepare(`
        DELETE FROM shop WHERE item_id = ?
    `);
    const result: Database.RunResult = stmt.run(itemId);
    if (result.changes > 0) {
        logSuccess('deleteItem', 'shop', `Item ${itemId} deleted successfully`);
        return true;
    }
    logFailure('deleteItem', 'shop', `Item ${itemId} not deleted`);
    return false;
}

// helper functions
function itemExistsByName(itemName: string): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM shop WHERE item_name = ?
    `);
    const result: { count: number } = stmt.get(itemName) as { count: number };
    if (result.count > 0) {
        logSuccess('itemExistsByName', 'shop', `Item ${itemName} exists`);
        return true;
    }
    logFailure('itemExistsByName', 'shop', `Item ${itemName} not found`);
    return false;
}

function itemExistsById(itemId: number): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM shop WHERE item_id = ?
    `);
    const result: { count: number } = stmt.get(itemId) as { count: number };
    if (result.count > 0) {
        logSuccess('itemExistsById', 'shop', `Item ${itemId} exists`);
        return true;
    }
    logFailure('itemExistsById', 'shop', `Item ${itemId} not found`);
    return false;
}
