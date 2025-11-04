import { SlashCommandBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { isIgnant } from '../../utils/auth.js';
import { deleteItem } from '../../database/shop.js';
import type { Command } from '../../types/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('destroy-listing')
        .setDescription('Destroy a listing')

        .addNumberOption((option: any) =>
            option.setName('id')
                .setDescription('The ID of the listing')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!isIgnant(interaction.user.id)) {
            await interaction.reply('You\'re not Ignant, I don\'t have to listen to you');
            return;
        }

        const id: number = interaction.options.getNumber('id', true);
        const deletedItem: boolean = deleteItem(id);
        if (!deletedItem) {
            await interaction.reply('Listing not found.');
            return;
        }
        await interaction.reply('Listing destroyed.');
    }
} as Command;
