import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { isIgnant } from '../../utils/auth.js';
import { getBalance, deduct } from '../../database/wallet.js';
import { addItemToInventory, getItemCount } from '../../database/inventory.js';
import { getShopItem } from '../../database/shop.js';

import type { ShopItem } from '../../database/shop.js';
import type { InventoryItem } from '../../database/inventory.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy an item from the shop')
        .addNumberOption((option: any) =>
            option.setName('itemID')
                .setDescription('Item ID of item being purchased (use /shop to see listings)')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!isIgnant(interaction.user.id)) {
            await interaction.reply("You're not Ignant, I don't need to listen to you");
            return;
        }

    }
