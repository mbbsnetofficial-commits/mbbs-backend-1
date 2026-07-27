const express = require('express');
const cors = require("cors");
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
const templateRouter = require("./routes/blog-routes/template.routes");
const categoryRouter = require("./routes/blog-routes/category.routes");
const tagRouter = require("./routes/blog-routes/tag.routes");
const authorRouter = require("./routes/blog-routes/aurthor.routes");
const blogRouter = require("./routes/blog-routes/blog.routes");
const mediaRouter = require("./routes/blog-routes/media");
const seoRouter = require("./routes/blog-routes/seo.routes");
const {
    publicReviewRouter,
    adminReviewRouter
} = require("./routes/blog-routes/review.routes");
const searchRouter = require("./routes/blog-routes/search.routes");
const analyticsRouter = require("./routes/blog-routes/analytics.routes");
const pageRouter = require("./routes/blog-routes/page.routes");
const { aiRouter } = require("./src/modules/ai");
const {
    apiLimiter,
    mutationLimiter,
    adminLimiter
} = require("./middleware/rateLimit.middleware");
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
    notificationRouter,
    testLeaderboardRouter,
    authorFollowRouter
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

// A simple landing response makes it clear that the backend domain is routed
// correctly when it is opened directly in a browser.
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "MBBS NEET API is running",
        health: "/health",
        documentation: "/api-docs"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "MBBS NEET API is running",
        timestamp: new Date().toISOString()
    });
});


// Interactive API documentation. This does not change the authentication routes.
app.get('/api-docs.json', (req, res) => {
    res.type('application/json').send(swaggerDocument);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes. Keep admin before student routers because admin login is public.
app.use("/api/v1", apiLimiter);
app.use("/api/v1", mutationLimiter);
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/blog-reviews", publicReviewRouter);
app.use("/api/v1/blog-search", searchRouter);
app.use("/api/v1/pages", pageRouter);
// Mount the specific blog-template router before the general admin router so
// each template request passes through admin authentication only once.
app.use("/api/v1/admin/blog-templates", adminLimiter, templateRouter);
app.use("/api/v1/admin/blog-categories", adminLimiter, categoryRouter);
app.use("/api/v1/admin/blog-tags", adminLimiter, tagRouter);
app.use("/api/v1/admin/blog-authors", adminLimiter, authorRouter);
app.use("/api/v1/admin/blogs", adminLimiter, blogRouter);
app.use("/api/v1/admin/blog-media", adminLimiter, mediaRouter);
app.use("/api/v1/admin/blog-seo", adminLimiter, seoRouter);
app.use("/api/v1/admin/blog-reviews", adminLimiter, adminReviewRouter);
app.use("/api/v1/admin/blog-analytics", adminLimiter, analyticsRouter);
app.use("/api/v1/admin/ai", adminLimiter, aiRouter);
app.use("/api/v1/admin", adminLimiter, platformAdminRouter);

// Do not allow an unmatched admin URL to fall through into student routers.
// This keeps authentication errors accurate when the method or path is wrong.
app.use("/api/v1/admin", (req, res) => {
    return res.status(404).json({
        status: "fail",
        message: "Admin route not found. Check the API URL and HTTP method."
    });
});

app.use("/api/v1", qodRouter);
app.use("/api/v1", testQuestionRouter);
app.use("/api/v1", testLeaderboardRouter);
app.use("/api/v1/previous-year-tests", previousYearQuestionRouter);
app.use("/api/v1", chatRouter);
app.use("/api/v1", studentActivityRouter);
app.use("/api/v1", userActivityRouter);
app.use("/api/v1", studentProfileRouter);
app.use("/api/v1", questionFeedbackRouter);
app.use("/api/v1", reviewCommentRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", authorFollowRouter);


module.exports = app;
