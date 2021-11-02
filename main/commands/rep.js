// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from "../Zen.js";
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction } from "discord.js";


// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Rep {
  constructor () {
    this.name = 'rep';
    this.description = 'Commands Related to the reputation system';
    this.global = false;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand( subcommand => 
        subcommand
          .setName('get')
          .setDescription('Displays the Reputation of a user.')
          .addUserOption( option => option.setName('target').setDescription('Selected User'))
      )
      .addSubcommand( subcommand => 
        subcommand
          .setName('giverep')
          .setDescription('Give another user Reputation Points.')
          .addUserOption( option => 
            option
              .setName('target')
              .setDescription('Selected User')
              .setRequired(true)
          )
          .addIntegerOption( opt => opt.setName('amount').setDescription('Reputation amount given'))
      )
  }

  /**
   * @param {Interaction} interaction
   * @returns {Promise<void>}
   * */
  execute = async (interaction) => {
    // Get Bot & interface
    /** @type {Zen} */
    const bot = interaction.client;
    if (!this.bot) this.bot = bot;

    // Execute based on subcommand
    const sub = interaction.options.getSubcommand();
    if (sub === "get") await this.getRep(interaction);
    else if (sub === "giverep") await this.giveRep(interaction);
  }

  /**
   * Get the Reputation points of a giver username.
   * Returns the rep of the calling user if no args given.
   * @param {Interaction} interaction 
   */
  async getRep ( interaction ) {
    // Data builder
    let user = interaction.options.getUser('target'); 
    if ( !user ) user = interaction.user;
    
    // Get data from db
    try {
      const sql = "SELECT * FROM rep WHERE server_id=$1 AND user_id=$2;"
      const values = [interaction.guild.id, user.id];

      const result = await this.bot.db.fetchOne(sql, values);
      console.log(result);
      const rep = result ? result.rep : 0 ;

      const msg = `Member \`${user.username}\` has \`${rep}\` rep.`;
      await interaction.reply(msg);

    } catch ( err ) {
      this.bot.logger.error({message: err});
    }
  } 

  /**
   * Give another user reputation and create a cooldown for it as well.
   * @param {Interaction} interaction 
   */
  async giveRep ( interaction ) {
    // Data builder
    const user = interaction.options.getUser('target');
    let rep = interaction.options.getInteger('amount');
    rep = (!rep || rep === 0) ? 1 : rep;

    // Validation
     

    // Execute Db transaction
    try {
      const sql = `INSERT INTO rep (server_id, user_id, rep)
                   VALUES ($1, $2, $3)
                   ON CONFLICT ON CONSTRAINT server_user 
                   DO UPDATE SET rep = rep.rep + $3;`
      const values = [interaction.guild.id, user.id, rep];
      await this.bot.db.execute(sql, values);
    } catch (err) {
      this.bot.logger.error(err);
    }

    const msg = `Gave \`${user.username}\` \`${rep}\` rep`;
    await interaction.reply(msg);
  }

}