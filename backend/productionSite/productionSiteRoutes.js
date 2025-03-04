const express = require('express');
const router = express.Router();
const productionSiteController = require('./productionSiteController');

// GET /api/production-site
router.get('/', productionSiteController.getAllProductionSites);

// GET /api/production-site/:companyId/:productionSiteId
router.get('/:companyId/:productionSiteId', productionSiteController.getProductionSite);

// POST /api/production-site
router.post('/', productionSiteController.createProductionSite);

// PUT /api/production-site/:companyId/:productionSiteId
router.put('/:companyId/:productionSiteId', productionSiteController.updateProductionSite);

// DELETE /api/production-site/:companyId/:productionSiteId
router.delete('/:companyId/:productionSiteId', productionSiteController.deleteProductionSite);

module.exports = router;
