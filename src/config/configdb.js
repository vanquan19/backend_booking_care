import dotenv from "dotenv";
dotenv.config();
export default {
    development: {
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || "bookingcare",
        host: process.env.DB_HOST || "localhost",
    },
    test: {
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || "bookingcare",
        host: process.env.DB_HOST || "localhost",
    },
    production: {
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || "bookingcare",
        host: process.env.DB_HOST || "localhost",
    },
};
