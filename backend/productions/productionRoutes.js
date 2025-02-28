const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const productionControllers = require('./productionControllers');

router.get('/', productionControllers.getAllProductions);
router.get('/:companyId/:productionSiteId', productionControllers.getProductionHistory);
router.post('/', productionControllers.createProduction);
router.put('/:companyId/:productionSiteId/:mmYY', productionControllers.updateProduction);
router.delete('/:companyId/:productionSiteId/:mmYY', productionControllers.deleteProduction);
=======
const productionController = require('./productionControllers');

// Production unit routes
router.get('/:companyId/:productionSiteId', productionController.getProductionHistory);
router.get('/', productionController.getAllProductions);
router.post('/', productionController.createProduction);
router.put('/:companyId/:productionSiteId/:month', productionController.updateProduction);
router.delete('/:companyId/:productionSiteId/:month', productionController.deleteProduction);
>>>>>>> fbc1dea (Initial commit: Production site management application)

module.exports = router;
