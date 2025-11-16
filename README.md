# IgnantShop Discord Bot

A Discord bot for managing a virtual economy with wallets, shop items, inventory, and gambling features.

## Tech Stack

- TypeScript
- Discord.js
- better-sqlite3
- Node.js

## Commands

### Economy
- `/balance` - Check your coin balance
- `/leaderboard` - View top users by total worth

### Shop
- `/shop` - View all available items
- `/buy` - Purchase an item from the shop
- `/create-listing` - Create a new shop item (admin only)
- `/destroy-listing` - Remove a shop item (admin only)

### Gambling
- `/gamba` - Play the slot machine
- `/blackjack` - Play blackjack

### Admin
- `/create-account` - Create a new user account
- `/award` - Give coins to a user
- `/deduct` - Remove coins from a user

## Database

Uses SQLite with three main tables:
- `wallet` - User balances and accounts
- `shop` - Available items for purchase
- `inventory` - User-owned items
