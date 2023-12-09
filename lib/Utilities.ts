import {
    Guild,
    Message,
    MessageReaction,
    User,
    TextChannel,
} from 'discord.js';

import { config } from './Config.js';

const SLUGS_GUILD = '891069801173237800';

const SlugRoles = {
    SLUG_HOLDER: "957503404404527144",
    SLUG_GANG: "961026739704844308",
    SLUG_BOSS: "891077439277645884",
}

/* If we're running in the slugs server, this user must be a burner or holder */
export function slugUserGate(message: Message): { canAccess: boolean, error?: string } {
    if (!message.guild) {
        return {
            canAccess: true,
            error: undefined,
        };
    }

    if (message.guild.id !== SLUGS_GUILD) {
        return {
            canAccess: true,
            error: undefined,
        };
    }

    if (!message.member) {
        return {
            canAccess: true,
            error: undefined,
        };
    }

    const specialUsers = [
        '523335703913037837',
    ];

    if (specialUsers.includes(message.author.id)) {
        return {
            canAccess: true,
            error: undefined,
        };
    }

    const canAccess = Object.values(SlugRoles).some((id) => message.member!.roles.cache.has(id));

    if (!canAccess) {
        return {
            canAccess: false,
            error: `Sorry, this command is usable for slug holders or burners only. [Buy Sol Slugs!](https://www.tensor.trade/trade/sol_slugs)`,
        };
    }

    return {
        canAccess: true,
        error: undefined,
    };
}

export function numberWithCommas(s: string) {
    return s.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

export function capitalize(str: string): string {
    return str && str[0].toUpperCase() + str.slice(1);
}

export function capitalizeAllWords(str: string): string {
    return str.split(' ').map(capitalize).join(' ');
}

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function haveRole(msg: Message, role: string): boolean {
    if (!msg.member) {
        return false;
    }

    return msg.member.roles.cache.some((r) => r.name === role);
}

export function pickRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function canAccessCommand(msg: Message, react: boolean): boolean {
    if (config.privilegedChannels.includes(msg.channel.id)) {
        return true;
    }

    if (msg.author.id === config.god) {
        return true;
    }

    if (react) {
        tryReactMessage(msg, '❌');
    }

    return false;
}

export async function getUsername(id: string, guild: Guild | null | undefined): Promise<string> {
    const ping = `<@${id}>`;
 
    if (!guild) {
        return ping;
    }

    try {
        const user = await guild.members.fetch(id);

        if (!user) {
            return ping;
        }

        return user.displayName;
    } catch (err) {
        return ping;
    }
}

export async function tryDeleteMessage(msg: Message) {
    try {
        await msg.delete();
    } catch (err) {
        console.log(`Failed to delete message ${msg.id}, ${(err as any).toString()}, ${(err as any).stack}`);
    }
}

export async function tryReactMessage(msg: Message, reaction: string) {
    try {
        await msg.react(reaction);
    } catch (err) {
        console.log(`Failed to react with ${reaction} to message ${msg.id}, ${(err as any).toString()}, ${(err as any).stack}`);
    }
}

export async function tryDeleteReaction(reaction: MessageReaction, id: string) {
    try {
        await reaction.users.remove(id);
    } catch (err) {
        console.log(`Failed to remove reaction ${reaction.emoji.name} for ${id}, ${(err as any).toString()}, ${(err as any).stack}`);
    }
}

export function isCapital(char: string) {
    const charCode = char.charCodeAt(0);
    return (charCode >= 65 && charCode <= 90);
}

export function truncateResponse(msg: string, limit: number = 1999): string {
    return msg.slice(0, limit);
}
