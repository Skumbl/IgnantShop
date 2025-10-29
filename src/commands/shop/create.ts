import { SlashCommandBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { User } from 'discord.js';
import type { Command } from '../../types/index.js';
import { createNewAccount } from '../../database/wallet.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create')
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

        if (!accountHolder || !accountBalance) {
            await interaction.reply('Invalid user or balance');
            return;
        }

        const accountCreated: boolean = createNewAccount(accountHolder.id, accountBalance);

        if (accountCreated) {
            await interaction.reply(`Account created for ${accountHolder.username}`);
        }
        else {
            await interaction.reply('Cannot create account or Account Already Exists');
        }
    },
} satisfies Command;
