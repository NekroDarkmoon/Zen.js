// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import discord from 'discord.js';
import { Collection } from '@discordjs/collection';
import Zen from '../Zen.js';
import path from 'path';
import fs from 'fs';

// ----------------------------------------------------------------
//                          Command Handler
// ----------------------------------------------------------------
export default class EventHandler {
	/**
	 * @param {Zen} bot
	 */
	constructor(bot) {
		this.bot = bot;
		this.events = new Collection();
	}

	async loadEvents(bot) {
		// Update bot
		this.bot = bot;

		const eventFiles = this.getFiles('./main/events').filter(file =>
			file.endsWith('.js')
		);

		console.info(`Registering ${eventFiles.length} Events.`);
		eventFiles.forEach(async file => {
			const eventClass = (await import(`../events/${file}`)).default;
			const event = new eventClass(this.bot);
			if (!event.name) {
			}

			if (event.once)
				this.bot.once(event.name, (...args) => event.execute(...args));
			else this.bot.on(event.name, (...args) => event.execute(...args));
		});
	}

	getFiles(dirPath, arrayOfFiles) {
		const files = fs.readdirSync(dirPath);
		const base = './main/events';

		arrayOfFiles = arrayOfFiles || [];

		files.forEach(file => {
			if (fs.statSync(base + '/' + file).isDirectory())
				arrayOfFiles = this.getFiles(base + '/' + file, arrayOfFiles);
			else arrayOfFiles.push(path.join('/', file));
		});

		return arrayOfFiles;
	}
}
