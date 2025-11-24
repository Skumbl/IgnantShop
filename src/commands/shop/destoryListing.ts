import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import { isIgnant } from '../../utils/auth.js';
import { deleteItem } from '../../database/shop.js';
import type { Command } from '../../types/index.js';
import { colors } from '../../config/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('destroy-listing')
        .setDescription('Destroy a listing')
        .addNumberOption((option: any) =>
            option.setName('id')
                .setDescription('The ID of the listing')
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!isIgnant(interaction.user.id)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('You\'re not Ignant, I don\'t have to listen to you');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const id: number = interaction.options.getNumber('id', true);
        const deletedItem: boolean = deleteItem(id);

        if (!deletedItem) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('Listing not found.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const successEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.red)
            .setTitle('Listing Destroyed')
            .setDescription(`Successfully deleted listing with ID **${id}**`)
            .setTimestamp();
        await interaction.reply({ embeds: [successEmbed] });
    },
} satisfies Command;
