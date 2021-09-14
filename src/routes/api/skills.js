var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { SkillsController } = require('../../controllers');
const { AddKeySkillRuleValidator, GetKeySkillByIdRuleValidator, UpdateKeySkillValidator, DeleteKeySkillRuleValidator } = require("../../lib/validators/keySkillValidator")

router.post('/AddKeySkill', [Authorize, AddKeySkillRuleValidator], SkillsController.addKeySkill)
router.get('/GetKeySkillById/:id', [Authorize, GetKeySkillByIdRuleValidator], SkillsController.getKeySkillById)
router.get('/GetKeySkills', Authorize, SkillsController.getKeySkills)
router.post('/UpdateKeySkill/:id', [Authorize, UpdateKeySkillValidator], SkillsController.updateKeySkill)
router.delete('/DeleteKeySkill/:id', [Authorize, DeleteKeySkillRuleValidator], SkillsController.deleteKeySkill)

module.exports = router
