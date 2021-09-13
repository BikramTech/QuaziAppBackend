var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { SkillsController } = require('../../controllers');

router.post('/AddKeySkill', SkillsController.addKeySkill)
router.get('/GetKeySkillById/:id', SkillsController.getKeySkillById)
router.get('/GetKeySkills', SkillsController.getKeySkills)
router.post('/UpdateKeySkill/:id', SkillsController.updateKeySkill)
router.delete('/DeleteKeySkill/:id', SkillsController.deleteKeySkill)

module.exports = router
