const { Events } = require('discord.js');

module.exports = {
	name: Events.PresenceUpdate,
	on: true,
	execute(oldMember, newMember) {
        if (oldMember === null) {
            console.log(`Presence Update was null!`);
            try {console.log(` new member update ${newMember.user}`)}
            catch{}
        } else {
        console.log(`${oldMember.user} updated their status`)
        }
    }}