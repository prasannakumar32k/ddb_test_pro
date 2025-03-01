const express = require('express');
const router = express.Router();
const productionController = require('./productionController');

// Production unit routes
router.get('/', productionController.getAllProductions);
router.get('/:companyId/:productionSiteId', productionController.getProductionHistory);
router.post('/', productionController.createProduction);
router.put('/:companyId/:productionSiteId/:month', productionController.updateProduction);
router.delete('/:companyId/:productionSiteId/:month', productionController.deleteProduction);

module.exports = router;
