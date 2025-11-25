import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';
import { getUserInventory } from '../../database/inventory.js';
import type { InventoryItem } from '../../database/inventory.js';
import { colors } from '../../config/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your inventory'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const userId: string = interaction.user.id;
        const inventory: InventoryItem[] = getUserInventory(userId);

        if (inventory.length === 0) {
            const emptyEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setTitle('Your Inventory')
                .setDescription('Your inventory is empty');
            await interaction.reply({ embeds: [emptyEmbed] });
            return;
        }

        const itemCounts: Map<number, { name: string; count: number }> = new Map<number, { name: string; count: number }>();

        inventory.forEach((item: InventoryItem) => {
            if (itemCounts.has(item.item_id)) {
                itemCounts.get(item.item_id)!.count++;
            }
            else {
                itemCounts.set(item.item_id, { name: item.item_name, count: 1 });
            }
        });

        const inventoryText: string = Array.from(itemCounts.entries())
            .map(([itemId, data]: [number, { name: string; count: number }]) => `id: ${itemId} **${data.name}** x${data.count}`).join('\n');

        const inventoryEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.blue)
            .setTitle('Your Inventory')
            .setDescription(inventoryText)
            .setFooter({ text: `Total items: ${inventory.length}` })
            .setTimestamp();

        await interaction.reply({ embeds: [inventoryEmbed] });
    },
} satisfies Command;
