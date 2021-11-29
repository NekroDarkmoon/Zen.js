// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import discord from 'discord.js';
import { Collection } from '@discordjs/collection';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Zen from '../Zen.js';
import fs, { readFileSync } from 'fs';

// ----------------------------------------------------------------
//                          Command Handler
// ----------------------------------------------------------------
export default class CommandHandler {
	/**
	 * @param {Zen} bot
	 */
	constructor(bot) {
		this.bot = bot;
		this.commands = new Collection();
		this.globalComamnds = new Collection();
		this.guildCommands = new Collection();
		this.rest = new REST({ version: '9' }).setToken(this.bot.config.token);

		/** @type {import('./typedefs.js').ZenSlashPerms} */
		this._perms = JSON.parse(
			readFileSync(new URL('../settings/perms.json', import.meta.url))
		);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async deleteCommands() {
		try {
			await this.deleteGlobalCommands();
			await this.deleteGuildCommands();

			this.bot.logger.log('Successfully deleted all application (/) commands');
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async deleteGuildCommands() {
		const commands = await this.getGuildCommands();
		if (commands.length <= 0) return;

		// Get Guilds
		const guilds = this.bot.config.guilds;

		guilds.forEach(async guildId => {
			const promises = commands.map(async cmd => {
				this.rest.delete(
					Routes.applicationGuildCommand(
						this.bot.config.client_id,
						guildId,
						cmd.id
					)
				);
			});

			await Promise.all(promises);
		});
	}

	/**
	 * @returns {Promise<void>}
	 */
	async deleteGlobalCommands() {
		const commands = await this.getGlobalCommands();
		if (commands.length <= 0) return;

		const promises = commands.map(async cmd => {
			this.rest.delete(
				Routes.applicationCommand(this.bot.config.client_id, cmd.id)
			);
		});

		await Promise.all(promises);
	}

	/**
	 * @returns {Promise<{id:string}[]>}
	 */
	async getCommands() {
		try {
			return [
				...(await this.getGlobalCommands()),
				...(await this.getGuildCommands()),
			];
		} catch (err) {
			this.bot.logger.error(err);
			return [];
		}
	}

	/**
	 * @returns {Promise<{id:string}[]>}
	 */
	async getGuildCommands() {
		return this.rest.get(
			Routes.applicationGuildCommands(
				this.bot.config.client_id,
				this.bot.config.guilds[0]
			)
			// {body: this.guildCommands.mapValues( cmd => cmd.data.toJSON())}
		);
	}

	/**
	 * @returns {Promise<{id:string}[]>}
	 */
	async getGlobalCommands() {
		return this.rest.get(
			Routes.applicationCommands(this.bot.config.client_id)
			// {body: this.guildCommands.mapValues( cmd => cmd.data.toJSON())}
		);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async loadCommands() {
		/** @type {discord.Collection<string, Command>} */
		const commandFiles = fs
			.readdirSync(`./main/commands`)
			.filter(file => file.endsWith('.js'));

		const promises = commandFiles.map(async file => {
			const cmdClass = (await import(`../commands/${file}`)).default;
			const command = new cmdClass();
			this.commands.set(command.name, command);
		});

		await Promise.all(promises);

		// console.log(this.commands);
		this.globalCommands = this.commands.filter(cmd => cmd.global);
		this.guildCommands = this.commands.filter(cmd => !cmd.global);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async registerCommands() {
		try {
			await this.registerGlobalCommands();
			await this.registerGuildCommands();
		} catch (err) {
			this.bot.logger.error(err);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async registerGuildCommands() {
		const { size } = this.guildCommands;
		if (size <= 0) return;

		this.bot.logger.info(`Registering ${size} Guild commands.`);

		// Get main guilds
		const guilds = this.bot.config.guilds;

		guilds.forEach(async guildId => {
			await this.rest.put(
				Routes.applicationGuildCommands(this.bot.config.client_id, guildId),
				{ body: this.guildCommands.mapValues(cmd => cmd.data.toJSON()) }
			);
		});
	}

	/**
	 * @returns {Promise<void>}
	 */
	async registerGlobalCommands() {
		const { size } = this.globalCommands;
		if (size <= 0) return;

		console.info(`Registering ${size} Global commands.`);
		await this.rest.put(Routes.applicationCommands(this.bot.config.client_id), {
			body: this.globalComamnds.mapValues(cmd => cmd.data.toJSON()),
		});
	}

	async setSlashPerms() {
		const bot = this.bot;
		if (!bot.application?.owner) await bot.application.fetch();

		// Const get guild commands
		const guilds = bot.config.guilds.map(id => bot.guilds.cache.get(id));

		// Set Guild Perms
		guilds.forEach(async guild => {
			// Construct Ids
			const _commands = await guild.commands.fetch();
			// Construct perms
			const fullPermissions = this._permBuilder(_commands);

			await guild.commands.permissions.set({ fullPermissions });
			bot.logger.info(
				`Set perms for ${fullPermissions.length} commands in guild ${guild.id}`
			);
		});

		// Set Global Perms
		// const _commands = await bot.application.commands.fetch();
		// const fullPermissions = this._permBuilder(_commands);
		// await this.application.commands.permissions.set({
		// 	fullPermissions: fullPermissions,
		// });
	}

	/**
	 *
	 * @param {Collection<string, discord.ApplicationCommand<{}>>} _commands
	 * @returns {Array<import('discord.js').GuildApplicationCommandPermissionData>}
	 */
	_permBuilder(_commands) {
		const commands = _commands.filter(cmd =>
			this._perms.commandNames.includes(cmd.name)
		);

		const fullPermissions = [];

		for (const [cmdName, perms] of Object.entries(this._perms.commandPerms)) {
			const cmd = commands.find(cmd => cmd.name === cmdName);
			const type = perms.type;

			if (type === 'USER') {
				const perm = {
					id: `${cmd.id}`,
					permissions: [perms],
				};
				fullPermissions.push(perm);
			} else if (type === 'ROLE') {
			}
		}

		return fullPermissions;
	}
}
