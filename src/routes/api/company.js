var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { CompanyController } = require('../../controllers');

router.post('/AddCompanyType', Authorize, CompanyController.addCompanyType);
router.get('/GetCompanyTypeByCompanyTypeId/:id', Authorize, CompanyController.getCompanyTypeByCompanyTypeId)
router.get('/GetActiveCompanyTypesList', Authorize, CompanyController.getActiveCompanyTypesList)
router.get('/GetCompanyTypesList', Authorize, CompanyController.getCompanyTypesList)
router.post('/UpdateCompanyType/:id', Authorize, CompanyController.updateCompanyType)
router.delete('/DeleteCompanyType/:id', Authorize, CompanyController.deleteCompanyType)

module.exports = router
