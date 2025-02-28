const express = require('express');
<<<<<<< HEAD
const productionSiteControllers = require("./productionSiteControllers");
const router = express.Router();

router.post('/', productionSiteControllers.createProductionSite);
router.get('/', productionSiteControllers.getAllProductionSites);
router.get('/:companyId/:productionSiteId', productionSiteControllers.getProductionSite);
router.put('/:companyId/:productionSiteId', productionSiteControllers.updateProductionSite);
router.delete('/:companyId/:productionSiteId', productionSiteControllers.deleteProductionSite);
=======
const router = express.Router();
const productionSiteController = require('./productionSiteControllers');
const validateSite = require('../middleware/validateSite');

// Remove '/production-units' prefix since it's handled in server.js
router.get('/', productionSiteController.getAllProductionSites);
router.get('/:companyId/:productionSiteId', productionSiteController.getProductionSiteById);
router.post('/', validateSite, productionSiteController.createProductionSite);
router.put('/:companyId/:productionSiteId', validateSite, productionSiteController.updateProductionSite);
router.delete('/:companyId/:productionSiteId', productionSiteController.deleteProductionSite);
>>>>>>> fbc1dea (Initial commit: Production site management application)

module.exports = router;
