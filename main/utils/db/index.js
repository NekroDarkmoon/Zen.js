// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import pg from 'pg';
const { Pool } = pg;
import { readFile } from 'fs/promises';

// ----------------------------------------------------------------
//                            Main Class
// ----------------------------------------------------------------
export default class ZenDB {
	constructor(uri, logger) {
		// Setup Logger
		this.logger = logger;

		// Create new pool request to conenct to the db
		try {
			this.pool = new Pool({ connectionString: uri });
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 *
	 */
	async init() {
		// Fetch schemas and create them in the db.
		const tableSchema = JSON.parse(
			await readFile(new URL('./schema.json', import.meta.url))
		);

		// Create Tables for the schema if they don't exist
		const ct = 'CREATE TABLE IF NOT EXISTS';
		for (const [table, data] of Object.entries(tableSchema)) {
			let query = '';

			for (const [key, value] of Object.entries(data)) {
				query += `${key} ${value} \n`;
			}

			// Execute sql
			const sql = `${ct} ${table}(${query})`;
			await this.execute(sql);
		}

		this.logger.info('DB setup Complete');
	}

	/**
	 * @returns {Promise<void>}
	 */
	async close() {
		this.logger.info('Closing pool.');
		await this.pool.end();
	}

	async fetch(sql, values = []) {
		// Validation
		if (sql.indexOf('SELECT') === -1) throw 'Not a fetch query';

		const result = await this.pool.query(sql, values);
		if (result.rows.length === 0) return null;
		return result.rows;
	}

	/**
	 * @param {string} sql
	 * @param {array} values
	 *
	 * @returns {object | null} result
	 */
	async fetchOne(sql, values = []) {
		// Validation
		if (sql.indexOf('SELECT') === -1) throw 'Not a fetch query';

		// Pool query
		const result = await this.pool.query(sql, values);
		if (result.rows.length === 0) return null;
		return result.rows[0];
	}

	/**
	 *
	 * @param {string} sql
	 * @param {array} values
	 */
	async execute(sql, values = []) {
		// Validation
		// if (sql.indexOf("INSERT") === -1) throw "Not an execute query";

		// Create Connection
		const conn = await this.pool.connect();
		// TODO: Add ability to gain a result from the transaction

		// Start Transaction
		try {
			await conn.query(sql, values);
			// Commit transaction
			await conn.query('COMMIT');
		} catch (err) {
			// Rollback if an error occured
			await conn.query('ROLLBACK');
			console.error(err);
		} finally {
			conn.release();
		}
	}

	/**
	 *
	 * @param {Array<String>} sqlArray
	 * @param {Array<Array>} valArray
	 */
	async executeMany(sqlArray, valArray) {
		// Validation - Match Array Size

		const conn = await this.pool.connect();

		try {
			for (let pos = 0; pos < sqlArray.length; pos++) {
				const sql = sqlArray[pos];
				const values = valArray[pos] || [];
				await conn.query(sql, values);
			}

			await conn.query('COMMIT');
		} catch (err) {
			await conn.query('ROLLBACK');
			console.error(err);
		} finally {
			conn.release();
		}
	}
}
