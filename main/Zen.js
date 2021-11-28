// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { Client, GuildMember, Intents, Message } from 'discord.js';

import ZenDB from './utils/db/index.js';
import CommandHandler from './structures/CommandHandler.js';
import EventHandler from './structures/EventHandler.js';
import { caches } from './utils/utils.js';
import winston from 'winston';

// ----------------------------------------------------------------
//                             Zen
// ----------------------------------------------------------------
/**
 * Main class for Zen
 * @class Zen
 */
export default class Zen extends Client {
	/**
	 * @param {ZenConfig} config
	 * @param {ZenDB} db
	 * @param {winston.Logger} logger
	 */
	constructor(config, db, logger) {
		// Init Client with intents and partials
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_BANS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			],
			partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
		});

		/** @type {ZenConfig} */
		this.config = config;

		/** @type {ZenDB} */
		this.db = db;

		/** @type {winston.Logger} */
		this.logger = logger;

		/** @type {CommandHandler} */
		this.CommandHandler = new CommandHandler(this);

		/** @type {EventHandler} */
		this.EventHandler = new EventHandler(this);

		// Miscellaneous
		this.caches = {
			loggingChns: {},
			features: {},
			playCats: {},
		};
		this._started = false;
		this._exited = false;
	}

	/**
	 * @returns {Promise<void>}
	 * @memberof Zen
	 */
	async start() {
		if (this._started) return;
		this._started = true;

		// Check Token
		if (!this.config.token) throw new Error('No discord token provided');

		// Setup event listeners
		await this.EventHandler.loadEvents(this);

		// Setup commands & interactions
		await this.CommandHandler.loadCommands();
		await this.CommandHandler.registerCommands();

		// TODO: Perform Permission Hnadling for slash commands

		// Set token
		this.login(this.config.token);
		this.setMaxListeners(20);

		// Cache Builder
		await this.buildCaches();
	}

	/**
	 *
	 * @param {object} data
	 * @returns {boolean}
	 * @memberof Zen
	 */
	async fetchPartial(data) {
		if (data.partial) {
			try {
				await data.fetch();
			} catch (err) {
				console.error(
					`Something went wrong when fetching partial ${data.id}: `,
					error
				);
				return false;
			}
		}
		return true;
	}

	async buildCaches() {
		this.caches.loggingChns = await caches.cacheLogChns(this);
		this.caches.playCats = await caches.cachePlayChns(this);
		this.caches.features = await caches.cacheEnabled(this);
	}

	/**
	 *
	 * @param {Number} userId
	 * @param {Number} guildId
	 * @returns {GuildMember}
	 */
	async _getOrFetchMembers(userId, guildId) {
		const guild = this.guilds.cache.get(guildId);
		const member = guild.members.cache.get(userId);
		if (member) return member;

		// Fetch
		try {
			const member = await guild.members.fetch(userId);
			return member;
		} catch (e) {
			this.logger.error(e);
			return null;
		}
	}

	onClose() {
		if (this._exited) return;
		this._exited = true;

		this.destroy();

		// Close db connection
		this.db.close();

		// Close logger
		this.logger.close();
	}
}
