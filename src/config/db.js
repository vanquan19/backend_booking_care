import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const env = process.env.NODE_ENV || "development";
import config from "./configdb.js";

// create the connection to database
const connection = mysql.createPool(config[env]);

const checkConnection = async () => {
    try {
        await connection.getConnection();
        console.log("Database connected");
    } catch (error) {
        console.log("Database connection failed");
    }
};

checkConnection();

export default connection;
