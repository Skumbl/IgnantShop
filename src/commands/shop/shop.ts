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
        const colbyCoinImage: string = 'https://imgur.com/yWDKuJB.png';

        // make the display string's width dynamic based of column length to ugly wrapping
        const maxNameLength: number = Math.max(19,
            ...allShopItems.map((item: ShopItem) => item.item_name.length));

        const shopString: string =
            '**All Items For Sale**\n\n'
            + '```\n'
            + `ID  | Item Name${' '.repeat(maxNameLength - 9)} | Price\n`
            + `----+${'-'.repeat(maxNameLength + 2)}+-------\n`
            + allShopItems.map((item: ShopItem) =>
                `${item.item_id.toString().padEnd(3)} | ${item.item_name.padEnd(maxNameLength)} | ${item.price} coins`,
            ).join('\n')
            + '\n```';

        const shopEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Shop')
            .setColor(0x00FF99)
            .setDescription(shopString)
            .setImage(colbyCoinImage);

        await interaction.reply({ embeds: [shopEmbed] });
    },
} satisfies Command;
