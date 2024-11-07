const { Events, PermissionsBitField } = require('discord.js');
const generateImage = require("../generateImage");


module.exports = {
	name: Events.GuildMemberAdd,
	on: true,
	async execute(member) {

        const img = await generateImage(member)

        //everyone role for permissions
          let everyoneRole = member.guild.roles.cache.find(r => r.name === '@everyone');
      
        
        //Find channel with Welcome
          let welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "newbs");
        
      
        //If channel not found
          if(!welcomeChannel) {
              //creates channel
              member.guild.channels.create({
                name: 'newbs',
                type: 0, // 0 corresponds to GuildText in v14
                permissionOverwrites: [
                    {
                        id: everyoneRole.id,
                        deny: [PermissionsBitField.Flags.SendMessages], // Deny sending messages
                    }
                ]
            }).then(result => {
                
              //Sends message to channel after creating
                  member.guild.channels.cache.get(result.id).send({
                  content: `<@${member.id}> Welcome to the server! You are the ${member.guild.memberCount}th member!`,
                  files: [img]
                  })
              
             
          })
        }
      
        //if channel is created already
        else{
          welcomeChannel.send({
          content: `<@${member.id}> Welcome to the server! You are the ${member.guild.memberCount}th member!`,
          files: [img]
          })
        }
}}