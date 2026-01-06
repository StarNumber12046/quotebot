import { ButtonBuilder, ButtonStyle, ComponentBuilder, SectionBuilder } from 'discord.js';
import type { Command } from './index.js';

export default {
	data: {
		name: 'help',
		description: 'Get information about the bot.',
	},
	async execute(interaction) {
		const button = new ButtonBuilder()
			.setLabel('Visit Website')
			.setURL('https://quotebot-web.vercel.app')
			.setStyle(ButtonStyle.Link);
		const section = new SectionBuilder().setButtonAccessory(button);
		await interaction.reply({
			components: [section],
			content:
				'Hey, I\'m a quotes bot. You can @mention me to quote a message or right click on one and use the "Quote Message" command.\nYou can also go to my website to see your quotes, quotes about you and more!',
		});
	},
} satisfies Command;
