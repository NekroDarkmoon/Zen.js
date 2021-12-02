// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from './main/Zen.js';
import ZenDB from './main/utils/db/index.js';
import { readFile } from 'fs/promises';
import setupLogger from './main/utils/logger.js';
import migrate from './main/utils/migrations/v0300.js';

// ----------------------------------------------------------------
//                              Main
// ----------------------------------------------------------------
async function main() {
	// Setup Logger
	const logger = setupLogger('info');
	logger.info('Logger setup. Switching to logger.');

	// Fetch data from config file
	/** @type {import('./main/structures/typedefs.js').ZenConfig} */
	const config = JSON.parse(
		await readFile(new URL('./main/settings/config.json', import.meta.url))
	);

	// Setup DB
	const db = new ZenDB(config.postgresql, logger);
	await db.init();
	logger.info('DB initiated');

	// Check Migration and Migrate
	// const m = await migrate(2, db, logger);
	// console.log(m);

	// Set up bot instance
	const zen = new Zen(config, db, logger);
	logger.info('Bot Initiated');

	// Handle Exit and logging out
	[
		// 'exit',
		'SIGINT',
		// 'SIGQUIT',
		// 'SIGTERM',
		// 'uncaughtException',
		// 'unhandledRejection',
	].forEach(ec => process.on(ec, zen.onClose.bind(zen)));

	// Start Bot
	try {
		await zen.start();
	} catch (e) {
		logger.error(e);
	}
}

main();
