// import { Events, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
// import type { ChatInputCommandInteraction, Interaction } from 'discord.js';
// import type { Command } from '../../types/index.js';
// import {
//     getGame,
//     deleteGame,
//     playerHit,
//     dealerPlay,
//     calculateHand,
//     gameOutcome,
//     formatHand,
//     type BlackjackGame
// } from '../../utils/blackjackLogic.js';
// import { deduct, award, getBalance } from '../../database/wallet.js';

// export default {
//     data: new SlashCommandBuilder()
//         .setName('blackjack')
//         .setDescription('Play a game of blackjack')
//         .addNumberOption((option: any) =>
//             option.setName('bet')
//                 .setDescription('The amount of money to bet')
//                 .setRequired(true)
//         ),
//     execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
//         const userId: string = interaction.user.id;
//         const bet: number | null = interaction.options.getNumber('bet');
//         if (!bet || bet <= 0) {
//             const errorEmbed: EmbedBuilder = new EmbedBuilder()
//                 .setColor(0xFF1A00)
//                 .setDescription('Please enter a valid bet amount.');
//             await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
//             return;
//         }

//         const balance: number | null = getBalance(userId);

//         if (balance === null || balance < bet) {
//             const errorEmbed: EmbedBuilder = new EmbedBuilder()
//                 .setColor(0xFF1A00)
//                 .setDescription('You do not have enough money to place this bet.');
//             await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
//             return;
//         }

//         // I have the money and the bet is valid so it's time to PLAY THE GAME

//         // check that the user doesn't already have a game going
//         if (!getGame(userId)) {
//             const errorEmbed: EmbedBuilder = new EmbedBuilder()
//                 .setColor(0xFF1A00)
//                 .setDescription('You already have a game in progress.');
//             await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
//             return;
//         }


//     }
// } satisfies Command;
