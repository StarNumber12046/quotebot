import { db } from '@repo/backend/dist/src/index.js';
import { quotes, userConfigs } from '@repo/backend/dist/src/schema.js';
import { eq } from '@repo/backend/dist/src/index.js';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../index.js';
import { put } from '@vercel/blob';

export default {
	data: {
		name: 'fakequote',
		description: 'Create a fake quote for a user',
		options: [
			{
				name: 'user',
				description: 'The user to quote',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
			{
				name: 'text',
				description: 'The text to quote',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const user = interaction.options.getUser('user', true);
		const text = interaction.options.getString('text', true);

		// Check if user allows fake quotes
		const [config] = await db.select().from(userConfigs).where(eq(userConfigs.userId, user.id));

		if (config && !config.fakeQuoteAllowed) {
			await interaction.followUp({
				content: `<@${user.id}> has not allowed fake quotes.`,
				ephemeral: true,
			});
			return;
		}

		// Generate Quote
		let quote: { success: boolean; url: string };
		try {
			const res = await fetch('https://api.voids.top/quote', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					text: text,
					display_name: user.displayName,
					username: user.username + (user.discriminator && user.discriminator !== '0' ? '#' + user.discriminator : ''),
					avatar: user.avatarURL({ extension: 'png', size: 4096 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
					color: false,
				}),
			});
			if (!res.ok) throw new Error(`Quote API ${res.status}`);
			quote = (await res.json()) as { success: boolean; url: string };
		} catch {
			await interaction.followUp({ content: 'Failed to generate quote.', ephemeral: true });
			return;
		}

		if (!quote.success) {
			await interaction.followUp({
				content: `Failed to generate quote.`,
				ephemeral: true,
			});
			return;
		}

		let blobRes;
		try {
			const imageRes = await fetch(quote.url);
			if (!imageRes.ok) throw new Error(`Image fetch ${imageRes.status}`);
			const image = await imageRes.blob();
			blobRes = await put('fakequote_' + user.id + '_' + Date.now() + '.png', image, {
				access: 'public',
				addRandomSuffix: true,
			});
		} catch {
			await interaction.followUp({ content: 'Failed to generate quote image.', ephemeral: true });
			return;
		}

		await db.insert(quotes).values({
			quote: text,
			guildId: interaction.guildId,
			channelId: interaction.channelId || '0',
			messageId: interaction.id,
			authorId: user.id, // The person BEING quoted
			imageStorageUrl: blobRes.url,
			userId: interaction.user.id, // The person CREATING the quote
			isFake: true,
			visibility: 'PUBLIC',
		});

		await interaction.followUp({ files: [blobRes.url] });
	},
} satisfies Command;
