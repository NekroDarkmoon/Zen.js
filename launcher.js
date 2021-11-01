// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from "./main/Zen.js";
import ZenDB from "./main/utils/db/index.js";
import { readFile } from 'fs/promises';

// ----------------------------------------------------------------
//                              Main 
// ----------------------------------------------------------------
async function main () {
  // TODO: Set up postgres database
  const db = new ZenDB();
  await db.init();

  // Fetch data from config file
  const config = JSON.parse(
    await readFile(
      new URL("./main/settings/config.json", import.meta.url)
    )
  );

  // Set up bot instance
  const zen = new Zen(config, db);

  // ["exit", "SIGINT", "SIGQUIT", "SIGTERM", "uncaughtException", "unhandledRejection"]
	// 	.forEach(ec => process.on(ec, ZEN.handleExit.bind(ZEN)));
  

  await zen.start();
}


main()