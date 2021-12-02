// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from '../Zen.js';
import { SlashCommandBuilder, time } from '@discordjs/builders';
import { Interaction, MessageEmbed, Permissions } from 'discord.js';
import { TabulatedPages } from '../utils/ui/Paginator.js';

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Rep {
	constructor() {
		this.name = 'rep';
		this.description = 'Commands Related to the reputation system';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(subcommand =>
				subcommand
					.setName('get')
					.setDescription('Displays the Reputation of a user.')
					.addUserOption(option =>
						option.setName('target').setDescription('Selected User')
					)
			)
			.addSubcommand(subcommand =>
				subcommand
					.setName('giverep')
					.setDescription('Give another user Reputation Points.')
					.addUserOption(option =>
						option
							.setName('target')
							.setDescription('Selected User')
							.setRequired(true)
					)
					.addIntegerOption(opt =>
						opt.setName('amount').setDescription('Reputation amount given')
					)
			)
			.addSubcommand(subcommand =>
				subcommand
					.setName('setrep')
					.setDescription('Set the reputation points of a user')
					.addUserOption(opt =>
						opt
							.setName('target')
							.setDescription('Selected User')
							.setRequired(true)
					)
					.addIntegerOption(opt =>
						opt.setName('amount').setDescription('New Amount').setRequired(true)
					)
			)
			.addSubcommand(subcommand =>
				subcommand
					.setName('repboard')
					.setDescription('Display the reputation board for the server.')
					.addIntegerOption(option =>
						option.setName('page').setDescription('Selected page to view.')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('rewards')
					.setDescription('Display Rewards Associated with XP.')
			);
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async (interaction, ...args) => {
		// Get Bot & interface
		/** @type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;

		// Defer Reply
		await interaction.deferReply();

		// Execute based on subcommand
		const sub = interaction.options.getSubcommand();
		if (sub === 'get') await this.getRep(interaction);
		else if (sub === 'giverep') await this.giveRep(interaction);
		else if (sub === 'repboard') await this.repBoard(interaction, args);
		else if (sub === 'setrep') await this.setRep(interaction);
		else if (sub === 'rewards') await this.rewards(interaction);

		return;
	};

	/**
	 * Get the Reputation points of a giver username.
	 * Returns the rep of the calling user if no args given.
	 * @param {Interaction} interaction
	 */
	async getRep(interaction) {
		// Data builder
		let user = interaction.options.getUser('target');
		if (!user) user = interaction.user;

		// Get data from db
		try {
			const sql = 'SELECT * FROM rep WHERE server_id=$1 AND user_id=$2;';
			const values = [interaction.guild.id, user.id];

			const result = await this.bot.db.fetchOne(sql, values);
			const rep = result ? result.rep : 0;

			const msg = `Member \`${user.username}\` has \`${rep}\` rep.`;
			await interaction.editReply(msg);
		} catch (err) {
			this.bot.logger.error({ message: err });
		}
	}

	/**
	 * Give another user reputation and create a cooldown for it as well.
	 * @param {Interaction} interaction
	 */
	async giveRep(interaction) {
		// Data builder
		const member = interaction.member;
		const user = interaction.options.getUser('target');
		let rep = interaction.options.getInteger('amount');
		rep = !rep || rep === 0 ? 1 : rep;

		// Validation - Bot check
		if (user.bot) {
			const msg = `Error: Bot. \`Unable to give rep to a bot.\``;
			await interaction.editReply({ content: msg, ephemeral: true });
			return;
		}

		// Validation - Self check
		if (
			!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
			member.id === user.id
		) {
			const msg = `Error: Sabotage. \`Unable to give rep to yourself.\``;
			await interaction.editReply({ content: msg, ephemeral: true });
			return;
		}

		// Validation - Amount check
		if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && rep !== 1) {
			const msg = `Error: Permissions not met. \`Amount cannot be anything other than 1.\``;
			await interaction.editReply({ content: msg, ephemeral: true });
			return;
		}

		// Execute Db transaction
		// TODO: Convert to executeMany
		try {
			const sql = `INSERT INTO rep (server_id, user_id, rep, last_given)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (server_id, user_id) 
                     DO UPDATE SET rep = rep.rep + $3,
										 							 last_given=$4;`;
			const values = [interaction.guild.id, user.id, rep, new Date()];
			await this.bot.db.execute(sql, values);
		} catch (err) {
			this.bot.logger.error(err);
		}

		const msg = `Gave \`${user.username}\` \`${rep}\` rep`;
		await interaction.editReply(msg);

		const rEvent = {
			init: interaction,
			userId: user.id,
			guild: interaction.guild,
		};
		this.bot.emit('repGiven', rEvent);
	}

	/**
	 * Sets a users rep to an amount
	 * @param {Interaction} interaction
	 */
	async setRep(interaction) {
		// Data Builder
		const member = interaction.member;
		const user = interaction.options.getUser('target');
		const rep = interaction.options.getInteger('amount');

		// Validation - Admin
		if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			const msg = `Error: Permissions not met. \`Unable to use command.\``;
			await interaction.editReply({ content: msg, ephemeral: true });
			return;
		}

		// Set new rep
		try {
			const sql = `INSERT INTO rep (server_id, user_id, rep, last_given)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (server_id, user_id) 
                     DO UPDATE SET rep=$3,
										 							 last_given=$4;`;
			const values = [interaction.guild.id, user.id, rep, new Date()];
			await this.bot.db.execute(sql, values);
		} catch (err) {
			this.bot.logger.error(err);
		}

		const msg = `\`${user.username}\` now has \`${rep}\` rep`;
		await interaction.editReply(msg);

		const rEvent = {
			init: interaction,
			userId: user.id,
			guild: interaction.guild,
		};
		this.bot.emit('repGiven', rEvent);
	}

	/**
	 * Displays the top members on the repBoard
	 * @param {Interaction} interaction
	 */
	async repBoard(interaction) {
		// Data builder
		let page = interaction.options.getInteger('page');
		page = !page ? 1 : page;
		let data = null;

		// Fetch rep data
		try {
			const sql = `SELECT * FROM rep WHERE server_id=$1 ORDER BY rep DESC`;
			const values = [interaction.guild.id];

			let result = await this.bot.db.fetch(sql, values);
			if (!result) {
				const msg = `This server has no one with reputation points.`;
				await interaction.editReply(msg);
				return;
			}

			// Modify results to needs
			let modifiedResult = [];
			let count = 1;
			result.forEach(async row => {
				const user = this.bot.users.cache.get(row.user_id);

				const temp = {};
				temp.rank = count;
				temp.user = user
					? user.username
					: (await this.bot.users.fetch(row.user_id)).username;
				temp.rep = row.rep;
				count += 1;

				modifiedResult.push(temp);
			});

			data = modifiedResult;
		} catch (err) {
			this.bot.logger.error(err);
			return;
		}

		// Setup Formatter
		const pageConf = {
			rank: { align: 'center' },
			user: { align: 'left' },
			rep: { align: 'center', minWidth: 4 },
		};

		// Construct Paginator
		const paginator = new TabulatedPages('Rep Board', data, pageConf);

		// Construct Embed
		const e = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Rep Board')
			.setDescription(paginator._prepareData(page));

		// Send reply
		await interaction.editReply({
			embeds: [e],
			components: paginator.components,
		});

		// Start Collecting
		try {
			await paginator.onInteraction(interaction);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async rewards(interaction) {
		// Data Builder
		const page = 1;
		let data = null;

		// Fetch Rewards Data
		try {
			const sql = `SELECT * FROM rewards WHERE server_id=$1 AND type=$2
                   ORDER BY val ASC;`;
			const vals = [interaction.guild.id, this.name];
			const res = await this.bot.db.fetch(sql, vals);
			if (!res) {
				const msg = `This server has no rewards set up for ${this.name}`;
				await interaction.editReply(msg);
				return;
			}

			// Modify resuts to datafy
			data = [];
			let count = 1;
			res.forEach(async row => {
				const role = interaction.guild.roles.cache.get(row.role_id);
				const temp = {
					role: role
						? role.name
						: await interaction.guild.roles.fetch(row.role_id),
					level: row.val,
				};

				count += 1;
				data.push(temp);
			});
		} catch (e) {
			console.error(e);
			return;
		}

		// Setup Formatter
		const pageConf = {
			role: { align: 'left', minWidth: 10 },
			rep: { align: 'center', minWidth: 4 },
		};

		// Construct Paginator
		const paginator = new TabulatedPages('Rewards - Rep', data, pageConf);

		// Construct Embed
		const e = new MessageEmbed()
			.setColor(interaction.member.user.hexAccentColor)
			.setTitle('Rewards - Rep')
			.setDescription(paginator._prepareData(page));

		await interaction.editReply({
			embeds: [e],
			components: paginator.components,
		});

		// Start Collecting
		try {
			await paginator.onInteraction(interaction);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}
}
