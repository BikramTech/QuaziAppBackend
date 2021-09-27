var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { UserEducationController } = require('../../controllers');
const { AddUserEducationValidator, IdValidator } = require("../../lib/validators/userEducationValidator");

router.post('/AddUserEducation', [AddUserEducationValidator, Authorize], UserEducationController.AddUserEducation)
router.get('/GetUserEducationByUserId', Authorize, UserEducationController.GetUserEducationByUserId)
router.get('/GetUserEducations', Authorize, UserEducationController.GetUserEducations)
router.post('/UpdateUserEducation/:id', [IdValidator, Authorize], UserEducationController.UpdateUserEducation)
router.delete('/DeleteUserEducation/:id', [IdValidator, Authorize], UserEducationController.DeleteUserEducation)

module.exports = router
