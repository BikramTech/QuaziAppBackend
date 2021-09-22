var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { CompanyController } = require('../../controllers');
const { AddCompanyTypeValidator, UpdateCompanyTypeValidator, GetCompanyTypeByJobTypeIdValidator, DeleteCompanyTypeValidator } = require("../../lib/validators/companyTypeValidator");

router.post('/AddCompanyType', [Authorize, AddCompanyTypeValidator], CompanyController.addCompanyType);
router.get('/GetCompanyTypeByCompanyTypeId/:id', [Authorize, GetCompanyTypeByJobTypeIdValidator], CompanyController.getCompanyTypeByCompanyTypeId)
router.get('/GetActiveCompanyTypesList', Authorize, CompanyController.getActiveCompanyTypesList)
router.get('/GetCompanyTypesList', Authorize, CompanyController.getCompanyTypesList)
router.post('/UpdateCompanyType/:id', [Authorize, UpdateCompanyTypeValidator], CompanyController.updateCompanyType)
router.delete('/DeleteCompanyType/:id', [Authorize, DeleteCompanyTypeValidator], CompanyController.deleteCompanyType)
router.get('/GetCompaniesWithActiveJobs', Authorize, CompanyController.getActiveCompaniesWithJobsCount)
router.get('/GetActiveJobsByCompanyId/:id', Authorize, CompanyController.getActiveJobsByCompanyId)

module.exports = router
