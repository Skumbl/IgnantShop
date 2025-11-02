import { db } from './index.js';
import type Database from 'better-sqlite3';

export interface InventoryItem {
    inventory_id: number;
    user_id: string;
    item_id: number;
    item_name: string;
    created_at: string;
    updated_at: string;
}

export function addItemToInventory(userId: string, itemId: number, itemName: string): boolean {
    if (!userId || !itemId || !itemName) return false;

    const stmt: Database.Statement = db.prepare(`
        INSERT INTO inventory (user_id, item_id, item_name, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result: Database.RunResult = stmt.run(userId, itemId, itemName);
    return result.changes > 0;
}

export function removeItemFromInventory(inventoryId: number): boolean {
    if (!inventoryId || !inventoryItemExists(inventoryId)) return false;

    const stmt: Database.Statement = db.prepare(`
        DELETE FROM inventory WHERE inventory_id = ?
    `);
    const result: Database.RunResult = stmt.run(inventoryId);
    return result.changes > 0;
}

export function getUserInventory(userId: string): InventoryItem[] {
    if (!userId) return [];

    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM inventory WHERE user_id = ? ORDER BY created_at DESC
    `);
    const results: InventoryItem[] = stmt.all(userId) as InventoryItem[];
    return results;
}

export function getItemCount(userId: string, itemId: number): number {
    if (!userId || !itemId) return 0;

    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM inventory WHERE user_id = ? AND item_id = ?
    `);
    const result: { count: number } = stmt.get(userId, itemId) as { count: number };
    return result.count;
}

export function userHasItem(userId: string, itemId: number): boolean {
    return getItemCount(userId, itemId) > 0;
}

export function getTotalInventoryCount(userId: string): number {
    if (!userId) return 0;

    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM inventory WHERE user_id = ?
    `);
    const result: { count: number } = stmt.get(userId) as { count: number };
    return result.count;
}

export function getInventoryItem(inventoryId: number): InventoryItem | null {
    if (!inventoryId) return null;

    const stmt: Database.Statement = db.prepare(`
        SELECT * FROM inventory WHERE inventory_id = ?
    `);
    const result: InventoryItem | undefined = stmt.get(inventoryId) as InventoryItem | undefined;
    return result || null;
}

export function clearUserInventory(userId: string): boolean {
    if (!userId) return false;

    const stmt: Database.Statement = db.prepare(`
        DELETE FROM inventory WHERE user_id = ?
    `);
    const result: Database.RunResult = stmt.run(userId);
    return result.changes > 0;
}

// Helper functions
function inventoryItemExists(inventoryId: number): boolean {
    const stmt: Database.Statement = db.prepare(`
        SELECT COUNT(*) as count FROM inventory WHERE inventory_id = ?
    `);
    const result: { count: number } = stmt.get(inventoryId) as { count: number };
    return result.count > 0;
}
