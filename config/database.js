"use strict";

const mongoose = require("mongoose");

// Blog database connection
const blogConnection = mongoose.createConnection();

// UCAT database connection
const ucatConnection = mongoose.createConnection();

const HIGH_CONCURRENCY_POOL_OPTIONS = {
    maxPoolSize: 100,
    minPoolSize: 10,
    maxIdleTimeMS: 30000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    autoIndex: process.env.NODE_ENV !== "production"
};

const connectDatabases = async () => {
    const connectionString = process.env.CONNECTION_STRING;

    if (!connectionString) {
        throw new Error("CONNECTION_STRING is not configured.");
    }

    try {
        await mongoose.connect(connectionString, {
            ...HIGH_CONCURRENCY_POOL_OPTIONS,
            dbName: "mbbs-neet"
        });

        await blogConnection.openUri(connectionString, {
            ...HIGH_CONCURRENCY_POOL_OPTIONS,
            dbName: "blog"
        });

        await ucatConnection.openUri(connectionString, {
            ...HIGH_CONCURRENCY_POOL_OPTIONS,
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
