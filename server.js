const dotenv = require("dotenv");
const path = require("path");

// Railway supplies environment variables directly. This file remains useful locally.
dotenv.config({ path: path.join(__dirname, "config", "config.env") });

const { connectDatabases, disconnectDatabases } = require("./config/database");
const app = require("./app");

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        const databases = await connectDatabases();
        console.log(`NEET database connected: ${databases.neetDatabase}`);
        console.log(`Blog database connected: ${databases.blogDatabase}`);

        const server = app.listen(port, "0.0.0.0", () => {
            console.log(`Server started on 0.0.0.0:${port}`);
        });

        // const shutdown = signal => {
        //     console.log(`${signal} received. Closing server...`);
        //     server.close(async () => {
        //         await disconnectDatabases();
        //         process.exit(0);
        //     });
        // };

        // process.on("SIGTERM", () => shutdown("SIGTERM"));
        // process.on("SIGINT", () => shutdown("SIGINT"));
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
