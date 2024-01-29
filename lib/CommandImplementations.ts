import { Message } from 'discord.js';

import { config } from './Config.js';
import { truncateResponse } from './Utilities.js';
import { FuncQueue } from './FuncQueue.js';

const llmQueue = new FuncQueue();
llmQueue.init();

export async function replyWithMention(msg: Message, reply: string): Promise<void> {
    if (msg.mentions.users.size > 0)   {
        const usersMentioned = [...msg.mentions.users.keys()].map((id) => `<@${id}>`).join(' ');
        await msg.reply(`${usersMentioned} ${reply}`);
    } else {
        await msg.channel.send(reply);
    }
}

export async function handleNoromaid(msg: Message, args: string): Promise<void> {
    console.log(`Got request for ${args}`);

    try {
        const generation = await llmQueue.runOnceQueueEmpty(handleOllama, {
            model: 'noromaid',
            prompt: args,
        });

        await msg.reply(truncateResponse(generation));
    } catch (err) {
        await msg.reply(`Failed to get response: ${err}`);
    }
}

export async function handleMixtral(msg: Message, args: string): Promise<void> {
    console.log(`Got request for ${args}`);

    try {
        const generation = await llmQueue.runOnceQueueEmpty(handleOllama, {
            model: 'dolphin-mixtral-v2.5',
            prompt: args,
        });

        await msg.reply(truncateResponse(generation));
    } catch (err) {
        await msg.reply(`Failed to get response: ${err}`);
    }
}

export async function handleOllama(body: any): Promise<string> {
    const response = await fetch(`${config.ollamaURI}/api/generate`, {
        body: JSON.stringify({
            stream: false,
            ...body,
        }),
        method: 'POST',
    });

    const data = await response.json();

    if (!data.response) {
        console.log(data);
        console.log(data.statusCode);

        if (data.error) {
            throw new Error(`Failed to get response: ${data.error}`);
        }

        throw new Error('Unknown internal error');
    }

    const generation = data.response.replace(/^\s+|\s+$/g, '');

    return generation;
}
