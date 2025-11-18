import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { User } from 'discord.js';
import type { Command } from '../../types/index.js';
import { createNewAccount } from '../../database/wallet.js';
import { isIgnant } from '../../utils/auth.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create-account')
        .setDescription('opens a new ignant account for user')
        .addUserOption((option: any) =>
            option
                .setName('user')
                .setDescription('new account hodler')
                .setRequired(true))
        .addNumberOption((option: any) => option
            .setName('balance')
            .setDescription('starting account balance')
            .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const accountHolder: User | null = interaction.options.getUser('user');
        const accountBalance: number | null = interaction.options.getNumber('balance');
        if (!isIgnant(interaction.user.id)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('You are not Ignant, I don\'t need to listen to you');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        if (!accountHolder || !accountBalance) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Invalid user or balance');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const accountCreated: boolean = createNewAccount(accountHolder.id, accountBalance);

        if (accountCreated) {
            const successEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0x66FFB2)
                .setTitle('Account Created')
                .setDescription(`Account created for ${accountHolder}`)
                .addFields(
                    { name: 'Starting Balance', value: `${accountBalance} coins`, inline: true },
                )
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed] });
        }
        else {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(0xFF1A00)
                .setDescription('Cannot create account. Account may already exist.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
} satisfies Command;
