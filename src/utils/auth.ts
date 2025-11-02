// only real auth util in the project used to tell slash commands if they're for colby or not
export function isIgnant(userId: string): boolean {
    return userId === process.env.IGNANT_ID;
}
