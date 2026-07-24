const mongoose = require("mongoose");

// The default Mongoose connection is reserved for the existing NEET database.
// Blog models are registered on this separate connection instance.
const blogConnection = mongoose.createConnection();

const connectDatabases = async () => {
    const mainConnectionString = process.env.CONNECTION_STRING;
    const blogConnectionString = process.env.BLOG_CONNECTION_STRING || mainConnectionString;
    const blogDatabaseName = process.env.BLOG_DATABASE_NAME || "blog";

    if (!mainConnectionString) {
        throw new Error("CONNECTION_STRING is not configured.");
    }

    await mongoose.connect(mainConnectionString);

    try {
        await blogConnection.openUri(blogConnectionString, {
            dbName: blogDatabaseName
        });
    } catch (error) {
        await mongoose.disconnect();
        throw error;
    }

    return {
        neetDatabase: mongoose.connection.name,
        blogDatabase: blogConnection.name
    };
};

const disconnectDatabases = async () => {
    await Promise.all([
        mongoose.disconnect(),
        blogConnection.readyState === 0
            ? Promise.resolve()
            : blogConnection.close()
    ]);
};

module.exports = {
    blogConnection,
    connectDatabases,
    disconnectDatabases
};
