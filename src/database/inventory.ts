import { db } from './index.js';
import type Database from 'better-sqlite3';
import { logFailure, logSuccess } from './logger.js';

export interface InventoryItem {
    inventory_id: number;
    user_id: string;
    item_id: number;
    item_name: string;
    created_at: string;
    updated_at: string;
}

export function addItemToInventory(userId: string, itemId: number): boolean {
    if (!userId || !itemId) {
        logFailure('addItemToInventory', 'inventory', { userId, itemId });
    }

    const stmt: Database.Statement = db.prepare(`
        INSERT INTO inventory (user_id, item_id, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result: Database.RunResult = stmt.run(userId, itemId);
    if (result.changes > 0) {
        logSuccess('addItemToInventory', 'inventory', { userId, itemId });
        return true;
    }
    logFailure('addItemToInventory', 'inventory', { userId, itemId });
    return false;
}

export function removeItemFromInventory(inventoryId: number): boolean {
    if (!inventoryId || !inventoryItemExists(inventoryId)) {
        logFailure('removeItemFromInventory', 'inventory', { inventoryId });
        return false;
    }

    const stmt: Database.Statement = db.prepare(`
        DELETE FROM inventory WHERE inventory_id = ?
    `);
    const result: Database.RunResult = stmt.run(inventoryId);
    if (result.changes > 0) {
        logSuccess('removeItemFromInventory', 'inventory', { inventoryId });
        return true;
    }
    logFailure('removeItemFromInventory', 'inventory', { inventoryId });
    return false;
}

export function getUserInventory(userId: string): InventoryItem[] {
    if (!userId) return [];

    const stmt: Database.Statement = db.prepare(`
        SELECT
            i.inventory_id,
            i.user_id,
            i.item_id,
            s.item_name,
            i.created_at,
            i.updated_at
        FROM inventory i
        JOIN shop s ON i.item_id = s.item_id
        WHERE i.user_id = ?
        ORDER BY i.created_at DESC
    `);
    logSuccess('getUserInventory', 'inventory', { userId });
    return stmt.all(userId) as InventoryItem[];
}

// return the number of an item in a user's inventory
export function getItemCount(userId: string, itemId: number): number {
    if (!userId || !itemId) {
        logFailure('getItemCount', 'invalid arguments', { userId, itemId });
        return 0;
    }

    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM inventory WHERE user_id = ? AND item_id = ?
    `);
    const result: { count: number } = stmt.get(userId, itemId) as { count: number };
    logSuccess('getItemCount', 'count', { userId, itemId, count: result.count });
    return result.count;
}

export function userHasItem(userId: string, itemId: number): boolean {
    logSuccess('userHasItem', 'checking', { userId, itemId });
    return getItemCount(userId, itemId) > 0;
}

export function getTotalInventoryCount(userId: string): number {
    if (!userId) {
        logFailure('getTotalInventoryCount', 'invalid arguments', { userId });
        return 0;
    }

    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM inventory WHERE user_id = ?
    `);
    const result: { count: number } = stmt.get(userId) as { count: number };
    logSuccess('getTotalInventoryCount', 'count', { userId, count: result.count });
    return result.count;
}

export function getInventoryItem(inventoryId: number): InventoryItem | null {
    if (!inventoryId) {
        logFailure('getInventoryItem', 'invalid arguments', { inventoryId });
        return null;
    }

    const stmt: Database.Statement = db.prepare(`
        SELECT
            i.inventory_id,
            i.user_id,
            i.item_id,
            s.item_name,
            i.created_at,
            i.updated_at
        FROM inventory i
        JOIN shop s ON i.item_id = s.item_id
        WHERE i.inventory_id = ?
    `);
    const result: InventoryItem | undefined = stmt.get(inventoryId) as InventoryItem | undefined;
    logSuccess('getInventoryItem', 'item', { inventoryId, item: result });
    return result || null;
}

export function clearUserInventory(userId: string): boolean {
    if (!userId) {
        logFailure('clearUserInventory', 'invalid arguments', { userId });
        return false;
    }

    const stmt: Database.Statement = db.prepare(`
        DELETE FROM inventory WHERE user_id = ?
    `);
    const result: Database.RunResult = stmt.run(userId);
    if (result.changes > 0) {
        logSuccess('clearUserInventory', 'inventory cleared', { userId });
        return true;
    }
    logFailure('clearUserInventory', 'inventory not cleared', { userId });
    return false;
}

export function getUserInventoryValue(userId: string): number {
    if (!userId) {
        logFailure('getUserInventoryValue', 'invalid arguments', { userId });
        return 0;
    }

    const stmt: Database.Statement = db.prepare(`
        SELECT SUM(s.price) as total_value
        FROM inventory i
        JOIN shop s ON i.item_id = s.item_id
        WHERE i.user_id = ?
    `);
    const result: { total_value: number | null } = stmt.get(userId) as { total_value: number | null };
    logSuccess('getUserInventoryValue', 'inventory value retrieved', { value: result.total_value });
    return result.total_value || 0;
}

export function findInventoryId(userId: string, itemId: number): number | null {
    if (!userId || !itemId) {
        logFailure('findInventoryId', 'invalid arguments', { userId, itemId });
        return null;
    }

    const stmt: Database.Statement = db.prepare(`
        SELECT inventory_id FROM inventory WHERE user_id = ? AND item_id = ?
    `);
    const result: { inventory_id: number | null } = stmt.get(userId, itemId) as { inventory_id: number | null };
    logSuccess('findInventoryId', 'inventory id found', { inventoryId: result.inventory_id });
    return result.inventory_id || null;
}


// Helper functions
function inventoryItemExists(inventoryId: number): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM inventory WHERE inventory_id = ?
    `);
    const result: { count: number } = stmt.get(inventoryId) as { count: number };
    return result.count > 0;
}
