export type Card = {
    value: number;
    display: string | undefined;
}

export interface BlackjackGame {
    userId: string;
    bet: number;
    playerHand: Card[];
    dealerHand: Card[];
    gameOver: boolean;
}

const activeGames: Map<string, BlackjackGame> = new Map<string, BlackjackGame>();
const dealerThreshold: number = 15;

export function drawCard(): Card {
    const rand: number = Math.floor(Math.random() * 13) + 1;

    if (rand === 1) {
        return { value: 11, display: 'A' };
    }
    else if (rand >= 11) {
        const faces: string[] = ['J', 'Q', 'K'];
        return { value: 10, display: faces[rand - 11] };
    }
    else {
        return { value: rand, display: rand.toString() };
    }
}

export function calculateHand(cards: Card[]): number {
    let total: number = cards.reduce((sum: number, card: Card) => sum + card.value, 0);
    let aces: number = cards.filter((card: Card) => card.display === 'A').length;

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

export function isBlackjack(cards: Card[]): boolean {
    return cards.length === 2 && calculateHand(cards) === 21;
}

export function startBlackjackGame(userId: string, bet: number): BlackjackGame {
    const game: BlackjackGame = {
        userId,
        bet,
        playerHand: [drawCard(), drawCard()],
        dealerHand: [drawCard(), drawCard()],
        gameOver: false,
    };

    activeGames.set(userId, game);
    return game;
}

// check if my user has an active game going
export function getGame(userId: string): BlackjackGame | undefined {
    return activeGames.get(userId);
}

export function clearActiveGames(): void {
    console.log('[Casino] Clearing active blackjack games');
    activeGames.clear();
}

export function deleteGame(userId: string): void {
    activeGames.delete(userId);
}

export function playerHit(game: BlackjackGame): void {
    game.playerHand.push(drawCard());
}

export function dealerHit(game: BlackjackGame): void {
    game.dealerHand.push(drawCard());
}

export function dealerPlay(game: BlackjackGame): void {
    while (calculateHand(game.dealerHand) < dealerThreshold) {
        dealerHit(game);
    }
}

export function gameOutcome(game: BlackjackGame): { result: string, payout: number } {
    const playerVal: number = calculateHand(game.playerHand);
    const dealerVal: number = calculateHand(game.dealerHand);
    const playerBlackjack: boolean = isBlackjack(game.playerHand);
    const dealerBlackjack: boolean = isBlackjack(game.dealerHand);

    if (playerVal > 21) {
        return { result: 'Player busted! Dealer wins.', payout: 0 };
    }
    if (dealerVal > 21) {
        return { result: 'Dealer busted! You win!', payout: game.bet * 2 };
    }

    if (playerBlackjack && dealerBlackjack) {
        return { result: 'Push!', payout: game.bet };
    }
    if (playerBlackjack) {
        return { result: 'Blackjack! You win!', payout: game.bet * 2.5 };
    }
    if (dealerBlackjack) {
        return { result: 'Dealer has blackjack! You lose.', payout: 0 };
    }

    if (playerVal > dealerVal) {
        return { result: 'You win!', payout: game.bet * 2 };
    }
    else if (playerVal < dealerVal) {
        return { result: 'Dealer wins!', payout: 0 };
    }
    else {
        return { result: 'Push!', payout: game.bet };
    }
}

export function formatHand(cards: Card[], hideFirst: boolean = false): string {
    if (hideFirst) {
        return `[??] [${cards.slice(1).map((c: Card) => c.display).join('] [')}]`;
    }
    return `[${cards.map((c: Card) => c.display).join('] [')}]`;
}
