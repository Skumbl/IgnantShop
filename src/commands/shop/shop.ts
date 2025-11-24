import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { getAllShopItems, type ShopItem } from '../../database/shop.js';
import type { Command } from '../../types/index.js';
import { colors } from '../../config/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('List everything for sale at the shop'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const allShopItems: ShopItem[] = getAllShopItems();
        const colbyCoinImage: string = 'https://imgur.com/yWDKuJB.png';
        const MAX_NAME_LENGTH: number = 25;

        const shopString: string =
            '**All Items For Sale**\n\n'
            + '```\n'
            + 'ID  | Item Name                 | Price\n'
            + '----+---------------------------+-------\n'
            + allShopItems.map((item: ShopItem) => {
                const truncatedName: string = item.item_name.length > MAX_NAME_LENGTH
                    ? item.item_name.substring(0, MAX_NAME_LENGTH - 3) + '...'
                    : item.item_name.padEnd(MAX_NAME_LENGTH);
                return `${item.item_id.toString().padEnd(3)} | ${truncatedName} | ${item.price} coins`;
            }).join('\n')
            + '\n```';

        const shopEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Shop')
            .setColor(colors.purple)
            .setDescription(shopString)
            .setImage(colbyCoinImage);

        await interaction.reply({ embeds: [shopEmbed] });
    },
} satisfies Command;
