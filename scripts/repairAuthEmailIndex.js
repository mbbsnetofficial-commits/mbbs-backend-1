const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

const run = async () => {
    if (!process.env.CONNECTION_STRING) {
        throw new Error("CONNECTION_STRING is not configured.");
    }

    await mongoose.connect(process.env.CONNECTION_STRING);
    const collection = mongoose.connection.collection("neet-auth");
    const indexes = await collection.indexes();

    const emailIndex = indexes.find(index => index.name === "email_1");
    const desiredEmailFilter = { email: { $type: "string" } };

    const emailAlreadyCorrect = emailIndex?.unique === true &&
        JSON.stringify(emailIndex.partialFilterExpression) === JSON.stringify(desiredEmailFilter);

    if (emailAlreadyCorrect) {
        console.log("email_1 is already a partial unique index. No change required.");
    } else {
        if (emailIndex) {
            console.log("Dropping existing email_1 index...");
            await collection.dropIndex("email_1");
        }

        console.log("Creating partial unique index for email_1...");
        await collection.createIndex(
            { email: 1 },
            {
                unique: true,
                partialFilterExpression: desiredEmailFilter,
                name: "email_1"
            }
        );
        console.log("email_1 repaired: only string email addresses participate in uniqueness.");
    }

    // Also verify and ensure phoneNumber_1 is correct
    const phoneIndex = indexes.find(index => index.name === "phoneNumber_1");
    const desiredPhoneFilter = { phoneNumber: { $type: "string" } };
    const phoneAlreadyCorrect = phoneIndex?.unique === true &&
        JSON.stringify(phoneIndex.partialFilterExpression) === JSON.stringify(desiredPhoneFilter);

    if (phoneAlreadyCorrect) {
        console.log("phoneNumber_1 is already a partial unique index.");
    } else {
        if (phoneIndex) {
            console.log("Dropping existing phoneNumber_1 index...");
            await collection.dropIndex("phoneNumber_1");
        }
        console.log("Creating partial unique index for phoneNumber_1...");
        await collection.createIndex(
            { phoneNumber: 1 },
            {
                unique: true,
                partialFilterExpression: desiredPhoneFilter,
                name: "phoneNumber_1"
            }
        );
        console.log("phoneNumber_1 repaired.");
    }
};

run()
    .then(async () => {
        console.log("Index verification complete.");
    })
    .catch(error => {
        console.error("Index repair failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
