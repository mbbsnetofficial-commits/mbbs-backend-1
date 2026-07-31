"use strict";

const mongoose = require("mongoose");

// Blog database connection
const blogConnection = mongoose.createConnection();

// UCAT database connection
const ucatConnection = mongoose.createConnection();

const connectDatabases = async () => {
    const connectionString = process.env.CONNECTION_STRING;

    if (!connectionString) {
        throw new Error("CONNECTION_STRING is not configured.");
    }

    try {
        await mongoose.connect(connectionString, {
            dbName: "mbbs-neet"
        });

        await blogConnection.openUri(connectionString, {
            dbName: "blog"
        });

        await ucatConnection.openUri(connectionString, {
            dbName: "mbbs-UCAT"
        });

        return {
            neetDatabase: mongoose.connection.name,
            blogDatabase: blogConnection.name,
            ucatDatabase: ucatConnection.name
        };
    } catch (error) {
        await Promise.allSettled([
            mongoose.connection.readyState !== 0
                ? mongoose.disconnect()
                : Promise.resolve(),

            blogConnection.readyState !== 0
                ? blogConnection.close()
                : Promise.resolve(),

            ucatConnection.readyState !== 0
                ? ucatConnection.close()
                : Promise.resolve()
        ]);

        throw error;
    }
};

const disconnectDatabases = async () => {
    await Promise.allSettled([
        mongoose.connection.readyState !== 0
            ? mongoose.disconnect()
            : Promise.resolve(),

        blogConnection.readyState !== 0
            ? blogConnection.close()
            : Promise.resolve(),

        ucatConnection.readyState !== 0
            ? ucatConnection.close()
            : Promise.resolve()
    ]);
};

module.exports = {
    blogConnection,
    ucatConnection,
    connectDatabases,
    disconnectDatabases
};
