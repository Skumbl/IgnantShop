import { ChatInputCommandInteraction, SlashCommandBuilder, User, EmbedBuilder } from 'discord.js';
import { getItemCount, removeItemFromInventory, findInventoryId } from '../../database/inventory.js';
import { getShopItem, type ShopItem } from '../../database/shop.js';
import { award } from '../../database/wallet.js';
import { colors } from '../../config/colors.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('return')
        .setDescription('Return an item from the shop')
        .addNumberOption((option: any) =>
            option.setName('item')
                .setDescription('The item ID to return')
                .setRequired(true),
        )
        .addNumberOption((option: any) =>
            option.setName('quantity')
                .setDescription('The quantity of the item to return')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const itemId: number | null = interaction.options.getNumber('item');
        const quantity: number | null = interaction.options.getNumber('quantity');
        const user: User = interaction.user;

        if (!itemId || !quantity || quantity <= 0) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('Invalid item ID or quantity!');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const shopItem: ShopItem | null = getShopItem(itemId);
        if (!shopItem) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('This item does not exist in the shop!');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const itemCount: number = getItemCount(user.id, itemId);
        if (itemCount === 0) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('You do not have this item in your inventory!');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (itemCount < quantity) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription(`You only have ${itemCount} of this item, but you tried to return ${quantity}!`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const refundPercentage: number = 0.7;
        const refundAmount: number = Math.floor(shopItem.price * refundPercentage * quantity);

        let removedCount: number = 0;
        for (let i: number = 0; i < quantity; i++) {
            const inventoryId: number | null = findInventoryId(user.id, itemId);
            if (inventoryId && removeItemFromInventory(inventoryId)) {
                removedCount++;
            }
        }

        if (removedCount !== quantity) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription(`Something went wrong! Only removed ${removedCount} items.`);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        award(user.id, refundAmount);

        const successEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.green)
            .setTitle('Item Returned')
            .setDescription(`Successfully returned **${quantity}x ${shopItem.item_name}**\n💰 Refund: ${refundAmount} (${refundPercentage * 100}% of original price)`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
} satisfies Command;
