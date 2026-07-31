"use strict";

const dotenv = require("dotenv");
const path = require("path");

if (!globalThis.crypto) {
    globalThis.crypto = require("node:crypto").webcrypto;
}

dotenv.config({
    path: path.join(__dirname, "config", "config.env")
});

// Database connections
const {
    connectDatabases,
    disconnectDatabases
} = require("./config/database");

const app = require("./app");

const port = process.env.PORT || 3000;

// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {
    try {
        const databases = await connectDatabases();

        console.log(
            `NEET database connected: ${databases.neetDatabase}`
        );

        console.log(
            `Blog database connected: ${databases.blogDatabase}`
        );

        console.log(
            `UCAT database connected: ${databases.ucatDatabase}`
        );

        const server = app.listen(
            port,
            "0.0.0.0",
            () => {
                console.log(
                    `Server started on 0.0.0.0:${port}`
                );
            }
        );

        const shutdown = signal => {
            console.log(
                `${signal} received. Closing server...`
            );

            server.close(async () => {
                try {
                    await disconnectDatabases();

                    console.log(
                        "All database connections closed."
                    );

                    process.exit(0);
                } catch (error) {
                    console.error(
                        "Error while closing databases:",
                        error.message
                    );

                    process.exit(1);
                }
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();
