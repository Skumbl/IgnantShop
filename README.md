# IgnantShop Discord Bot

A Discord bot for managing a virtual economy with wallets, shop items, inventory, and gambling features.

## Tech Stack

- **TypeScript** - Type-safe development
- **Discord.js** - Discord API wrapper
- **better-sqlite3** - Fast, synchronous SQLite database
- **Node.js** - Runtime environment

## Features

- Virtual economy with persistent user wallets
- Shop system with purchasable items and inventory management
- Gambling games (slots and blackjack)
- Leaderboards and user statistics
- Admin tools for economy management

## Commands

### Economy Commands
- `/balance [@user]` - Check your coin balance (or another user's)
- `/leaderboard` - View top users by total worth (balance + inventory value)
- `/inventory [@user]` - View your inventory (or another user's)
- `/transfer-points <@user> <amount>` - Send coins to another user
- `/transfer-coins <@user> <amount>` - Send coins to another user

### Shop Commands
- `/shop` - View all available items for purchase
- `/buy <item> <quantity>` - Purchase items from the shop
- `/return <item> <quantity>` - Return items for 70% of their purchase value
- `/create-listing <name> <price> <description>` - Create a new shop item (Ignant only)
- `/destroy-listing <item_id>` - Remove a shop item (Ignant only)

### Gambling Commands
- `/gamba <bet>` - Play the slot machine with configurable bet
- `/blackjack <bet>` - Play blackjack against the dealer
  - Interactive gameplay with Hit/Stand buttons
  - Natural blackjack pays 2.5x
  - Private gameplay with public results

### Admin Commands
- `/create-account <@user>` - Create a new user account (Ignant only)
- `/award <@user> <amount>` - Give coins to a user (Ignant only)
- `/award-all <amount>` - Give coins to all users (Ignant only)
- `/deduct <@user> <amount>` - Remove coins from a user (Ignant only)

## Database Schema

Uses SQLite with three main tables:

### `wallet`
Stores user account balances
- `user_id` (TEXT, PRIMARY KEY) - Discord user ID
- `balance` (INTEGER) - Current coin balance
- `created_at` (TEXT) - Account creation timestamp
- `updated_at` (TEXT) - Last balance update

### `shop`
Available items for purchase
- `item_id` (INTEGER, PRIMARY KEY) - Unique item identifier
- `item_name` (TEXT) - Display name
- `price` (INTEGER) - Purchase price
- `description` (TEXT) - Item description
- `created_at` (TEXT) - Listing creation timestamp
- `updated_at` (TEXT) - Last update timestamp

### `inventory`
User-owned items
- `inventory_id` (INTEGER, PRIMARY KEY) - Unique inventory entry
- `user_id` (TEXT) - Discord user ID (foreign key)
- `item_id` (INTEGER) - Item reference (foreign key)
- `created_at` (TEXT) - Purchase timestamp
- `updated_at` (TEXT) - Last update timestamp

## Setup

1. Clone the repository
2. Install dependencies:
```bash
   npm install
```
3. Create a `.env` file with your Discord bot token:
```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
```
4. Build the project:
```bash
   npm run build
```
5. Deploy commands:
```bash
   npm run deploy
```
6. Start the bot:
```bash
   npm start
```

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

## Project Structure
```
src/
├── commands/          # Slash command implementations
├── events/            # Discord event handlers
├── database/          # Database operations and schemas
├── utils/             # Utility functions (blackjack logic, etc.)
├── config/            # Configuration files
└── types/             # TypeScript type definitions
```

## License

MIT
