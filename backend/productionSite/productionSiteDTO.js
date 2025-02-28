// productionSiteDTO.js
class productionSiteDTO {
    constructor({annualProduction_L, banking, capacity_MW, companyId, htscNo, injectionVoltage_KV, location, name, productionSiteId, status, type}) {
      this.companyId = companyId;
      this.productionSiteId = productionSiteId;
      this.name = name;
      this.location = location, 
      this.type = type, 
      this.banking = banking,
      this.capacity_MW = capacity_MW,
      this.annualProduction_L = annualProduction_L,
      this.htscNo = htscNo,
      this.injectionVoltage_KV = injectionVoltage_KV,
      this.status = status
    }
  }
  
  module.exports = productionSiteDTO;
  