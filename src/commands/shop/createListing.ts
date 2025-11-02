import { SlashCommandBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { isIgnant } from '../../utils/auth.js';
import { createItem } from '../../database/shop.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create-listing')
        .setDescription('create ignant store list')

        .addStringOption((option: any) => option
            .setName('name')
            .setDescription('The name of the item')
            .setRequired(true),
        )

        .addNumberOption((option: any) => option
            .setName('price')
            .setDescription('The description of the item')
            .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const name: string = interaction.options.getString('name', true);
        const price: number = interaction.options.getNumber('price', true);
        const result: boolean = createItem(name, price);

        if (!isIgnant(interaction.user.id)) {
            await interaction.reply('You\'re not Ignant, I don\'t have to listen to you');
            return;
        }

        if (!result) {
            await interaction.reply('Failed to create listing!');
            return;
        }

        await interaction.reply(
            `Created New Item Listing: \n
            ${name}: $${price}`);
    },

} satisfies Command;
