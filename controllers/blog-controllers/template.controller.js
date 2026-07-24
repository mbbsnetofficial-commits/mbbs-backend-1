const templateService = require("../../services/blog-services/template.service");

const sendError = (res, error) => {
  const statusCode = error.statusCode || (error.code === 11000 ? 409 : 500);
  const message = error.code === 11000
    ? "A template with the same name or code already exists."
    : error.message || "An unexpected error occurred.";

  return res.status(statusCode).json({ success: false, message });
};

class TemplateController {
  async createTemplate(req, res, next) {
    try {
      const result = await templateService.createTemplate(req.body, req.admin);

      return res.status(201).json({
        success: true,
        message: "Template created successfully.",
        data: result,
      });
    } catch (error) {
      return sendError(res, error);
    }
  }

  async getAllTemplates(req, res, next) {
    try {
      const result = await templateService.getAllTemplates(req.query);

      return res.status(200).json({
        success: true,
        message: "Templates fetched successfully.",
        data: result,
      });
    } catch (error) {
      return sendError(res, error);
    }
  }

  async getTemplateById(req, res, next) {
    try {
      const result = await templateService.getTemplateById(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Template fetched successfully.",
        data: result,
      });
    } catch (error) {
      return sendError(res, error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const result = await templateService.updateTemplate(
        req.params.id,
        req.body,
        req.admin
      );

      return res.status(200).json({
        success: true,
        message: "Template updated successfully.",
        data: result,
      });
    } catch (error) {
      return sendError(res, error);
    }
  }

  async changeTemplateStatus(req, res, next) {
    try {
      const result = await templateService.changeTemplateStatus(
        req.params.id,
        req.body.status,
        req.admin
      );

      return res.status(200).json({
        success: true,
        message: "Template status updated successfully.",
        data: result,
      });
    } catch (error) {
      return sendError(res, error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      await templateService.deleteTemplate(req.params.id, req.admin);

      return res.status(200).json({
        success: true,
        message: "Template deleted successfully.",
      });
    } catch (error) {
      return sendError(res, error);
    }
  }
}

module.exports = new TemplateController();
