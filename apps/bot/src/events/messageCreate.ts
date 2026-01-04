import { Events } from 'discord.js';
import { Event } from './index.js';
import { cacheMessage, manuallyCleanContent } from '../util.js';
import { db } from '@repo/backend/dist/src/index.js';
import { quotes } from '@repo/backend/dist/src/schema.js';
import { put } from '@vercel/blob';
export default {
	execute: async (message) => {
		if (message.author.bot) return;
		if (!message.reference) return;
		if (
			!message.content.includes(`<@!${message.client.user.id}>`) &&
			!message.content.includes(`<@${message.client.user.id}>`)
		)
			return;
		const refMessage = await message.fetchReference();
		const { author, content: originalContent, id: targetId } = refMessage;
		const content = manuallyCleanContent(originalContent, refMessage);
		console.log(`[DEBUG] Quote content: ${content}`);
		const quote = (await fetch('https://api.voids.top/quote', {
			method: 'POST',
			body: JSON.stringify({
				text: content,
				display_name: author.displayName,
				username: author.username + (author.discriminator ? '#' + author.discriminator : ''),
				avatar: author.avatarURL({ extension: 'png', size: 4096 })!,
				color: false,
			}),
		}).then((res) => res.json())) as { success: boolean; url: string };
		await message.reply({ files: [quote.url] });
		const image = await fetch(quote.url).then((res) => res.blob());
		const blobRes = await put('quote_' + targetId + '.png', image, { access: 'public', addRandomSuffix: true });
		await db.insert(quotes).values({
			quote: content,
			guildId: refMessage.guildId,
			channelId: refMessage.channelId,
			messageId: targetId,
			authorId: author.id,
			imageStorageUrl: blobRes.url,
			userId: message.author.id,
		});
		await cacheMessage(refMessage);
	},
	name: Events.MessageCreate,
} satisfies Event<Events.MessageCreate>;
