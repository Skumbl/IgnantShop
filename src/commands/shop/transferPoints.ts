import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, User } from 'discord.js';
import { award, deduct, getBalance } from '../../database/wallet.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('transfer_points')
        .setDescription('Transfer points to another user')
        .addUserOption((option: any) =>
            option.setName('user')
                .setDescription('The user to transfer points to')
                .setRequired(true)
        )
        .addIntegerOption((option: any) =>
            option.setName('amount')
                .setDescription('The amount of points to transfer')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const user: User | null = interaction.user;
        const targetUser: User | null = interaction.options.getUser('user');
        const amount: number | null = interaction.options.getInteger('amount');

        if (!user || !targetUser || !amount) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Invalid input, try again shidass');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        // Check if the user has enough points
        const userPoints: number | null = getBalance(user.id);

        if (!userPoints) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('You don\'t have any points to transfer');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (userPoints < amount) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0x6600FF)
                .setDescription('BROKE, you don\'t have any points to transfer');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        // Transfer points
        deduct(user.id, amount);
        award(targetUser.id, amount);

        const successEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(0x90B494)
            .setTitle('Transfer Success')
            .setDescription(`Successfully transferred ${amount} points to ${user.username}.`)
            .setTimestamp();
        await interaction.reply({ embeds: [successEmbed] });
    }
} satisfies Command;
