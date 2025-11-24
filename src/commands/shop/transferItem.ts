import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { userHasItem, findInventoryId, addItemToInventory, removeItemFromInventory, getInventoryItem } from '../../database/inventory.js';
import type { InventoryItem } from '../../database/inventory.js';
import type { User } from 'discord.js';
import type { Command } from '../../types/index.js';
import { colors } from '../../config/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('transfer-item')
        .setDescription('Transfer an item from your inventory to another user.')
        .addUserOption((option: any) =>
            option.setName('user')
                .setDescription('The user to transfer the item to.')
                .setRequired(true),
        )
        .addNumberOption((option: any) =>
            option.setName('item-id')
                .setDescription('Id of the item being transfer.')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const user: User = interaction.user;
        const targetUser: User | null = interaction.options.getUser('user');
        const itemId: number | null = interaction.options.getNumber('item-id');

        if (!itemId || !targetUser) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('Invalid input, try again shidass');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (!userHasItem(user.id, itemId)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('You do not have this item in your inventory.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const inventoryId: number | null = findInventoryId(user.id, itemId);

        if (!inventoryId) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('Item not found in your inventory.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const item: InventoryItem | null = getInventoryItem(inventoryId);

        if (!item) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('Item not found in your inventory.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        removeItemFromInventory(inventoryId);
        addItemToInventory(targetUser.id, itemId);

        const successEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.green)
            .setTitle('Transfer Success')
            .setDescription(`Successfully transferred 1 ${item.item_name} to ${user.username}.`)
            .setTimestamp();
        await interaction.reply({ embeds: [successEmbed] });
    },
} satisfies Command;
