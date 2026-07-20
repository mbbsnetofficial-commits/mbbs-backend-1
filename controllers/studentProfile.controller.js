const StudentProfile = require("../model/studentProfile");

const editableFields = [
    "phone_number",
    "email",
    "full_name",
    "date_of_birth",
    "school_name",
    "target_exam_year",
    "auth_provider"
];

const pickEditableFields = body => Object.fromEntries(
    editableFields
        .filter(field => body[field] !== undefined)
        .map(field => [field, body[field]])
);

const validateProfileData = data => {
    if (data.phone_number && !/^\+[1-9]\d{7,14}$/.test(data.phone_number)) {
        return "phone_number must use international format, for example +918012036989.";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return "A valid email address is required.";
    }

    if (data.target_exam_year !== undefined) {
        const year = Number(data.target_exam_year);
        if (!Number.isInteger(year) || year < 2000 || year > 2200) {
            return "target_exam_year must be a valid year.";
        }
        data.target_exam_year = year;
    }

    return null;
};

exports.createOrUpdateStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.student_id;
        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from the authentication token."
            });
        }

        const profileData = pickEditableFields(req.body);
        const validationError = validateProfileData(profileData);
        if (validationError) {
            return res.status(400).json({ status: "fail", message: validationError });
        }

        const existingProfile = await StudentProfile.exists({ student_id: studentId });
        const profile = await StudentProfile.findOneAndUpdate(
            { student_id: studentId },
            {
                $set: { ...profileData, last_login: new Date() },
                $setOnInsert: {
                    student_id: studentId,
                    is_active: true,
                    is_verified: false,
                    email_verified: false,
                    is_institution_student: false,
                    is_first_login: true
                }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        const statusCode = existingProfile ? 200 : 201;
        return res.status(statusCode).json({
            status: "success",
            message: existingProfile
                ? "Student profile updated successfully."
                : "Student profile created successfully.",
            data: profile
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                status: "fail",
                message: "A profile already uses one of the supplied unique values."
            });
        }
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.getMyStudentProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
            student_id: req.user.student_id
        }).lean();

        if (!profile) {
            return res.status(404).json({
                status: "fail",
                message: "Student profile not found."
            });
        }

        return res.status(200).json({ status: "success", data: profile });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
