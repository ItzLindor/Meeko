const Canvas = require("canvas")
const Discord = require("discord.js")

const fs = require('fs');
const path = require('path');


// const background = ["https://imgur.com/a43Hlwb.jpeg","https://imgur.com/ORUssAk.jpeg", "https://imgur.com/AvaF4Rl.jpeg", "https://imgur.com/2Rken3s.jpeg", 
//     "https://imgur.com/J6Saylq.jpeg", "https://imgur.com/WBUcGaj.jpeg", "https://imgur.com/uP0E5gw.jpeg", "https://imgur.com/SwpqcLX.jpeg", "https://imgur.com/kr59t6d.jpeg", 
//     "https://imgur.com/OYkr1zM.jpeg", "https://imgur.com/rn2k1lx.jpeg", "https://imgur.com/rn2k1lx.jpeg", "https://imgur.com/AW9Mvc6.jpeg", "https://imgur.com/ZMLxMBy.jpeg", 
//     "https://imgur.com/nYstlxb.jpeg", "https://imgur.com/JF4q3nw.jpeg", "https://imgur.com/ibuPB1k.jpeg", "https://imgur.com/hzwOGDv.jpeg", "https://imgur.com/eAvHfLm.jpeg",
//     "https://imgur.com/3IKm9WL.jpeg", "https://imgur.com/Bqyk6UH.jpeg", "https://imgur.com/ntqfwRb.jpeg", "https://imgur.com/nYWtOqK.jpeg"];

// Set the main folder path and subfolder names
const mainFolder = path.join(__dirname, 'Space Pictures');
const subfolders = ['Astro Painting Wallpapers', 'Astro Photography Wallpapers', 'Wallpapers']; // Update with actual subfolder names

function getRandomImagePath() {
    const allImages = [];

    // Iterate over each subfolder to collect images
    subfolders.forEach(subfolder => {
        const folderPath = path.join(mainFolder, subfolder);
        const images = fs.readdirSync(folderPath).map(file => path.join(folderPath, file));
        allImages.push(...images); // Add all images from this subfolder
    });

     // Choose a random image from the combined list
     const randomImagePath = allImages[Math.floor(Math.random() * allImages.length)];
     return randomImagePath;
}


//const randomBackground = background[Math.floor(Math.random()*background.length)];

const dim = {
    height:675, 
    width: 1200, 
    margin: 50
}

const av = {
    size:256, 
    x: 480, 
    y: 170, 
    margin: 50
}

const generateImage = async (member) => {
    let username = member.user.username
    let discrim = member.user.discriminator
    let avatarURL = member.user.displayAvatarURL({format: "png", dynamic: "true", size: av.size})

    const imagePath = getRandomImagePath();


    

    const canvas = Canvas.createCanvas(dim.width, dim.height)
    const ctx = canvas.getContext("2d")

    //draw background
    const backimg = await Canvas.loadImage(imagePath)


    var canvas2 = ctx.canvas ;
    var hRatio = canvas2.width  / backimg.width    ;
    var vRatio =  canvas2.height / backimg.height  ;
    var ratio  = Math.min ( hRatio, vRatio );
    var centerShift_x = ( canvas2.width - backimg.width*ratio ) / 2;
    var centerShift_y = ( canvas2.height - backimg.height*ratio ) / 2;  
    ctx.clearRect(0,0,canvas2.width, canvas2.height);
    ctx.drawImage(backimg, 0,0, backimg.width, backimg.height,
                      centerShift_x,centerShift_y, backimg.width*ratio, backimg.height*ratio);  






    //ctx.drawImage(backimg, 0, 0)

    //draw black tinted box
    ctx.fillStyle = "rgba(0,0,0,0.8)"
    ctx.fillRect(dim.margin, dim.margin, dim.width -2 * dim.margin, dim.height -2 * dim.margin)


    const avimg = await Canvas.loadImage(member.user.displayAvatarURL({format: "png", dynamic: "true", size: av.size}))
    ctx.save()

    ctx.beginPath()
    ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size /2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avimg, av.x, av.y)
    ctx.restore()

    //writ in text
    ctx.fillStyle = "white"
    ctx.textAlign = 'center'
    ctx.font = "50px bangers"
    ctx.fillText("welcome", dim.width/2, dim.margin + 70)

    //draw username
    ctx.font = "60 bangers"
    ctx.fillText(username + discrim, dim.width/2, dim.height - dim.margin-125)


    ctx.font = "40 bangers"
    ctx.fillText("to the server", dim.width /2, dim.height - dim.margin - 50)


    const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), "welcome.png")
    return attachment
}

module.exports = generateImage