import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { User } from 'discord.js';
import type { Command } from '../../types/index.js';
import * as wallet from '../../database/wallet.js';

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
    async execute(interaction: CommandInteraction): Promise<void> {
        const accountHolder: User = interaction.options.getUser('user');
        const accountBalance: number = interaction.options.getNumber('balance');

        if (!accountHolder || !accountBalance) {
            await interaction.reply('Invalid user or balance');
            return;
        }

        const accountCreated: boolean = wallet.createNewAccount(accountHolder.id, accountBalance);

        if (accountCreated) {
            await interaction.reply(`Account created for ${accountHolder.username}`);
        }
        else {
            await interaction.reply(`Failed to create account for ${accountHolder.username}`);
        }
    },
} satisfies Command;
