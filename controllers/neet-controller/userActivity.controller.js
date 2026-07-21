const UserActivity = require("../../model/neet-models/userActivity");

const getIpAddress = req => {
    const address = req.ip || req.socket.remoteAddress || "unknown";
    return address.replace(/^::ffff:/, "");
};

const createActivity = async activityData => {
    const latestActivity = await UserActivity.findOne()
        .sort({ id: -1 })
        .select("id")
        .lean();

    return UserActivity.create({
        id: (latestActivity?.id || 0) + 1,
        ...activityData
    });
};

exports.recordUserActivity = async (req, res) => {
    try {
        const userId = Number(req.body.user_id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                status: "fail",
                message: "A positive numeric user_id is required."
            });
        }

        const activityData = {
            user_id: userId,
            last_seen: new Date(),
            ip_address: getIpAddress(req),
            user_agent: req.get("user-agent") || "unknown"
        };

        let activity = await UserActivity.findOneAndUpdate(
            { user_id: userId },
            { $set: activityData },
            { new: true, runValidators: true }
        );
        let statusCode = 200;

        if (!activity) {
            try {
                activity = await createActivity(activityData);
                statusCode = 201;
            } catch (error) {
                if (error.code !== 11000) throw error;

                activity = await UserActivity.findOneAndUpdate(
                    { user_id: userId },
                    { $set: activityData },
                    { new: true, runValidators: true }
                );

                if (!activity) throw error;
            }
        }

        return res.status(statusCode).json({
            status: "success",
            message: statusCode === 201
                ? "User activity created successfully."
                : "User activity updated successfully.",
            data: activity
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.getUserActivity = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                status: "fail",
                message: "userId must be a positive number."
            });
        }

        const activity = await UserActivity.findOne({ user_id: userId }).lean();

        if (!activity) {
            return res.status(404).json({
                status: "fail",
                message: "User activity not found."
            });
        }

        return res.status(200).json({ status: "success", data: activity });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
