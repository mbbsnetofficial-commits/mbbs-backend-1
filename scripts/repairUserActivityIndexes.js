const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

const LEGACY_UNIQUE_INDEXES = ["id_1", "user_id_1"];
const EVENT_INDEXES = [
    {
        keys: { event_type: 1, login_at: -1 },
        options: { name: "login_activity_time" }
    },
    {
        keys: { user_id: 1, login_at: -1 },
        options: { name: "login_activity_user_time" }
    },
    {
        keys: { student_id: 1, login_at: -1 },
        options: { name: "login_activity_student_time" }
    },
    {
        keys: { email: 1, login_at: -1 },
        options: { name: "login_activity_email_time" }
    }
];

const run = async () => {
    if (!process.env.CONNECTION_STRING) {
        throw new Error("CONNECTION_STRING is not configured.");
    }
    await mongoose.connect(process.env.CONNECTION_STRING);
    const collection = mongoose.connection.collection("neet-app-user-activity");
    const existing = await collection.indexes();

    for (const name of LEGACY_UNIQUE_INDEXES) {
        const index = existing.find(item => item.name === name);
        if (index?.unique) {
            await collection.dropIndex(name);
            console.log(`Dropped legacy unique index ${name}.`);
        }
    }

    for (const { keys, options } of EVENT_INDEXES) {
        await collection.createIndex(keys, options);
        console.log(`Ensured ${options.name}.`);
    }

    console.log("User activity indexes now support append-only login events.");
};

run()
    .catch(error => {
        console.error("User activity index repair failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
