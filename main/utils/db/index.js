// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import pg from "pg";
const { Pool } = pg;
import { readFile } from "fs/promises";

// ----------------------------------------------------------------
//                            Main Class
// ----------------------------------------------------------------
export default class ZenDB {
  constructor (uri) {
    // Create new pool request to conenct to the db
    try {this.pool = new Pool({ connectionString: uri })}
    catch (err) {console.error(err);}
  }


  /**
   * 
   */
  async init () {
    // Fetch schemas and create them in the db.
    const tableSchema = JSON.parse( await readFile(
        new URL("./schema.json", import.meta.url)
    ));

    // Create Tables for the schema if they don't exist
    const ct = "CREATE TABLE IF NOT EXISTS";
    for (const [table, data] of Object.entries(tableSchema)){
      let query = "";

      for (const [key, value] of Object.entries(data)) {
        query += `${key} ${value} \n`;
      }

      // Execute sql
      const sql = `${ct} ${table}(${query})`;
      await this.execute(sql);

    }
  }


  /**
   * @returns {Promise<void>}
   */
  async close () {
    // TODO: Add logger

    console.log("Closing connection to db pool");
    await this.pool.end()
  }


  /**
   * 
   */
  async fetch () {

  }


  /**
   * 
   */
  async execute (sql, ...args) {
    const conn = await this.pool.connect();
    
    try {
      const result = await conn.query(sql);
      await conn.query('COMMIT');
    } catch ( err ) {
      await conn.query('ROLLBACK');
      console.error(err);
    } finally {
      conn.release()
    }

  }

}
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------