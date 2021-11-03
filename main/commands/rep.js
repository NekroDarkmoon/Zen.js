// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from "../Zen.js";
import Paginator from "../structures/Paginator.js";
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction, MessageEmbed, Permissions } from "discord.js";

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
      .addSubcommand( subcommand =>
        subcommand
          .setName('repboard')
          .setDescription('Display the reputation board for the server.')
          .addIntegerOption( option => option.setName('page').setDescription('Selected page to view.'))
      )
  }

  /**
   * @param {Interaction} interaction
   * @returns {Promise<void>}
   * */
  execute = async (interaction, ...args) => {
    // Get Bot & interface
    /** @type {Zen} */
    const bot = interaction.client;
    if (!this.bot) this.bot = bot;

    // Execute based on subcommand
    const sub = interaction.options.getSubcommand();
    if (sub === "get") await this.getRep(interaction);
    else if (sub === "giverep") await this.giveRep(interaction);
    else if (sub === 'repboard') await this.repBoard(interaction, args);

    return;
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
    const member = interaction.member;
    const user = interaction.options.getUser('target');
    let rep = interaction.options.getInteger('amount');
    rep = (!rep || rep === 0) ? 1 : rep;

    // Validation - Bot check
    if (user.bot) { 
      const msg = `Error: Bot. \`Unable to give rep to a bot.\``;
      await interaction.reply({content: msg, ephemeral: true});
      return;
    }

    // Validation - Self check
    if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
        member.id === user.id) {
      const msg = `Error: Sabatoge. \`Unable to give rep to yourself.\``;
      await interaction.reply({content: msg, ephemeral: true});
      return;
    }

    // Validation - Amount check
    if ( !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && rep !== 1){
      const msg = `Error: Permissions not met. \`Unable to give more than 1 rep.\``;
      await interaction.reply({content: msg, ephemeral: true});
      return;
    }

    // TODO: Complete time validation query
    // Validation - Time check
    try {
      const sql = `SELECT * FROM logger WHERE server_id=$1 and user_id=$2`;
      const values = [interaction.guild.id, member.id];
      const res = await this.bot.db.fetchOne(sql, values);
      console.log(res);

    } catch ( err ) { this.bot.logger.error(err) }

    // Execute Db transaction
    try {
      const sql = `INSERT INTO rep (server_id, user_id, rep)
                   VALUES ($1, $2, $3)
                   ON CONFLICT ON CONSTRAINT server_user 
                   DO UPDATE SET rep = rep.rep + $3;`
      const values = [interaction.guild.id, user.id, rep];
      await this.bot.db.execute(sql, values);

    } catch (err) { this.bot.logger.error(err) }

    const msg = `Gave \`${user.username}\` \`${rep}\` rep`;
    await interaction.reply(msg);
  }

  /**
   * Displays the top members on the repBoard
   * @param {Interaction} interaction 
   */
  async repBoard (interaction) {
    // Data builder
    let page = interaction.options.getInteger('page');
    page = !page ? 1 : page;
    let data = null;

    // Fetch rep data
    try {
      const sql = `SELECT * FROM rep WHERE server_id=$1 ORDER BY rep DESC`;
      const values = [interaction.guild.id];

      let result = await this.bot.db.fetch(sql, values); 
      if ( !result ) { console.log("hel"); return;}

      // Modify results to needs
      let modifiedResult = []
      let count = 1;
      result.forEach( async (row) => { 
        const user = this.bot.users.cache.get(row.user_id);

        const temp = {};
        temp.rank = count;
        temp.user = ( user ) ? user.username : (await this.bot.users.fetch(row.user_id)).username;
        temp.rep = row.rep; 
        count += 1;

        modifiedResult.push(temp);
      });

      data = modifiedResult;
    } catch ( err ) {this.bot.logger.error(err); return}

    // Construct Paginator
    const paginator = new Paginator(data, 5);
    const components = paginator.getPaginationComponents( page );

    // Construct Embed
    const e = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Rep Board")
      .setDescription(paginator._prepareData(page));

    // Send reply 
    await interaction.reply({
      embeds: [e],
      components: [components]
    });

    // Create collector
    paginator.createCollector( interaction );

    // Start Collecting
    try {
      paginator.collect( interaction );
    } catch ( err ) { this.bot.logger.error(err) }
  }

}