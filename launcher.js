// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from "./main/Zen.js";
import ZenDB from "./main/utils/db/index.js";
import winston from "winston";
import { readFile } from 'fs/promises';


// ----------------------------------------------------------------
//                             Logger 
// ----------------------------------------------------------------
/**
 * @param {string} level
 * @returns {winston.Logger}
 */
function setupLogger (level) {
  const options = {
    level: level,
    transports: [
      new winston.transports.Console({
        level: level,
        colorize: true
      }),
      new winston.transports.File({
        filename: './.logs/error.log',
        level: level,
        colorize: true
      }),
    ]
  };

  return winston.createLogger(options);
}


// ----------------------------------------------------------------
//                              Main 
// ----------------------------------------------------------------
async function main () {

  // Setup Logger
  const logger = setupLogger('info');

  // Fetch data from config file
  const config = JSON.parse(
    await readFile(
      new URL("./main/settings/config.json", import.meta.url)
    )
  );

  // Setup DB
  const db = new ZenDB(config.postgresql, logger);
  await db.init();

  // Set up bot instance
  const zen = new Zen(config, db, logger);

  // ["exit", "SIGINT", "SIGQUIT", "SIGTERM", "uncaughtException", "unhandledRejection"]
	// 	.forEach(ec => process.on(ec, ZEN.handleExit.bind(ZEN)));
  
  await zen.start();
}


main()