import { Message } from 'discord.js';

import { config } from './Config.js';
import { truncateResponse } from './Utilities.js';

export async function replyWithMention(msg: Message, reply: string): Promise<void> {
    if (msg.mentions.users.size > 0)   {
        const usersMentioned = [...msg.mentions.users.keys()].map((id) => `<@${id}>`).join(' ');
        await msg.reply(`${usersMentioned} ${reply}`);
    } else {
        await msg.channel.send(reply);
    }
}

export async function handleGPT(msg: Message, args: string): Promise<void> {
    console.log(`Got request for ${args}`);

    const model = 'noromaid';

    try {
        const response = await fetch(`${config.ollamaURI}/api/generate`, {
            body: JSON.stringify({
                model,
                prompt: args,
                stream: false,
            }),
            method: 'POST',
        });

        const data = await response.json();

        if (!data.response) {
            if (data.error) {
                await msg.reply(`Failed to get response: ${data.error}`);
                return;
            }

            throw new Error('Unknown internal error');
        }

        const generation = data.response.replace(/^\s+|\s+$/g, '');

        await msg.reply(truncateResponse(generation));
    } catch (err) {
        await msg.reply(`Failed to get response: ${err}`);
    }
}
