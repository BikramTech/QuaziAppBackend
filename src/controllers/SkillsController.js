const helpers = require("../config/helpers");
const { QzKeySkills } = require("../db/models");

class SkillsController {
  static async addKeySkill(req, res) {
    try {
      const { name } = req.body;

      const keySkills = new QzKeySkills({
        name,
      });

      await keySkills.save();

      let response = {
        status_code: 1,
        message: "Key Skill added successfully",
        result: [],
      };

      return helpers.SendSuccessResponse(res, response);
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async getKeySkillById(req, res) {
    try {
      const keySkills = await QzKeySkills.findById(req.params.id);

      if (!keySkills.length) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          "No record with the provided skill id"
        );
      }

      let response = {
        status_code: 1,
        result: [keySkills],
      };

      return helpers.SendSuccessResponse(res, response);
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async getKeySkills(req, res) {
    try {
      const keySkills = await QzKeySkills.find();

      if (!keySkills.length) {
        return helpers.SendErrorsAsResponse(null, res, "No records!");
      }

      let response = {
        status_code: 1,
        result: [keySkills],
      };

      return helpers.SendSuccessResponse(res, response);
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async updateKeySkill(req, res) {
    try {
      const { name } = req.body;

      const keySkillUpdatedResult = await QzKeySkills.findByIdAndUpdate(
        req.params.id,
        {
          name,
        },
        { new: true }
      );

      if (!keySkillUpdatedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          "No record exists with the provided id"
        );

      let response = {
        status_code: 1,
        message: "Key Skill updated successfully",
        result: [],
      };

      return helpers.SendSuccessResponse(res, response);
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async deleteKeySkill(req, res) {
    try {
      const keySkillDeletedResult = await QzKeySkills.findByIdAndDelete(
        req.params.id
      );

      if (!keySkillDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          "No record exists with the provided id"
        );

      let response = {
        status_code: 1,
        message: "Key Skill deleted successfully",
        result: [],
      };

      return helpers.SendSuccessResponse(res, response);
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }
}

module.exports = SkillsController;
