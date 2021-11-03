// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { 
  Interaction,
  MessageActionRow,
  MessageButton, 
  MessageEmbed } from "discord.js";

import columnify from "columnify";


// ----------------------------------------------------------------
//                             Paginator
// ----------------------------------------------------------------
export default class Paginator {
  /**
   * @param {Array} data
   * @param {Number} max_pages 
   */
  constructor ( data, max_pages=null ) {
    this.collector = null;
    this.data = data;
    this.max_pages = max_pages ? max_pages : Math.ceil( data / 15 );
  }

  /**
   * 
   * @param {*} page 
   * @returns {MessageActionRow} actionRow
   */
  getPaginationComponents ( page ) {
    // TODO: Add << >> and select menu
    return new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId(JSON.stringify({ name: "page", page: page - 1 }))
          .setLabel("◀")
          .setStyle('PRIMARY')
          .setDisabled( page < 2)
      )
      .addComponents(
        new MessageButton()
          .setCustomId(JSON.stringify({ name: "page", page: page }))
          .setLabel("⟳")
          .setStyle('SECONDARY')
      )
      .addComponents(
        new MessageButton()
          .setCustomId(JSON.stringify({ name: "page", page: page + 1 }))
          .setLabel("▶")
          .setStyle('PRIMARY')
          .setDisabled( page >= this.max_pages)
      ) 
  }


  /**
   * 
   * @param {Interaction} msgInteraction
   * @param {number} time
   */
  createCollector (msgInteraction, time=1000*15) {
    // Data builder
    /** @type {Interaction.channel} */
    const channel = msgInteraction.channel;
    const filter = (btnInteraction) => {
      return msgInteraction.user.id === btnInteraction.user.id;
    }

    // Create collector
    this.collector = channel.createMessageComponentCollector({
      filter,
      time: time
    });
  }

  /**
   * 
   * @param {*} msgInteraction 
   */
  collect ( msgInteraction ) {
    if (!this.collector) throw "No collector found";

    this.collector.on('collect', async btnInteraction => {
      
      // Get page number
      const pageNum = JSON.parse(btnInteraction.component.customId).page;
      console.log(pageNum)

      // Prepate data for pageNumber
      const data = `Data ${pageNum}`;

      // Create embed
      const e = new MessageEmbed()
        .setTitle('RepBoard')
        .setDescription(data)
        .setColor('#0099ff')

      // Update components
      const components = this.getPaginationComponents(pageNum);
      
      await btnInteraction.update({
        components: [components],
        embeds: [e]
      });      
    });


    this.collector.on('end', async collection => {
      await msgInteraction.editReply({
        components: []
      });
    });
  }

  _prepareData (page) {
    const maxLines = 15;
    const data = this.data;
    const dataLen = data.length;
    // Splice array for 15 values if exists  

    console.log(((page-1)*maxLines) , (page*maxLines - 1));
    const display = data.splice( ((page-1)*maxLines) , (page*maxLines - 1));
    
    // Tabulate data for display
    const tabulated = Paginator.tabulate(display) 

    return tabulated;
  }


  static tabulate (data) {
    console.log(data);
    // Data builder
    const options = {
      columnSplitter: '|',
      config: {
				" Rank ": { align: "center" },
				" Points ": { align: "right" }
			}
    }

    const columns = columnify(data, options);


    return `\`\`\`\n${columns}\n\`\`\``;
  } 


}


// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------