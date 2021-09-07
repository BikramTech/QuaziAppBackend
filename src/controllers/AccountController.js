// const { User } = require("../db/models");
const mongoose = require("mongoose");
const { MailService } = require("../lib/services");
const helpers = require("../config/helpers");
const xx_qz_user = require("../db/models/xx_qz_user");
const { QzUserRegistration, QzUserProfile } = require("../db/models");
const bcrypt = require("bcrypt");


class AccountController {
  static async userSignup(req, res) {
    // skills work pending!
    try {
      const { user_name, email, password, mobile_no, first_name, last_name, countryCode, residential_address, description, education, experience, gender, dob, profile_summary, skills, marital_status, languages, agreement_terms_conditions, social_id, social_type } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user_id = mongoose.Types.ObjectId();
      const userRegistrationResult = await new QzUserRegistration({
        _id: user_id,
        user_name,
        email,
        password: hashedPassword,
        mobile_no
      });

      await userRegistrationResult.validate();

      const OTP = helpers.GenerateSixDigitCode();

      const userProfile = new QzUserProfile({
        user_id,
        first_name,
        last_name,
        profile_summary,
        countryCode,
        residential_address,
        description,
        education,
        experience,
        gender,
        dob,
        otp: OTP,
        description,
        languages,
        marital_status,
        agreement_terms_conditions,
        social_id,
        social_type,
        profile_pic: req.files?.length && req.files.length && req.files?.profile_pic ? req.files?.profile_pic[0].path : null,
        resume_file: req.files?.length && req.files.length && req.files?.resume_file ? req.files?.resume_file[0].path : null
      });

      await userProfile.validate();

      await userRegistrationResult.save();
      await userProfile.save();

      await MailService.sendMail(email, "OTP For Quazi App Registeration", OTP);

      const token = userProfile.generateAuthToken();

      let response = {
        status_code: 1,
        message: "Succesfully Signed Up",
        result: [{ ...userRegistrationResult, ...userProfile }]
      };

      helpers.SendSuccessResponseWithAuthHeader(res, token, response);

    }
    catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async userLogin(req, res) {

    let user = {};
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const { email, password } = req.body;

    if (!email) {

      helpers.SendErrorsAsResponse(null, res, "Please enter at-least one of email or mobile number or user name");

    }

    if (!Number.isNaN(Number.parseInt(email))) {
      user = await QzUserRegistration.findOne({ mobile_no: email });
    }
    else if (email.match(regexEmail)) {
      user = await QzUserRegistration.findOne({
        email: { $regex: email, $options: "i" },
      });
    }
    else {
      user = await QzUserRegistration.findOne({ user_name: email });
    }

    if (!user) {

      helpers.SendErrorsAsResponse(null, res, "Invalid UserName or Password.");
    }

    if (user.status === 2) {

      helpers.SendErrorsAsResponse(null, res, "The Provided User is Inactive");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      helpers.SendErrorsAsResponse(null, res, "Invalid UserName or Password.");

    const token = user.generateAuthToken();

    let response = {
      status_code: 1,
      message: "Succesfully Logged In",
      result: [user],
    };

    helpers.SendSuccessResponseWithAuthHeader(res, token, response);
  }

  static async socialLoginValidation(req, res) {
    const { email } = req.body;
    let user = "";

    try {
      if (!email) {

        helpers.SendErrorsAsResponse(null, res, "Email is Required");
      }
      user = await QzUserRegistration.findOne({
        email: { $regex: email, $options: "i" },
      });

      if (!user) {
        helpers.SendErrorsAsResponse(null, res, "The Email you Entered does not exists.");
      }
      if (user.status === 2)

        helpers.SendErrorsAsResponse(null, res, "The User Corresponding to the Given Email is Inactive");


      const token = user.generateAuthToken();

      let response = {
        status_code: 1,
        message: "Email is already Registered",
        result: [user],
      };

      helpers.SendSuccessResponseWithAuthHeader(res, token, response);

    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async emailVerification(req, res) {

    const { email, otp } = req.body;

    try {
      if (!email)
        helpers.SendErrorsAsResponse(null, res, "Email is Required");

      const userResult = await QzUserRegistration.findOne({
        email
      });

      const userProfileResult = await QzUserProfile.findOne({ user_id: userResult._id });

      if (!userProfileResult) {

        helpers.SendErrorsAsResponse(null, res, "The email you entered does not exist.");
      }
      if (userProfileResult.status === 2)

        helpers.SendErrorsAsResponse(null, res, "The user corresponding to the given email is inactive");

      let response = "";

      if (userProfileResult.otp && !userProfileResult.is_email_verified) {

        if (userProfileResult.otp === otp) {

          const { modifiedCount } = await userProfileResult.updateOne({ is_email_verified: 1 });

          if (modifiedCount) {
            response = {
              status_code: 1,
              message: "Your account has been verified!",
            };

            res
              .status(201)
              .send(response);
            return;
          }

          helpers.SendErrorsAsResponse(null, res, "Error occured while email verification, please try again!");
          return;
        }

        helpers.SendErrorsAsResponse(null, res, "Email verification failed, invalid OTP!");
      }

      helpers.SendErrorsAsResponse(null, res, "Account is already verified!");

    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async socialLogin(req, res) {
    try {
      const { mobile_no, email } = req.body;


      if (!email) {
        helpers.SendErrorsAsResponse(null, res, "email required");
      }

      if (!mobile_no) {
        helpers.SendErrorsAsResponse(null, res, "mobile number required");
      }

      let user = await QzUserRegistration.findOne({
        email: { $regex: email, $options: "i" },
      });

      if (user)
        helpers.SendErrorsAsResponse(null, res, "Email is Already Registered.");

      let mobile = await QzUserRegistration.findOne({
        mobile_no,
      });
      if (mobile)
        helpers.SendErrorsAsResponse(null, res, "Mobile Number is Already Registered.");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user_id = mongoose.Types.ObjectId();
      const user = await new QzUserRegistration({
        _id: user_id,
        user_name,
        email,
        password: hashedPassword,
        mobile_no
      });

      await user.validate();

      const OTP = helpers.GenerateSixDigitCode();

      let userProfile = '';
      if (!req.files) {
        userProfile = new QzUserProfile({
          user_id: user._id,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          countryCode: req.body.countryCode,
          social_id: req.body.social_id,
          social_type: req.body.social_type,
          otp: OTP
        });
      } else {
        userProfile = new QzUserProfile({
          user_id: user._id,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          countryCode: req.body.countryCode,
          social_id: req.body.social_id,
          social_type: req.body.social_type,
          profile_pic: req.files.profile_pic[0].path,
          otp: OTP
        });
      }

      await userProfile.validate();

      await user.save();
      await userProfile.save();

      const token = user.generateAuthToken();

      let response = {
        status_code: 1,
        message: "User is registered successfully!",
        result: [user],
      };

      helpers.SendSuccessResponseWithAuthHeader(res, token, response);
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async profileUpdate(req, res) {
    try {
      if (Object.keys(req.files).length === 0) {
        const user = await xx_qz_user.findByIdAndUpdate(
          req.params.id,
          {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            countryCode: req.body.countryCode,
            mobile_no: req.body.mobile_no,
            address: req.body.address,
            user_name: req.body.user_name,
            description: req.body.description,
            education: req.body.education,
            experience: req.body.experience,
            gender: req.body.gender,
            dob: req.body.dob,
            password: req.body.password,
            email: req.body.email,
            summary: req.body.summary,
            skill_id: req.body.skill_id,
            maritial_status: req.body.maritial_status,
            languages: req.body.languages,
            social_id: req.body.social_id,
            social_type: req.body.social_type,
            project_undertaken: req.body.project_undertaken,
            updated: new Date(),
          },
          { new: true }
        );

        if (!user)
          return res.status(404).send({
            status_code: 4,
            message: "The user with the given ID was not found.",
            result: [],
          });

        let response = {
          status_code: 1,
          message: "User Profile Succesfully Updated",
          result: [user],
        };

        res.status(200).send(response);
      } else {
        const user = await xx_qz_user.findByIdAndUpdate(
          req.params.id,
          {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            countryCode: req.body.countryCode,
            mobile_no: req.body.mobile_no,
            address: req.body.address,
            user_name: req.body.user_name,
            description: req.body.description,
            education: req.body.education,
            experience: req.body.experience,
            gender: req.body.gender,
            dob: req.body.dob,
            password: req.body.password,
            email: req.body.email,
            summary: req.body.summary,
            skill_id: req.body.skill_id,
            maritial_status: req.body.maritial_status,
            languages: req.body.languages,
            social_id: req.body.social_id,
            social_type: req.body.social_type,
            project_undertaken: req.body.project_undertaken,
            image: req.files.image[0].path,
            resume: req.files.resume[0].path,
            updated: new Date(),
          },
          { new: true }
        );

        if (!user)
          return res.status(404).send({
            status_code: 4,
            message: "The user with the given ID was not found.",
            result: [],
          });

        let response = {
          status_code: 1,
          message: "User Profile Succesfully Updated",
          result: [user],
        };

        res.status(200).send(response);
      }
    } catch (err) {
      res
        .status(400)
        .send({ status_code: 2, message: err.message, result: [] });
      console.log("user Profile update", err.message);
    }
  }

  static async details(req, res) {
    try {
      const user = await xx_qz_user.findById(req.params.id);
      if (!user)
        return res.status(404).send({
          status_code: 4,
          message: "The user with the given ID was not found.",
          result: [],
        });
      let response = {
        status_code: 1,
        message: "User Details Successfully Fetched",
        result: [user],
      };

      res.status(200).send(response);
    } catch (err) {
      res.status(400).send({ status_code: 2, message: err.message, result: [] });
      console.log("user Get details by id", err.message);
    }
  }

  static async forgotPassword(req, res) {
    try {
      let password = req.body.newPassword;
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const id = await xx_qz_user.findOne({ email: req.body.email });
      if (!id)
        return res.status(400).send({
          status_code: 2,
          message: "The Email Provided is Invalid",
          result: [],
        });

      const user = await xx_qz_user.findByIdAndUpdate(
        id._id,
        {
          password: password,
          updated: new Date(),
        },
        { new: true }
      );

      let response = {
        status_code: 1,
        message: "Password Changed Successfully",
        result: []
      };

      res.status(200).send(response);
    } catch (err) {
      res.status(400).send({ status_code: 2, message: err.message, result: [] });
      console.log("forgot password", err.message);
    }
  }

  static async changePassword(req, res) {
    try {
      let password = req.body.newPassword;
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const id = await xx_qz_user.findById(req.params.id);
      if (!id)
        return res.status(400).send({
          status_code: 2,
          message: "The ID Provided is Invalid",
          result: [],
        });

      const validPassword = await bcrypt.compare(
        req.body.oldPassword,
        id.password
      );
      if (!validPassword)
        return res.status(400).send({
          status_code: 3,
          message: "Invalid Old Password.",
          result: [],
        });

      const user = await xx_qz_user.findByIdAndUpdate(
        req.params.id,
        {
          password: password,
          updated: new Date(),
        },
        { new: true }
      );

      if (!user)
        return res.status(404).send({
          status_code: 2,
          message: "The ID Provided is Invalid",
          result: [],
        });

      let response = {
        status_code: 1,
        message: "Password Changed Successfully",
        result: [user],
      };

      res.status(200).send(response);
    } catch (err) {
      res.status(400).send({ status_code: 2, message: err.message, result: [] });
      console.log("change password", err.message);
    }
  }

  static async sendOtp(req, res) {
    try {

      const { email } = req.body;
      let OTP = helpers.GenerateSixDigitCode();

      const user = await xx_qz_user.find({ email }).select({ _id: 1 });
      if (!user)
        return res.status(404).send({
          status_code: 4,
          message: "The user with the given Email was not found.",
          result: [],
        });
      let response;

      MailService.sendMail(email, "OTP For Quazi", OTP).then(resp => {

        console.log('Email sent successfully');
        response = {
          status_code: 1,
          message: "OTP Sent Successfully",
          result: [],
        };
        res.status(200).send(response);

      }).catch(err)
      {
        console.log('Failed to send email');
        console.error(err);
        response = {
          status_code: 3,
          message: "Failed to Send OTP",
          result: [],
        };
        res.status(200).send(response);
      }

    } catch (err) {
      res.status(400).send({ status_code: 2, message: err.message, result: [] });
      console.log("resend otp", err.message);
    }
  }

  static async changeStatus(req, res) {
    try {
      if (
        req.body.status == null ||
        req.body.status == "" ||
        req.body.status == undefined
      ) {
        return res.status(404).send({
          status_code: 2,
          message: "Please Provide a Valid Argument in Body",
          result: [],
        });
      }
      let status = req.body.status;
      status = status.toLowerCase();
      const user = await xx_qz_user.findByIdAndUpdate(
        req.params.id,
        {
          status: status,
          updated: new Date(),
        },
        { new: true }
      );

      if (!user)
        return res.status(404).send({
          status_code: 2,
          message: "The id Provided is Invalid",
          result: [],
        });

      let response = {
        status_code: 1,
        message: "Status Changed Successfully",
        result: [
          {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            countryCode: user.countryCode,
            mobile_no: user.mobile_no,
            address: user.address,
            countryOfBirth: user.countryOfBirth,
            cityOfBirth: user.cityOfBirth,
            roleID: user.roleID,
            status: user.status,
            image: user.image,
            dob: user.dob,
            gender: user.gender,
            created: user.created,
            updated: user.updated,
          },
        ],
      };

      res.status(200).send(response);
    } catch (err) {
      res.status(400).send({ status_code: 2, message: err.message, result: [] });
      console.log("change status", err.message);
    }
  }

}

module.exports = AccountController;
