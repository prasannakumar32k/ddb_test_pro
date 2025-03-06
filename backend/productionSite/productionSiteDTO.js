// productionSiteDTO.js
class productionSiteDTO {
  constructor({
    annualProduction_L,
    banking,
    capacity_MW,
    companyId,
    htscNo,
    injectionVoltage_KV,
    location,
    name,
    productionSiteId,
    status,
    type
  }) {
    this.companyId = parseInt(companyId);
    this.productionSiteId = parseInt(productionSiteId);
    this.name = name;
    this.location = location;
    this.type = type;
    this.banking = parseInt(banking || 0);
    this.capacity_MW = parseFloat(capacity_MW || 0);
    this.annualProduction_L = parseFloat(annualProduction_L || 0);
    this.htscNo = htscNo;
    this.injectionVoltage_KV = parseFloat(injectionVoltage_KV || 0);
    this.status = status || 'Active';
  }

  toJSON() {
    return {
      companyId: this.companyId,
      productionSiteId: this.productionSiteId,
      name: this.name,
      location: this.location,
      type: this.type,
      banking: this.banking,
      capacity_MW: this.capacity_MW,
      annualProduction_L: this.annualProduction_L,
      htscNo: this.htscNo,
      injectionVoltage_KV: this.injectionVoltage_KV,
      status: this.status
    };
  }
}

module.exports = productionSiteDTO;
