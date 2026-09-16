import { Events, Message } from 'discord.js';
import { Event } from './index.js';
import { cacheMessage, manuallyCleanContent } from '../util.js';
import { db, eq } from '@repo/backend/dist/src/index.js';
import { quotes, userConfigs } from '@repo/backend/dist/src/schema.js';
import { put } from '@vercel/blob';

async function executeCommand(message: Message) {
	const command = message.content.split(' ')[0].slice(1);
	if (!command) return;
	switch (command) {
		case 'getquote':
			const quoteId = message.content.split(' ')[1];
			if (!quoteId) return;
			const [quote] = await db
				.select()
				.from(quotes)
				.where(eq(quotes.id, parseInt(quoteId)))
				.execute();
			if (!quote) return;
			const content = quote.isFake ? 'This is a fake quote.' : undefined;
			message.reply({ content, files: [quote.imageStorageUrl] });
			break;
	}
}

export default {
	execute: async (message) => {
		if (message.author.bot) return;
		if (message.content.startsWith('!')) return await executeCommand(message);
		if (
			!message.content.includes(`<@!${message.client.user.id}>`) &&
			!message.content.includes(`<@${message.client.user.id}>`)
		)
			return;
		if (!message.reference)
			return void (await message.reply('Please reply to a message to quote or use /help for more information.'));
		const refMessage = await message.fetchReference();
		const { author, content: originalContent, id: targetId } = refMessage;
		const content = manuallyCleanContent(originalContent, refMessage);
		console.log(`[DEBUG] Quote content: ${content}`);
		const quoteRes = await fetch('https://make-it-a-quote.starnumber12046.workers.dev/generate', {
			method: 'POST',
			body: JSON.stringify({
				text: content,
				displayName: author.displayName,
				username: author.username,
				avatarUrl: author.avatarURL({ extension: 'png', size: 4096 })! || 'https://cdn.discordapp.com/embed/avatars/0.png',
			}),
		});
		if (!quoteRes.ok) {
			console.error('[ERROR] Quote API returned an error:', quoteRes.status);
			await message.reply('Failed to generate quote image. The API returned an error.');
			return;
		}

		const image = Buffer.from(await quoteRes.arrayBuffer());
		await message.reply({ files: [image] });
		// Check if the quoted user allows their messages to be saved as quotes.
		// Missing config means uploads are not allowed (opt-in).
		const [uploadConfig] = await db.select().from(userConfigs).where(eq(userConfigs.userId, author.id));
		if (!uploadConfig?.quoteUploadAllowed) {
			return;
		}
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
