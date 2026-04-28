export class Shipment {
  constructor(data) {
    this.id = data.id;
    this.origin = data.origin;
    this.destination = data.destination;
    this.carrier = data.carrier;
    this.status = data.status || 'STABLE';
    this.riskScore = data.riskScore || 0.12;
    this.eta = data.eta;
    this.value = data.value;
    this.progress = data.progress || 0;
    this.path = data.path || [];
  }

  updateRisk(newScore) {
    this.riskScore = Math.min(1.0, Math.max(0, newScore));
    if (this.riskScore > 0.8) this.status = 'CRITICAL';
    else if (this.riskScore > 0.4) this.status = 'WARNING';
    else this.status = 'STABLE';
  }
}

export class Alert {
  constructor(data) {
    this.id = `ALT-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    this.shipmentId = data.shipmentId;
    this.severity = data.severity;
    this.message = data.message;
    this.timestamp = new Date().toISOString();
  }
}

export class Port {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.coords = data.coords;
    this.congestion = data.congestion || 0.15;
    this.vessels = data.vessels || 0;
  }
}

export class Integration {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.status = data.status || 'ACTIVE';
    this.latency = data.latency || 0;
  }
}
