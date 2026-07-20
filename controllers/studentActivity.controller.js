const StudentActivity = require("../model/studentActivity");

const getIpAddress = req => {
    const address = req.ip || req.socket.remoteAddress || "unknown";

    return address.replace(/^::ffff:/, "");
};

const createActivity = async activityData => {
    // This numeric ID keeps the same structure as the existing collection.
    const latestActivity = await StudentActivity.findOne()
        .sort({ id: -1 })
        .select("id")
        .lean();

    return StudentActivity.create({
        id: (latestActivity?.id || 0) + 1,
        ...activityData
    });
};

exports.recordStudentActivity = async (req, res) => {
    try {
        const studentId = req.user.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from the authentication token."
            });
        }

        const activityData = {
            student_id: studentId,
            last_seen: new Date(),
            ip_address: getIpAddress(req),
            user_agent: req.get("user-agent") || "unknown"
        };

        let activity = await StudentActivity.findOneAndUpdate(
            { student_id: studentId },
            { $set: activityData },
            { new: true, runValidators: true }
        );
        let statusCode = 200;

        if (!activity) {
            try {
                activity = await createActivity(activityData);
                statusCode = 201;
            } catch (error) {
                // If simultaneous first requests created the student, update that record.
                if (error.code !== 11000) throw error;

                activity = await StudentActivity.findOneAndUpdate(
                    { student_id: studentId },
                    { $set: activityData },
                    { new: true, runValidators: true }
                );

                if (!activity) throw error;
            }
        }

        return res.status(statusCode).json({
            status: "success",
            message: statusCode === 201
                ? "Student activity created successfully."
                : "Student activity updated successfully.",
            data: activity
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.getMyStudentActivity = async (req, res) => {
    try {
        const activity = await StudentActivity.findOne({
            student_id: req.user.student_id
        }).lean();

        if (!activity) {
            return res.status(404).json({
                status: "fail",
                message: "Student activity not found."
            });
        }

        return res.status(200).json({ status: "success", data: activity });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
