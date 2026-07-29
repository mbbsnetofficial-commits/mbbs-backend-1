const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

const INDEX_NAME = "phoneNumber_1";
const desiredPartialFilter = {
    phoneNumber: { $type: "string" }
};

const run = async () => {
    if (!process.env.CONNECTION_STRING) {
        throw new Error("CONNECTION_STRING is not configured.");
    }

    await mongoose.connect(process.env.CONNECTION_STRING);
    const collection = mongoose.connection.collection("neet-auth");
    const indexes = await collection.indexes();
    const current = indexes.find(index => index.name === INDEX_NAME);

    const alreadyCorrect = current?.unique === true &&
        JSON.stringify(current.partialFilterExpression) ===
            JSON.stringify(desiredPartialFilter);

    if (alreadyCorrect) {
        console.log(`${INDEX_NAME} is already a partial unique index. No change required.`);
        return;
    }

    if (current) {
        console.log(`Dropping incompatible ${INDEX_NAME} index.`);
        await collection.dropIndex(INDEX_NAME);
    }

    await collection.createIndex(
        { phoneNumber: 1 },
        {
            unique: true,
            partialFilterExpression: desiredPartialFilter,
            name: INDEX_NAME
        }
    );

    console.log(
        `${INDEX_NAME} repaired: only string phone numbers are indexed uniquely; missing/null values are ignored.`
    );
};

run()
    .catch(error => {
        console.error("Phone index repair failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
