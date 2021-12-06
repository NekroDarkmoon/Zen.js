import ZenDB from './main/utils/db/index.js';
import setupLogger from './main/utils/logger.js';
import fs from 'fs';
import { readFile } from 'fs/promises';
import winston from 'winston';

// ----------------------------------------------------------------
//                               Main
// ----------------------------------------------------------------
async function main() {
	// Setup Logger
	const logger = setupLogger('info');
	logger.info('Logger setup. Switching to logger.');

	// Get config
	/** @type {import('./main/structures/typedefs.js').ZenConfig} */
	const config = JSON.parse(
		await readFile(new URL('./main/settings/config.json', import.meta.url))
	);

	// Connect to new DB
	const newDB = new ZenDB(config.uri, logger);
	await newDB.init(true);
	logger.info('New DB initiated');

	// Connect to old DB
	const pathDB = `${config.uri}Old`;
	const oldDB = new ZenDB(pathDB, logger);
	await oldDB.init(true);
	logger.info('Old DB Initiated.');

	// Get migrations folder
	const migrationFiles = fs
		.readdirSync(`./main/utils/migrations`)
		.filter(file => file.endsWith('.js'));

	logger.info(`Migrations found  - \n ${migrationFiles}`);

	// Check if migration file for a new version exists
	if (!migrationFiles.includes(`v${config.version}.js`)) {
		logger.info('No Migrations found.');
		logger.info('Exititng.');
		await _exit(logger, oldDB, newDB);
		return;
	}

	// Importing migration file
	const script = (await import(`./main/utils/migrations/v${config.version}.js`))
		.default;

	// Perform migration
	logger.info(`Running migration script v${config.version}`);
	try {
		const success = await script(config.version, [oldDB, newDB], logger);
		if (!success) throw `An error occured.`;
		await _exit(logger, oldDB, newDB);
	} catch (e) {
		logger.error(e);
		await _exit(logger, oldDB, newDB);
	}
}
// ----------------------------------------------------------------
//
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                               Main
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Clean Exit
// ----------------------------------------------------------------
/**
 *
 * @param {winston.Logger} logger
 * @param {ZenDB oldDB
 * @param {ZenDB} newDB
 */
async function _exit(logger, oldDB, newDB) {
	logger.warn('Closing db connection - old');
	oldDB.close();
	logger.warn('Closing db connection - new');
	newDB.close();
	logger.warn('Closing logger stream');
	logger.close();
	return;
}
// ----------------------------------------------------------------
//                               Init
// ----------------------------------------------------------------
main();
