import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/index.js';
import {
    isBlackjack,
    startBlackjackGame,
    getGame,
    deleteGame,
    gameOutcome,
    formatHand,
    type BlackjackGame,
} from '../../utils/blackjackLogic.js';
import { deduct, award, getBalance } from '../../database/wallet.js';
import { colors } from '../../config/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play a game of blackjack')
        .addNumberOption((option: any) =>
            option.setName('bet')
                .setDescription('The amount of money to bet')
                .setRequired(true),
        ),
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const userId: string = interaction.user.id;
        const bet: number | null = interaction.options.getNumber('bet');

        if (!bet || bet <= 0) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('Please enter a valid bet amount.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        const balance: number | null = getBalance(userId);
        if (balance === null || balance < bet) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('You do not have enough money to place this bet.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        // Check that the user doesn't already have a game going
        if (getGame(userId)) {
            const errorEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.red)
                .setDescription('You already have a game in progress.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
        }

        // Create a new game and deduct the bet
        const game: BlackjackGame = startBlackjackGame(userId, bet);
        deduct(userId, bet);

        // Check for immediate blackjack
        const playerBlackjack: boolean = isBlackjack(game.playerHand);
        const dealerBlackjack: boolean = isBlackjack(game.dealerHand);

        if (playerBlackjack || dealerBlackjack) {
            game.gameOver = true;
            const outcome: { result: string, payout: number } = gameOutcome(game);

            award(userId, outcome.payout);
            deleteGame(userId);

            const resultEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(outcome.payout > bet ? colors.green : colors.red)
                .setTitle('Blackjack')
                .setDescription(`### Dealer: \n${formatHand(game.dealerHand, false)}\n\n### Player: \n${formatHand(game.playerHand, false)}\n\n**${outcome.result}**\n💰 Payout: ${outcome.payout}`);

            await interaction.reply({ embeds: [resultEmbed], ephemeral: false });
            return;
        }

        // Game continues - show buttons
        const startEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.green)
            .setTitle('Blackjack')
            .setDescription(`### Dealer: \n${formatHand(game.dealerHand, true)}\n\n### Player: \n${formatHand(game.playerHand, false)}`);

        const buttons: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({ embeds: [startEmbed], components: [buttons], ephemeral: true });
    },
} satisfies Command;
