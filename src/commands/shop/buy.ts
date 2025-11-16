import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { getBalance, deduct } from '../../database/wallet.js';
import { addItemToInventory, getItemCount } from '../../database/inventory.js';
import { getShopItem } from '../../database/shop.js';
import type { ShopItem } from '../../database/shop.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy an item from the shop (use /shop for ids)')
        .addNumberOption((option: any) =>
            option.setName('item_id')
                .setDescription('Item ID of item being purchased (use /shop to see listings)')
                .setRequired(true),
        ),
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const itemID: number = interaction.options.getNumber('item_id', true);
        const user: string = interaction.user.id;
        const balance: number | null = getBalance(user);
        const item: ShopItem | null = getShopItem(itemID);

        if (item === null) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Item not found');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (balance === null) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('You don\'t have an account or you\'re BROKE');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (balance < item.price) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setTitle('Insufficient Funds')
                .setDescription(`You need **${item.price}** coins but only have **${balance}** coins`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (addItemToInventory(user, item.item_id)) {
            deduct(user, item.price);
            const itemCount: number = getItemCount(user, item.item_id);
            const newBalance: number = balance - item.price;

            const successEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0x6600FF)
                .setTitle('Purchase Successful')
                .setDescription(`You purchased **${item.item_name}**`)
                .addFields(
                    { name: 'Quantity Owned', value: `${itemCount}`, inline: true },
                    { name: 'Cost', value: `${item.price} coins`, inline: true },
                    { name: 'Remaining Balance', value: `${newBalance} coins`, inline: true },
                )
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed] });
        }
        else {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Could not complete purchase. Database error.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
} satisfies Command;
