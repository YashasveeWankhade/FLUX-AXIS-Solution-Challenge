export class Shipment {
  constructor(data) {
    this.id = data.id;
    this.origin = data.origin;
    this.destination = data.destination;
    this.carrier = data.carrier || 'Unknown';
    this.cargoType = data.cargoType || 'General';
    this.status = data.status || 'STABLE';
    this.riskScore = data.riskScore || 0.12;
    this.eta = data.eta || new Date().toISOString();
    this.value = data.value || '$0';
    this.progress = data.progress || 0;
    this.path = data.path || [];
    this.containers = data.containers || 0;
    this.weight = data.weight || '0t';
  }

  updateRisk(newScore) {
    this.riskScore = Math.min(1.0, Math.max(0, newScore));
    if (this.riskScore > 0.75) this.status = 'CRITICAL';
    else if (this.riskScore > 0.4) this.status = 'WARNING';
    else this.status = 'STABLE';
  }

  get drs() {
    return Math.round(this.riskScore * 100);
  }

  get etaFormatted() {
    try {
      return new Date(this.eta).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return ' - '; }
  }
}

export class Alert {
  constructor(data) {
    this.id = `ALT-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    this.shipmentId = data.shipmentId;
    this.severity = data.severity;
    this.message = data.message;
    this.timestamp = new Date().toISOString();
    this.resolved = false;
  }
}

export class Port {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.coords = data.coords;
    this.congestion = data.congestion || 0.15;
    this.vessels = data.vessels || 0;
    this.region = data.region || '';
    this.throughput = data.throughput || 0;
    this.weather = data.weather || 'Clear';
    this.berths = data.berths || 10;
  }

  get congestionLabel() {
    if (this.congestion > 0.7) return 'CRITICAL';
    if (this.congestion > 0.4) return 'ELEVATED';
    return 'NOMINAL';
  }
}

export class Integration {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.status = data.status || 'ACTIVE';
    this.latency = data.latency || 0;
    this.type = data.type || 'UNKNOWN';
  }
}
