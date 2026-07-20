const dotenv = require("dotenv");

// Railway supplies environment variables directly. This file remains useful locally.
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const app = require("./app");

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        if (!process.env.CONNECTION_STRING) {
            throw new Error("CONNECTION_STRING is not configured.");
        }

        await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database connected successfully");

        const server = app.listen(port, "0.0.0.0", () => {
            console.log(`Server started on 0.0.0.0:${port}`);
        });

        const shutdown = signal => {
            console.log(`${signal} received. Closing server...`);
            server.close(async () => {
                await mongoose.disconnect();
                process.exit(0);
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
