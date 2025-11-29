import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getLostRecord } from '../../database/lost.js';
import { getWallet } from '../../database/wallet.js';
import { colors } from '../../config/colors.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('lost')
        .setDescription('Check the amount of money you\'ve lost gambling'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const userId: string = interaction.user.id;

        if (!getWallet(userId)) {
            const noAccountEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setTitle('No Account')
                .setDescription('You don\'t have an account yet, ask Colby to make you one');
            await interaction.reply({ embeds: [noAccountEmbed] });
            return;
        }

        const lostAmount: number | null = getLostRecord(userId)?.amount || 0;

        if (lostAmount === null) {
            const noLostMoneyEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setTitle('No Lost Money')
                .setDescription('You haven\'t lost any money yet.');
            await interaction.reply({ embeds: [noLostMoneyEmbed] });
        }
        else {
            const lostMoneyEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.blue)
                .setTitle('Womp Womp')
                .setDescription(`You've lost ${lostAmount} coins.`);
            await interaction.reply({ embeds: [lostMoneyEmbed] });
        }
    },
} satisfies Command;
