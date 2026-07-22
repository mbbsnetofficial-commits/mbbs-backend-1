const express = require('express');
const cors = require("cors");
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
const {
    authRouter,
    platformAdminRouter,
    qodRouter,
    testQuestionRouter,
    previousYearQuestionRouter,
    chatRouter,
    studentActivityRouter,
    userActivityRouter,
    studentProfileRouter,
    questionFeedbackRouter,
    reviewCommentRouter,
    notificationRouter
} = require("./routes/neet-routes");

// Railway terminates HTTPS at its proxy. This also makes req.ip use forwarded data.
app.set("trust proxy", 1);

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(origin => origin.trim())
    : true;

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "MBBS NEET API is running",
        timestamp: new Date().toISOString()
    });
});


// Interactive API documentation. This does not change the authentication routes.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes. Keep admin before student routers because admin login is public.
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/admin", platformAdminRouter);
app.use("/api/v1", qodRouter);
app.use("/api/v1", testQuestionRouter);
app.use("/api/v1/previous-year-tests", previousYearQuestionRouter);
app.use("/api/v1", chatRouter);
app.use("/api/v1", studentActivityRouter);
app.use("/api/v1", userActivityRouter);
app.use("/api/v1", studentProfileRouter);
app.use("/api/v1", questionFeedbackRouter);
app.use("/api/v1", reviewCommentRouter);
app.use("/api/v1", notificationRouter);


module.exports = app;
