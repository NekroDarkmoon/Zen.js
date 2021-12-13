// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { msgSanitize } from '../utils/utils.js';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Tags {
	constructor() {
		this.name = 'tag';
		this.description = 'Commands Related to the Tag system';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(sub =>
				sub
					.setName('get')
					.setDescription('Get a tag')
					.addStringOption(opt =>
						opt
							.setName('name')
							.setDescription('Name of the tag.')
							.setRequired(true)
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('add')
					.setDescription('Creates a new tag.')
					.addStringOption(opt =>
						opt
							.setName('name')
							.setDescription('Name of the tag.')
							.setRequired(true)
					)
					.addStringOption(opt =>
						opt
							.setName('content')
							.setDescription('Content of the tag.')
							.setRequired(true)
					)
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('remove')
					.setDescription('Remove a tag.')
					.addStringOption(opt =>
						opt
							.setName('name')
							.setDescription('Name of the tag.')
							.setRequired(true)
					)
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('list')
					.setDescription('Lists your tags.')
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('info')
					.setDescription('Information about a tag.')
					.addStringOption(opt =>
						opt
							.setName('name')
							.setDescription('Name of the tag.')
							.setRequired(true)
					)
			);
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Get Bot & interface
		/** @type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;

		// Defer Reply
		await interaction.deferReply();
		// Execute based on subcommand
		const sub = interaction.options.getSubcommand();

		// Handler
		switch (sub) {
			case 'get':
				await this.get(interaction);
				return;
			case 'add':
				await this.add(interaction);
				return;
			case 'remove':
				await this.remove(interaction);
				return;
			case 'list':
				await this.list(interaction);
				return;
			case 'info':
				await this.info(interaction);
				return;
		}
		return;
	};

	/**
	 * Create a new tag.
	 * @param {CommandInteraction} interaction
	 */
	async add(interaction) {
		// Data builder
		const name = interaction.options.getString('name');
		const content = msgSanitize(interaction.options.getString('content'));
		const hidden = interaction.options.getBoolean('hidden');
		const user = interaction.user;

		try {
			const sql =
				'SELECT * FROM tags WHERE server_id=$1 AND user_id=$2 AND name=$3;';
			const values = [interaction.guild.id, user.id, name];

			const result = await this.bot.db.fetchOne(sql, values);
			if (result) {
				await interaction.editReply({
					content: `You already have a tag named ${name}. Delete it first!`,
					ephemeral: hidden,
				});
				return;
			}
		} catch (err) {
			this.bot.logger.error(err);
		}

		try {
			const sql = `INSERT INTO tags (server_id, user_id, name, description)
                     VALUES ($1, $2, $3, $4)`;
			const values = [interaction.guild.id, user.id, name, content];
			await this.bot.db.execute(sql, values);
		} catch (err) {
			this.bot.logger.error(err);
			await interaction.editReply({
				content: `Something went wrong...`,
				ephemeral: hidden,
			});
			return;
		}

		await interaction.editReply({
			content: `Tag "${name}" added!`,
			ephemeral: hidden,
		});
	}

	/**
	 * Remove a tag.
	 * @param {CommandInteraction} interaction
	 */
	async remove(interaction) {
		// Data builder
		const name = interaction.options.getString('name');
		const hidden = interaction.options.getBoolean('hidden');
		const user = interaction.user;

		try {
			const sql =
				'SELECT * FROM tags WHERE server_id=$1 AND user_id=$2 AND name=$3;';
			const values = [interaction.guild.id, user.id, name];

			const result = await this.bot.db.fetchOne(sql, values);
			if (!result) {
				await interaction.editReply({
					content: `You have no tag named ${name}.`,
					ephemeral: hidden,
				});
				return;
			}
		} catch (err) {
			this.bot.logger.error(err);
		}

		try {
			var sql =
				'DELETE FROM tags WHERE server_id=$1 AND user_id=$2 AND name=$3;';
			var values = [interaction.guild.id, user.id, name];

			await this.bot.db.execute(sql, values);

			await interaction.editReply({
				content: `The tag "${name}" has been deleted!`,
				ephemeral: hidden,
			});
			return;
		} catch (err) {
			this.bot.logger.error({ message: err });
		}

		await interaction.editReply({
			content: `Tag ${name} added!`,
			ephemeral: hidden,
		});
	}

	/**
	 * Display the content of a tag.
	 * @param {CommandInteraction} interaction
	 */
	async get(interaction) {
		const hidden = interaction.options.getBoolean('hidden');

		// Data builder
		const name = interaction.options.getString('name');
		const user = interaction.user;

		// Get data from db
		try {
			const sql =
				'SELECT * FROM tags WHERE server_id=$1 AND user_id=$2 AND name=$3;';
			const values = [interaction.guild.id, user.id, name];

			const result = await this.bot.db.fetchOne(sql, values);
			if (!result) {
				await interaction.editReply({
					content: `You have no tag named ${name}.`,
					ephemeral: true,
				});
				return;
			}

			const e = new MessageEmbed();
			e.addField(result.name, result.description, false);
			await interaction.editReply({ embeds: [e], ephemeral: hidden });
		} catch (err) {
			this.bot.logger.error({ message: err });
		}
	}

	/**
	 * Info about the chosen tag.
	 * @param {CommandInteraction} interaction
	 */
	async info(interaction) {
		const hidden = interaction.options.getBoolean('hidden');

		// Data builder
		const name = interaction.options.getString('name');
		const user = interaction.user;

		// Get data from db
		try {
			const sql =
				'SELECT * FROM tags WHERE server_id=$1 AND user_id=$2 AND name=$3;';
			const values = [interaction.guild.id, user.id, name];

			const result = await this.bot.db.fetchOne(sql, values);
			if (!result) {
				await interaction.editReply({
					content: `You have no tag named ${name}.`,
					ephemeral: true,
				});
				return;
			}

			const e = new MessageEmbed();
			e.setTitle(result.name);
			e.addField(
				'Owner:',
				this.bot.users.cache.get(result.user_id).username,
				false
			);
			await interaction.editReply({ embeds: [e], ephemeral: hidden });
		} catch (err) {
			this.bot.logger.error({ message: err });
		}
	}

	/**
	 * Lists your tags.
	 * @param {CommandInteraction} interaction
	 */
	async list(interaction) {
		const hidden = interaction.options.getBoolean('hidden');

		// Data builder
		const user = interaction.user;

		// Get data from db
		try {
			const sql = 'SELECT * FROM tags WHERE server_id=$1 AND user_id=$2;';
			const values = [interaction.guild.id, user.id];

			const results = await this.bot.db.fetch(sql, values);
			if (!results) {
				await interaction.editReply({
					content: `You currently have no tags.`,
					ephemeral: true,
				});
				return;
			}

			var msg = results[0].name;
			for (let i = 1; i < results.length; i++) {
				msg = msg.concat(`, ${results[i].name}`);
			}

			const e = new MessageEmbed();
			e.addField(`Tags owned by ${user.username}:`, msg, false);

			await interaction.editReply({ embeds: [e], ephemeral: hidden });
		} catch (err) {
			this.bot.logger.error({ message: err });
		}
	}
}
