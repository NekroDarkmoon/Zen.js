// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import {
	Interaction,
	MessageActionRow,
	MessageButton,
	Permissions,
} from 'discord.js';
import ButtonUI from '../utils/ui/button.js';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class Kick {
	constructor() {
		this.name = 'kick';
		this.description = 'Kicks a user from the server.';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addUserOption(opt =>
				opt.setName('target').setDescription('Selected User').setRequired(true)
			)
			.addStringOption(opt =>
				opt.setName('reason').setDescription('Reason for kick.')
			);
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Validation - Permissions
		if (!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
			const msg = `Error: Permissions not met - \`Kick Members\``;
			await interaction.reply({ content: msg, ephemeral: true });
			return;
		}

		// Data builder
		const user = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') || '';
		const channel = interaction.channel;

		// Create UI
		const confirm = new ButtonUI({
			style: 3,
			label: '✔',
			customId: 'confirmKick',
		}).toComponent();

		const deny = new ButtonUI({
			style: 4,
			label: '✖',
			customId: 'denyKick',
		}).toComponent();

		// Inital reply
		interaction.reply({
			content: `\`Are you sure you wish to kick ${user.username}\``,
			// ephemeral: true,
			components: [
				new MessageActionRow().addComponents(confirm, deny),
				// 	new MessageButton()
				// 		.setCustomId('confirmKick')
				// 		.setLabel('✔')
				// 		.setStyle('SUCCESS')
				// )
				// .addComponents(
				// 	new MessageButton()
				// 		.setCustomId('denyKick')
				// 		.setLabel('✖')
				// 		.setStyle('DANGER')
				// ),
			],
		});

		// Filter
		const filter = btnInteraction => {
			return interaction.user.id === btnInteraction.user.id;
		};

		// Collectors
		const collector = channel.createMessageComponentCollector({
			filter,
			max: 1,
			time: 1000 * 15,
		});

		collector.on('collect', async btnInteraction => {
			if (btnInteraction.component.customId === 'confirmKick') {
				await interaction.guild.members.kick(user.id);
				const msg = `Kicked ${user.username} for the following reason:\n${reason}`;
				await btnInteraction.update({ content: msg, ephemeral: false });

				// TODO: Log it
			} else {
				await btnInteraction.update({ content: 'Action Cancelled.' });
			}
		});

		collector.on('end', async collection => {
			await interaction.editReply({
				components: [],
			});
		});
	};
}
