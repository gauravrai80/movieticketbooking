import mongoose from 'mongoose';
import Theater from './backend/models/Theater.js';
import 'dotenv/config';

// Load .env from backend folder
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function checkTheaters() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const theaters = await Theater.find({});
        console.log(`Found ${theaters.length} theaters`);
        theaters.forEach(t => console.log(`- ${t.name} (ID: ${t._id})`));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkTheaters();
