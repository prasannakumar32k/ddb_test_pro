const express = require('express');
const router = express.Router();
const productionSiteController = require('./productionSiteController');

// Production site routes
router.post('/', productionSiteController.createProductionSite);
router.get('/', productionSiteController.getAllProductionSites);
router.get('/:companyId/:productionSiteId', productionSiteController.getProductionSite);
router.put('/:companyId/:productionSiteId', productionSiteController.updateProductionSite);
router.delete('/:companyId/:productionSiteId', productionSiteController.deleteProductionSite);

module.exports = router;
