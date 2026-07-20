const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

// Load Environment Variables
dotenv.config({
    path: "./config.env"
});

// Optional (same as server.js)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

mongoose.connect(process.env.CONNECTION_STRING)
.then(async () => {

    console.log("Database Connected");

    const Question = mongoose.connection.collection("questions-of-the-day");

    const questions = await Question.find({})
        .sort({ id: 1 })
        .toArray();

    let currentDate = new Date("2026-01-01");

    for (const question of questions) {

        await Question.updateOne(
            { _id: question._id },
            {
                $set: {
                    question_date: new Date(currentDate)
                }
            }
        );

        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("✅ All 365 questions updated successfully.");

    process.exit();

})
.catch((err) => {
    console.log(err);
    process.exit();
});