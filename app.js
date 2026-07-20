const express = require('express');
const authRouter = require('./routes/auth.routes');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
const qodRouter = require("./routes/qod.routes");
const testQuestionRouter = require("./routes/testQuestion.routes");
const chatRouter = require("./routes/chat.routes");
const studentActivityRouter = require("./routes/studentActivity.routes");
const userActivityRouter = require("./routes/userActivity.routes");
const studentProfileRouter = require("./routes/studentProfile.routes");
const questionFeedbackRouter = require("./routes/questionFeedback.routes");
const reviewCommentRouter = require("./routes/reviewComment.routes");
const notificationRouter = require("./routes/notification.routes");
const platformAdminRouter = require("./routes/platformAdmin.routes");
const previousYearQuestionRouter = require("./routes/previousYearQuestion.routes");



// Interactive API documentation. This does not change the authentication routes.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Routes
app.use(express.json());
app.use('/api/v1/auth', authRouter);
// Admin login must be mounted before student routers that apply protect globally.
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
