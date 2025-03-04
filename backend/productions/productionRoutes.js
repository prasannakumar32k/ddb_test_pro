const express = require('express');
const router = express.Router();
const productionController = require('./productionController');

// GET /api/production-unit
router.get('/', productionController.getAllProductions);

// GET /api/production-unit/:companyId/:productionSiteId
router.get('/:companyId/:productionSiteId', productionController.getProductionHistory);

// GET /api/production-unit/:companyId/:productionSiteId/:month
router.get('/:companyId/:productionSiteId/:month', productionController.checkExistingProduction);

// POST /api/production-unit/:companyId/:productionSiteId
router.post('/:companyId/:productionSiteId', productionController.createProduction);

// PUT /api/production-unit/:companyId/:productionSiteId/:month
router.put('/:companyId/:productionSiteId/:month', productionController.updateProduction);

// DELETE /api/production-unit/:companyId/:productionSiteId/:month
router.delete('/:companyId/:productionSiteId/:month', productionController.deleteProduction);

module.exports = router;
