import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { getAllShopItems, type ShopItem } from '../../database/shop.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('List everything for sale at the shop'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const allShopItems: ShopItem[] = getAllShopItems();
        const shopString: string =
            '**All Items For Sale**\n\n'
            + '```\n'
            + 'ID  | Item Name           | Price\n'
            + '----+--------------------+-------\n'
            + allShopItems.map((item: ShopItem) =>
                `${item.item_id.toString().padEnd(3)} | ${item.item_name.padEnd(19)} | ${item.price} coins`,
            ).join('\n')
            + '\n```';

        const shopEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Shop')
            .setColor(0x00FF99)
            .setDescription(shopString);

        await interaction.reply({ embeds: [shopEmbed] });
    },
} satisfies Command;
