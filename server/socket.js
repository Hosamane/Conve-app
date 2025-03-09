import { Server as SocketIo } from 'socket.io';
import Message from './models/MessageModels.js';
import Channel from './models/ChannelModel.js';

import crypto from 'crypto';

const ALGORITHM = "aes-256-cbc"; // Encryption algorithm
const IV_LENGTH = 16; // Initialization vector size
const SECRET_KEY = "abcdefghijklmnopqrstuvwxyz123456"; // Store this securely (e.g., in environment variables)


function encryptMessage(text) {
    if (!text) return "";
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "utf-8"), iv);
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    console.log(encrypted);
    return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted text
}

function decryptMessage(encryptedText) {
    try {
        const parts = encryptedText.split(":");
        if (parts.length !== 2) throw new Error("Invalid encrypted message format");

        const iv = Buffer.from(parts[0], "hex");
        const encrypted = parts[1];

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "utf-8"), iv);
        let decrypted = decipher.update(encrypted, "hex", "utf-8");
        decrypted += decipher.final("utf-8");

        return decrypted;
    } catch (error) {
        console.error("Decryption Error:", error.message);
        return "Decryption Failed";
    }
}
const setupSocket = (server) => {
    const io = new SocketIo(server, {
        cors:{
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials : true,
        },
    }); 

    const userSocketMap = new Map();

    // Function to disconnect the user
    const disconnect = (socket) => {
        console.log(`Socket ${socket.id} disconnected`);
        for(const[userId,socketId] of userSocketMap.entries()) {
            if(socketId === socket.id){
                userSocketMap.delete(userId);
                break;
            }
        }
    }

    const sendChannelMessage = async (message) => {
        console.log("Sending channel message BEYA", message);
        const { channelId, sender, content, messageType, fileUrl } = message;
    
        const createdMessage = await Message.create({
            sender,
            recipient: null,
            content,
            messageType,
            timestamp: new Date(),
            fileUrl,
        });
    
        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .exec();
    
        await Channel.findByIdAndUpdate(channelId, {
            $push: {
                messages: createdMessage._id
            },
        });
    
        const channel = await Channel.findById(channelId).populate("members"); // Renamed from 'Channel' to 'channel'
    
        const finalData = { ...messageData._doc, channelId: channel._id };
    
        if (channel && channel.members) { // Use the correctly named 'channel'
            channel.members.forEach((member) => {
                const memberSocketId = userSocketMap.get(member._id.toString());
                if (memberSocketId) {
                    io.to(memberSocketId).emit("receive-channel-message", finalData);
                }
            });
            const adminSocketId = userSocketMap.get(channel.admin._id.toString()); // Use 'channel' instead of 'Channel'
            if (adminSocketId) {
                io.to(adminSocketId).emit("receive-channel-message", finalData);
            }
        }
    };
    // const sendMessage = async (message) => {
    //     console.log(message);
    //     // Get the socket id of the sender and recipient
    //     const senderSocketId = userSocketMap.get(message.sender); 
    //     const recipientSocketId = userSocketMap.get(message.recipient);
    //     console.log(recipientSocketId);
    //     const message1=message;
    //     message.content = encryptMessage(message.content);
    //     const encrypmessage=message;
    //     console.log("mes",message);
    //     // Create the message in the database to use it as a history of chats between users
    //     const createdMessage = await Message.create(message);

    //     const messageData = await Message.findById(createdMessage._id)
    //     .populate("sender", "id email firstName lastName image color")
    //     .populate("recipient", "id email firstName lastName image color")
    //     const messagestore = message;
    //     if(recipientSocketId){
    //         messagestore.content = decryptMessage(messagestore.content);
    //         messageData.content = messagestore.content;
    //         io.to(recipientSocketId).emit("receiveMessage", messageData);
            
    //     }
    //     console.log("ms",messagestore)

    //     if(senderSocketId){
    //         console.log("hit");
    //         console.log(messagestore.content)
    //         encrypmessage.content=decryptMessage(encrypmessage.content);
    //         messageData.content = encrypmessage.content;  

    //         io.to(senderSocketId).emit("receiveMessage", messageData);
    //     }
    // }




    const sendMessage = async (message) => {
    console.log("Original Message:", message);

    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    console.log("Recipient Socket ID:", recipientSocketId);

    // Make a copy before encryption
    const originalMessage = { ...message };

    // Encrypt content
    message.content = encryptMessage(message.content);
    console.log("Encrypted Message:", message.content);

    // Store encrypted message in DB
    const createdMessage = await Message.create(message);

    // Retrieve message with populated sender and recipient details
    const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

    if (recipientSocketId) {
        // Send decrypted message to recipient
        const decryptedMessage = { ...messageData._doc, content: decryptMessage(messageData.content) };
        io.to(recipientSocketId).emit("receiveMessage", decryptedMessage);
    }

    if (senderSocketId) {
        console.log("Sending to sender...");
        // Send decrypted message to sender
        const decryptedMessage = { ...messageData._doc, content: decryptMessage(messageData.content) };
        io.to(senderSocketId).emit("receiveMessage", decryptedMessage);
    }
};


    // Function to send message to the user
    io.on("connection", (socket)=>{
        const userId = socket.handshake.query.userId;

        if(userId){
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userId} connected with socket id ${socket.id}`);
        } else {
            console.log("User Id not found in socket handshake query");
        }

        socket.on("sendMessage", sendMessage)
        socket.on("send-channel-message", sendChannelMessage)
        socket.on("disconnect", ()=> disconnect(socket));
    });

}

export default setupSocket;