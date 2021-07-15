const discord = require("discord.js");
const client = new discord.Client()
// const prefix = require(process.env.PREFIX);
// const ServerID = require(process.env.SERVER_ID);
const { prefix, ServerID, TOKEN, ACT, STT } = require("./config.json")
const config = require('./config.json');

client.on("ready", () => {

    console.log("Bot is now online.")
    client.user.setActivity(
      {
          type: ACT,
          name: STT
    })
})

client.on("channelDelete", (channel) => {
    if (channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if (!person) return;

        let yembed = new discord.MessageEmbed()
            .setAuthor("CASE CLOSED", `https://cdn.discordapp.com/attachments/852888201391374376/853598262724395018/20210613_182942.gif`)
            .setColor('RED')
            .setDescription("Please do not reply after this message unless you have another trouble.")
        return person.send(yembed)

    }
})

client.on("message", async message => {
    if (message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();


    if (message.guild) {

        if (command == "say") {
          if (!message.content.startsWith(prefix) || message.author.bot) return;

          if (!args[0]) { message.author.send({
              embed: {
                color: 'RED',
                author: { name: `Error | ${prefix}say`}, 
                description: `Provide a word to say in the say command\nExample: ${prefix}say Hello`,
                footer: { text: `Requested by ${message.author.tag}` },
                timestamp: new Date(),
              }
            });
          }

          const say = args.join(" ");
          message.channel.send(say)

        }

        if (command == "sayd") {
          if (!message.content.startsWith(prefix) || message.author.bot) return;

          if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.reply("You need `Staff` role.");
          }

          if (!args[0]) { message.author.send({
              embed: {
                color: 'RED',
                author: { name: `Error | ${prefix}sayd`}, 
                description: `Provide a word to say in the sayd command\nExample: ${prefix}say Hello`,
                footer: { text: message.guild.name },
                timestamp: new Date(),
              }
            });
          }

          const sayd = args.join(" ");
          message.channel.send(sayd)
          message.delete()

        }

        // if (command == "esay") {
        //   if (!message.content.startsWith(prefix) || message.author.bot) return;

        //   if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
        //         return message.reply("Bạn cần role `Staff`.");
        //   }

        //   const user = message.author;

        //   if (!args[0]) { user.send({
        //       embed: {
        //         color: 'RED',
        //         author: { name: 'Error'}, 
        //         description: `Provide a word to say in the say command\nExample: ${prefix}say Hello`,
        //         footer: { text: message.guild.name },
        //         timestamp: new Date(),
        //     }
        //   }); //`Provide a word to say in the say command\nExample: ${prefix}say Hello`
        //   }
        //   const esay = args.join("  ");

        //   let sayembed = new discord.MessageEmbed()
        //         .setAuthor(message.author.username,message.author.displayAvatarURL({ dynamic: true }))
        //         .setColor("WHITE")
        //         .setDescription(esay)
        //         .setTimestamp();

        //   message.channel.send(sayembed)
        //   message.delete()
        // }

        if (command == "setup") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("You need Admin Permissions to setup the modmail system!")
            }

            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("Bot need Admin Permissions to setup the modmail system!")
            }


            let role = message.guild.roles.cache.find((x) => x.name == "Staff")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: "Staff",
                        color: "YELLOW"
                    },
                    reason: "A role that need for Modmail system."
                })
            }

            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "All cases will be sent here.",
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })


            return message.channel.send("SETUP DONE! ✅")

        } else if (command == "close") {
            if (!message.content.startsWith(prefix)) return;
            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send("You need `Staff` role.")
            }
            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {

                const person = message.guild.members.cache.get(message.channel.name)

                if (!person) {
                    return message.channel.send("I cant close this case because the channel name has been changed.")
                }

                await message.channel.delete()

                let yembed = new discord.MessageEmbed()
                    .setAuthor("CASE CLOSED")
                    .setColor("RED")
                    .setFooter("This case was closed by " + message.author.username,message.author.displayAvatarURL({ dynamic: true }))
                if (args[0]) yembed.setDescription(`Reason: ${args.join(" ")}`)

                return person.send(yembed)

            }
        } else if (command == "open") {
            if (!message.content.startsWith(prefix)) return;
            const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

            if (!category) {
                return message.channel.send("Hệ thống ModMail chưa được lắp đặt, hãy dùng " + prefix + "setup")
            }

            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send("You need `Staff` role.")
            }

            if (isNaN(args[0]) || !args.length) {
                return message.channel.send("Please provide his/her user ID!")
            }

            const target = message.guild.members.cache.find((x) => x.id === args[0])

            if (!target) {
                return message.channel.send("Can not find this user.")
            }


            const channel = await message.guild.channels.create(target.id, {
                type: "text",
                parent: category.id,
                topic: "This case was directly open by **" + message.author.username + "** to contact with " + message.author.tag
            })

            let nembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", target.user.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", target.user.username)
                .addField("Account created date", target.user.createdAt)
                .addField("Directly open", "Yes (This means this case was open using o.open)");

            channel.send(nembed)

            let uembed = new discord.MessageEmbed()
                .setAuthor("CASE OPENED")
                .setColor("GREEN")
                .setThumbnail(`https://cdn.discordapp.com/attachments/852888201391374376/853598262724395018/20210613_182942.gif`)
                .setDescription("You have been contacted by `Staff` of **" + message.guild.name + "**, please wait until they contact with you!");


            target.send(uembed);

            let newEmbed = new discord.MessageEmbed()
                .setDescription("A CASE has just been opened: <#" + channel + ">")
                .setColor("GREEN");

            return message.channel.send(newEmbed);
        } else if (command == "mm") {
            if (!message.content.startsWith(prefix)) return;

            let normalembed = new discord.MessageEmbed()
                .setAuthor('Help Panel | Normal') //Normal means its opened by non-Staff user.
                .setColor('WHITE')
                .addField("mm", 'Show this help panel',true)
                .addField("say", prefix + "say + <Content>",true)                
                .setFooter("Requested by " + message.author.tag,message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            if (!message.member.roles.cache.find((x) => x.name == "Staff")) {
                return message.channel.send(normalembed)
            }

            let embed = new discord.MessageEmbed()
                .setAuthor('Help Panel | Staff') //Staff means Staff, yeah /shrug
                .setColor("BLACK")
                .addField("mm", 'Show this help panel', true)
                .addField("open", 'Using: o.open + <ID>\nOpen a CASE with their user ID.', true)
                .addField("close", "Close CASE when unnecessary.", true)
                .addField("say", prefix + "say + <content>",true)  
                .addField("sayd", "Same as " + prefix + "say but delete author command.", true)
                .addField("links", "Show links of us.", true)
                .setFooter("Requested by " + message.author.tag,message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
                
            return message.channel.send(embed);

        }
          else if (command == "links") {
              if (!message.content.startsWith(prefix)) return;
              let embed = new discord.MessageEmbed()
                  .setAuthor('Links of us',`https://cdn.discordapp.com/attachments/852888201391374376/853598262724395018/20210613_182942.gif`,'https://www.youtube.com/channel/UCEG5sgFKieaUuHsu5VG-kBg')
                  .setDescription('**Discord**: https://discord.link/owlvernyte' + "\n" + '**Facebook**: https://www.facebook.com/owlvernyte' + "\n" + '**Github**: https://github.com/Owlvernyte/modmail')
                  .setColor("PURPLE")
                  .setFooter('Thanks a lot!')
                  .setThumbnail();
              return message.channel.send(embed);

        /*} else if (command == "nick") {
            if (!message.content.startsWith(prefix)) return;
            let lembed = new discord.MessageEmbed()
              .setDescription('DEVELOPING...')
              .setColor("RED")
              .setFooter('In progress.');
            return message.channel.send(lembed);*/
            
        } 
            else if (command == "rbw") {
                if (!message.content.startsWith(prefix)) return;
                
//                 if (!message.member.roles.cache.find((x) => x.name == "Staff") { 
//                     return message.reply("Bạn cần role `Staff`.")
//                 }
                    
                message.channel.send('<a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722><a:acongablob:852756175568371722>');
                message.delete();
            }

    }

    if (message.channel.parentID) {

        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if (!member) return message.channel.send('`Can not send message.`')

            let lembed = new discord.MessageEmbed()
                .setColor("GREEN")
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)

            return member.send(lembed);
        }


    }

    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => { })
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)


        if (!main) {
            let mx = await guild.channels.create(message.author.id, {
                type: "text",
                parent: category.id,
                topic: "This CASE was opened to help **" + message.author.tag + "**"
            })

            let sembed = new discord.MessageEmbed()
                .setAuthor("CASE OPENED")
                .setColor("GREEN")
                .setThumbnail(`https://cdn.discordapp.com/attachments/852888201391374376/853598262724395018/20210613_182942.gif`)
                .setDescription("Conversation begins, from now you will connect with Staff of " + message.guild.name + ". Be patient.")

            message.author.send(sembed)


            let eembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", message.author.displayAvatarURL({ dynamic: true }))
                .setColor("BLUE")
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(message.content)
                .addField("Name", message.author.username)
                .addField("Account created date", message.author.createdAt)
                .addField("Directly open", "No (Means this CASE is opened when a user DM the BOT)")


            return mx.send(eembed)
        }

        let xembed = new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(message.content)


        main.send(xembed)

    }
})


client.login(TOKEN)
