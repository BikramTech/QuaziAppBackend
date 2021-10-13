const QzUserRegistration = require("./users/Qz_User_Registration");
const QzUserProfile = require("./users/Qz_User_Profile");
const QzKeySkills = require("./keyskills/Qz_Key_Skills");
const QzUserEmployment = require("./users/Qz_User_Employment");
const QzUserProjects = require("./users/Qz_User_Projects");
const QzUserCertification = require("./users/Qz_User_Certification");
const QzUserApplications = require("./users/Qz_User_Applications");
const QzApplicationStatus = require("./applications/Qz_Application_Status");

const QzCrUserRegistration = require("./corporate-users/Qz_Cr_User_Registration");
const QzCrUserProfile = require("./corporate-users/Qz_Cr_User_Profile");

const QzCompanyTypes = require("./companies/Qz_Company_Types");

const QzJobTypes = require("./jobs/Qz_Job_Types");

const QzEmployment = require("./employments/Qz_Employment");

const QzUserEducation = require("./users/Qz_User_Education");
const QzTermsConditions = require("./termsAndConditions/Qz_Terms_Conditions");
const QzPaymentPlans = require("./payment-plans/Qz_Payment_Plans");


module.exports = { QzUserRegistration, QzUserProfile, QzKeySkills, QzUserEmployment, QzUserProjects, QzUserCertification, QzUserApplications, QzApplicationStatus, QzCrUserRegistration, QzCompanyTypes, QzCrUserProfile, QzJobTypes, QzEmployment, QzUserEducation, QzTermsConditions, QzPaymentPlans };
