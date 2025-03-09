import Message from "./MessageModels.js"
import { mkdirSync, existsSync, renameSync } from "fs";

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc"; 
const IV_LENGTH = 16; 
const SECRET_KEY = "abcdefghijklmnopqrstuvwxyz123456"; // Store securely

const decryptMessage = (encryptedText) => {
    try {
        const parts = encryptedText.split(":");
        if (parts.length !== 2) throw new Error("Invalid encrypted message format");

        const iv = Buffer.from(parts[0], "hex");
        const encrypted = Buffer.from(parts[1], "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, "utf-8"), iv);
        let decrypted = decipher.update(encrypted);
        decrypted += decipher.final("utf-8");

        return decrypted;
    } catch (error) {
        console.error("Decryption Error:", error.message);
        return "Decryption Failed";
    }
};

export const getMessages = async (request, response, next) => {
    try {
        const user1 = request.userId;
        const user2 = request.body.id;

        console.log("User1 ID:", user1);
        console.log("User2 ID:", user2);

        if(!user1 || !user2) {
            return response.status(400).send("Both User ID is required!");
        }

        const messages = await Message.find({
            $or:[
                {sender: user1, recipient: user2},
                {sender: user2, recipient: user1},
            ],
        }).sort({timestamp:1});

        console.log("Retrieved Messages:", messages);
 const decryptedMessages = messages.map((msg) => ({
            ...msg._doc, 
        
            content: decryptMessage(msg.content),
        
        }));
        console.log("de",decryptedMessages);
        return response.status(200).json({decryptedMessages});
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error!");
    }
};

export const uploadFile = async (request, response, next) => {
    try {
        if(!request.file) {
            return response.status(400).send("File is required!");
        }
        const date = Date.now()
        let fileDir = `uploads/files/${date}`;
        let fileName = `${fileDir}/${request.file.originalname}`;

        mkdirSync(fileDir, {recursive: true});
        renameSync(request.file.path, fileName);

        return response.status(200).json({file: fileName});
        
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error!");
    }
};