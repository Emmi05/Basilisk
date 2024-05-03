import {createPool} from 'mysql2/promise';
import dotenv from "dotenv";

dotenv.config({ path: './env/.env' });

console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_DATABASE);


export const pool=createPool ({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database:process.env.DB_DATABASE,
})