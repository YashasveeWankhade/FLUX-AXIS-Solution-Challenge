import { create } from 'zustand';
import { Shipment, Port, Alert } from '../domain/models';

const CARRIERS = ['Maersk', 'MSC', 'COSCO', 'Evergreen', 'Hapag-Lloyd', 'ONE', 'CMA CGM', 'Yang Ming'];
const ROUTES = [
  { origin: { id: 'SHA', name: 'Shanghai', coords: { lat: 31.2, lng: 121.5 } }, destination: { id: 'LAX', name: 'Los Angeles', coords: { lat: 33.7, lng: -118.2 } } },
  { origin: { id: 'SHA', name: 'Shanghai', coords: { lat: 31.2, lng: 121.5 } }, destination: { id: 'RTM', name: 'Rotterdam', coords: { lat: 51.9, lng: 4.4 } } },
  { origin: { id: 'SIN', name: 'Singapore', coords: { lat: 1.3, lng: 103.8 } }, destination: { id: 'DXB', name: 'Dubai', coords: { lat: 25.2, lng: 55.3 } } },
  { origin: { id: 'RTM', name: 'Rotterdam', coords: { lat: 51.9, lng: 4.4 } }, destination: { id: 'NYC', name: 'New York', coords: { lat: 40.7, lng: -74.0 } } },
  { origin: { id: 'DXB', name: 'Dubai', coords: { lat: 25.2, lng: 55.3 } }, destination: { id: 'MUM', name: 'Mumbai', coords: { lat: 18.9, lng: 72.8 } } },
  { origin: { id: 'TYO', name: 'Tokyo', coords: { lat: 35.6, lng: 139.7 } }, destination: { id: 'SHA', name: 'Shanghai', coords: { lat: 31.2, lng: 121.5 } } },
  { origin: { id: 'LAX', name: 'Los Angeles', coords: { lat: 33.7, lng: -118.2 } }, destination: { id: 'SYD', name: 'Sydney', coords: { lat: -33.8, lng: 151.2 } } },
  { origin: { id: 'SYD', name: 'Sydney', coords: { lat: -33.8, lng: 151.2 } }, destination: { id: 'TYO', name: 'Tokyo', coords: { lat: 35.6, lng: 139.7 } } },
];

const CARGO_TYPES = ['Electronics', 'Automotive', 'Pharmaceuticals', 'Chemicals', 'Textiles', 'Machinery', 'Food & Beverage', 'Aerospace'];

const DISRUPTION_EVENTS = [
  { type: 'WEATHER', message: 'Tropical cyclone alert  -  rerouting advised', severity: 'CRITICAL' },
  { type: 'PORT', message: 'Berth congestion  -  vessel queue >10 ships', severity: 'WARNING' },
  { type: 'CUSTOMS', message: 'Customs delay  -  documentation review', severity: 'WARNING' },
  { type: 'GEOPOLITICAL', message: 'Sanctions update  -  lane restriction active', severity: 'CRITICAL' },
  { type: 'MECHANICAL', message: 'Vessel mechanical fault  -  ETA +72h', severity: 'CRITICAL' },
  { type: 'LABOUR', message: 'Port strike action  -  partial ops', severity: 'WARNING' },
];

const generatePath = (start, end) => {
  const steps = 50;
  return Array.from({ length: steps + 1 }, (_, i) => ({
    lat: start.lat + (end.lat - start.lat) * (i / steps),
    lng: start.lng + (end.lng - start.lng) * (i / steps)
  }));
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const useAppStore = create((set, get) => ({
  // -- Core Data ------------------------------------------------------------
  shipments: [],
  ports: [],
  alerts: [],
  carriers: [],
  events: [],
  integrations: [],
  systemStatus: 'NOMINAL',
  systemUptime: 99.97,
  lastSync: new Date().toISOString(),

  // -- UI State -------------------------------------------------------------
  searchQuery: '',
  profileOpen: false,
  activeChatShipmentId: null,
  chatMessages: [],
  notifications: [],

  // -- Global Settings ------------------------------------------------------
  settings: {
    name: 'D. Devi Singh',
    email: 'devi.singh@fluxaxis.io',
    role: 'Senior Logistics Operator',
    timezone: 'UTC+5:30',
    currency: 'USD',
    language: 'English',
    alertSound: true,
    emailAlerts: true,
    smsAlerts: false,
    criticalOnly: false,
    lightTheme: true,
    compactView: false,
    animations: true,
    twoFactor: true,
    sessionTimeout: '30',
    accentColor: '#3F6C8F',
    avatarInitial: 'D',
    webhookUrl: '',
    apiKey: 'flx_sk_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890',
  },

  // -- Selectors -------------------------------------------------------------
  get criticalCount() { return get().alerts.filter(a => a.severity === 'CRITICAL').length; },

  // -- Actions ---------------------------------------------------------------
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleProfile: () => set(s => ({ profileOpen: !s.profileOpen })),
  closeProfile: () => set({ profileOpen: false }),

  updateSettings: (newSettings) => set(s => ({
    settings: { ...s.settings, ...newSettings }
  })),

  addNotification: (message, type = 'info') => {
    const id = `NTF-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    set(state => ({
      notifications: [
        { id, message, type, timestamp: new Date().toISOString() },
        ...state.notifications,
      ].slice(0, 5),
    }));
    return id;
  },

  dismissNotification: (id) => set(state => ({
    notifications: state.notifications.filter(note => note.id !== id),
  })),

  openChat: (shipmentId) => set({ activeChatShipmentId: shipmentId }),
  closeChat: () => set({ activeChatShipmentId: null, chatMessages: [] }),
  sendChatMessage: (text) => {
    const msg = { id: Date.now(), author: 'OPERATOR_082', text, ts: new Date().toLocaleTimeString() };
    const botReply = {
      id: Date.now() + 1,
      author: 'FLUXAXIS_AI',
      text: `Acknowledged. Analyzing ${get().activeChatShipmentId}. Risk assessment is in progress. ETA confidence: ${Math.floor(rand(78, 99))}%.`,
      ts: new Date().toLocaleTimeString()
    };
    set(s => ({ chatMessages: [...s.chatMessages, msg, botReply] }));
  },

  resolveAlert: (id) => {
    const alert = get().alerts.find(a => a.id === id);
    set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }));
    if (alert) get().addNotification(`Resolved alert for ${alert.shipmentId}`, 'success');
  },

  rescheduleSession: (sessionId) => {
    get().addNotification(`Session ${sessionId} rescheduled`, 'success');
  },

  executeReroute: (shipmentId, routeId) => {
    const shipment = get().shipments.find(s => s.id === shipmentId);
    set(state => ({
      shipments: state.shipments.map(s =>
        s.id === shipmentId ? new Shipment({ ...s, riskScore: s.riskScore * 0.4, status: 'STABLE' }) : s
      ),
      alerts: state.alerts.filter(a => a.shipmentId !== shipmentId),
    }));
    if (shipment) get().addNotification(`Reroute ${routeId} submitted for ${shipment.id}`, 'success');
  },

  createAlert: ({ shipmentId, severity = 'WARNING', message }) => {
    const alert = new Alert({ shipmentId, severity, message });
    set(state => ({ alerts: [alert, ...state.alerts].slice(0, 25) }));
    get().addNotification(`New ${severity.toLowerCase()} alert created for ${shipmentId}`, severity === 'CRITICAL' ? 'danger' : 'warning');
    return alert.id;
  },

  requestBerthAllocation: (portId) => {
    set(state => ({
      ports: state.ports.map(port =>
        port.id === portId
          ? new Port({ ...port, congestion: Math.max(0.05, port.congestion - 0.06) })
          : port
      ),
    }));
    get().addNotification(`Berth allocation request sent for ${portId}`, 'success');
  },

  addIntegration: () => {
    const count = get().integrations.length + 1;
    const integration = {
      id: `I${count}`,
      name: `Webhook Listener ${count}`,
      status: 'INACTIVE',
      latency: 0,
      lastPing: 'pending',
      type: 'CUSTOM',
      records: '0',
      uptime: 0,
    };
    set(state => ({ integrations: [...state.integrations, integration] }));
    get().addNotification(`${integration.name} added`, 'success');
    return integration.id;
  },

  enableIntegration: (id) => {
    set(state => ({
      integrations: state.integrations.map(intg =>
        intg.id === id
          ? { ...intg, status: 'ACTIVE', latency: intg.latency || Math.floor(rand(40, 140)), lastPing: 'now', uptime: intg.uptime || 99.9 }
          : intg
      ),
    }));
    const integration = get().integrations.find(intg => intg.id === id);
    if (integration) get().addNotification(`${integration.name} enabled`, 'success');
  },

  // -- Initialization --------------------------------------------------------
  initializeSystem: () => {
    const mockPorts = [
      new Port({ id: 'SHA', name: 'Shanghai',      coords: { lat: 31.2,  lng: 121.5 }, congestion: 0.42, vessels: 124, region: 'Asia Pacific',  throughput: 47_230, weather: 'Clear',     berths: 42 }),
      new Port({ id: 'LAX', name: 'Los Angeles',   coords: { lat: 33.7,  lng: -118.2 }, congestion: 0.82, vessels: 45,  region: 'Americas',      throughput: 21_800, weather: 'Fog',       berths: 18 }),
      new Port({ id: 'RTM', name: 'Rotterdam',     coords: { lat: 51.9,  lng: 4.4  }, congestion: 0.25, vessels: 88,  region: 'Europe',         throughput: 33_500, weather: 'Storm',     berths: 35 }),
      new Port({ id: 'SIN', name: 'Singapore',     coords: { lat: 1.3,   lng: 103.8 }, congestion: 0.15, vessels: 210, region: 'Asia Pacific',  throughput: 39_100, weather: 'Clear',     berths: 55 }),
      new Port({ id: 'DXB', name: 'Dubai',         coords: { lat: 25.2,  lng: 55.3  }, congestion: 0.61, vessels: 62,  region: 'Middle East',   throughput: 18_900, weather: 'Clear',     berths: 22 }),
      new Port({ id: 'TYO', name: 'Tokyo',         coords: { lat: 35.6,  lng: 139.7 }, congestion: 0.33, vessels: 77,  region: 'Asia Pacific',  throughput: 24_600, weather: 'Cloudy',    berths: 28 }),
      new Port({ id: 'NYC', name: 'New York',      coords: { lat: 40.7,  lng: -74.0 }, congestion: 0.44, vessels: 55,  region: 'Americas',      throughput: 19_200, weather: 'Clear',     berths: 20 }),
      new Port({ id: 'MUM', name: 'Mumbai',        coords: { lat: 18.9,  lng: 72.8  }, congestion: 0.55, vessels: 40,  region: 'South Asia',    throughput: 12_400, weather: 'Humid',     berths: 15 }),
      new Port({ id: 'SYD', name: 'Sydney',        coords: { lat: -33.8, lng: 151.2 }, congestion: 0.22, vessels: 30,  region: 'Oceania',       throughput: 8_700,  weather: 'Clear',     berths: 12 }),
    ];

    const mockShipments = ROUTES.flatMap(route =>
      Array.from({ length: 5 }, (_, i) => {
        const risk = rand(0.02, 0.35);
        const s = new Shipment({
          id: `FLX-${1000 + ROUTES.indexOf(route) * 5 + i}`,
          origin: route.origin,
          destination: route.destination,
          carrier: pick(CARRIERS),
          cargoType: pick(CARGO_TYPES),
          progress: rand(0.05, 0.95),
          riskScore: risk,
          value: `$${rand(0.4, 5.2).toFixed(1)}M`,
          eta: new Date(Date.now() + rand(3, 30) * 86400000).toISOString(),
          path: generatePath(route.origin.coords, route.destination.coords),
          containers: Math.floor(rand(120, 2400)),
          weight: `${Math.floor(rand(400, 18000))}t`,
        });
        s.updateRisk(risk);
        return s;
      })
    );

    const mockCarriers = CARRIERS.map((name, i) => ({
      id: `C${i + 1}`,
      name,
      fleet: Math.floor(rand(80, 820)),
      onTime: parseFloat(rand(84, 99).toFixed(1)),
      avgDelay: parseFloat(rand(2, 28).toFixed(1)),
      activeShipments: Math.floor(rand(12, 340)),
      rating: parseFloat(rand(3.2, 4.9).toFixed(1)),
      tier: rand(0, 1) > 0.6 ? 'PREFERRED' : 'STANDARD',
      region: pick(['Global', 'Asia Pacific', 'Europe', 'Americas', 'Middle East']),
    }));

    const mockEvents = [
      { id: 'EV001', type: 'WEATHER', severity: 'CRITICAL', title: 'Typhoon Koinu', region: 'Western Pacific', impact: 'SHA  to  LAX lane disrupted', ts: '14:22 UTC', affectedShipments: 18, status: 'ACTIVE' },
      { id: 'EV002', type: 'GEOPOLITICAL', severity: 'CRITICAL', title: 'Suez Canal congestion', region: 'Red Sea', impact: '22 vessels queued', ts: '13:58 UTC', affectedShipments: 11, status: 'ACTIVE' },
      { id: 'EV003', type: 'PORT', severity: 'WARNING', title: 'North Sea storm', region: 'Northern Europe', impact: 'RTM crane ops suspended', ts: '12:41 UTC', affectedShipments: 7, status: 'MONITORING' },
      { id: 'EV004', type: 'LABOUR', severity: 'WARNING', title: 'LA Dockers strike', region: 'Americas West', impact: 'LAX terminal reduced 40%', ts: '11:15 UTC', affectedShipments: 24, status: 'MONITORING' },
      { id: 'EV005', type: 'CUSTOMS', severity: 'INFO', title: 'India tariff update', region: 'South Asia', impact: 'New phytosanitary docs required', ts: '09:30 UTC', affectedShipments: 3, status: 'RESOLVED' },
      { id: 'EV006', type: 'MECHANICAL', severity: 'CRITICAL', title: 'COSCO vessel fault', region: 'Pacific', impact: 'FLX-1012 ETA +72h', ts: '08:00 UTC', affectedShipments: 1, status: 'ACTIVE' },
    ];

    const mockIntegrations = [
      { id: 'I1', name: 'AIS Vessel Tracker', status: 'ACTIVE', latency: 42, lastPing: '2s ago', type: 'MARITIME', records: '847K', uptime: 99.98 },
      { id: 'I2', name: 'NOAA Weather API', status: 'ACTIVE', latency: 88, lastPing: '5s ago', type: 'WEATHER', records: '2.1M', uptime: 99.95 },
      { id: 'I3', name: 'Customs Broker EDI', status: 'DEGRADED', latency: 412, lastPing: '14s ago', type: 'CUSTOMS', records: '340K', uptime: 97.22 },
      { id: 'I4', name: 'ERP SAP S/4 HANA', status: 'ACTIVE', latency: 64, lastPing: '1s ago', type: 'ERP', records: '12.4M', uptime: 99.97 },
      { id: 'I5', name: 'Carrier EDI Network', status: 'ACTIVE', latency: 28, lastPing: '1s ago', type: 'CARRIER', records: '5.8M', uptime: 99.99 },
      { id: 'I6', name: 'Port Community System', status: 'ACTIVE', latency: 110, lastPing: '3s ago', type: 'PORT', records: '1.2M', uptime: 99.91 },
      { id: 'I7', name: 'GenAI Risk Model v3', status: 'ACTIVE', latency: 190, lastPing: '2s ago', type: 'AI', records: ' - ', uptime: 99.85 },
      { id: 'I8', name: 'Stripe Payments', status: 'INACTIVE', latency: 0, lastPing: ' - ', type: 'FINANCE', records: ' - ', uptime: 0 },
    ];

    // Seed realistic alerts
    const seedAlerts = [
      new Alert({ shipmentId: 'FLX-1000', severity: 'CRITICAL', message: 'Typhoon Koinu  -  SHA to LAX closure forecast +36h. DRS: 84.' }),
      new Alert({ shipmentId: 'FLX-1010', severity: 'CRITICAL', message: 'Suez congestion index 0.83  -  22 vessels queued. DRS: 71.' }),
      new Alert({ shipmentId: 'FLX-1020', severity: 'WARNING', message: 'North Sea gusts 68kn  -  RTM crane ops suspended. DRS: 54.' }),
      new Alert({ shipmentId: 'FLX-1030', severity: 'WARNING', message: 'Port Botany berth congestion  -  vessel queue 8 ships. DRS: 47.' }),
    ];

    const normalizedAlerts = [
      new Alert({ shipmentId: 'FLX-1000', severity: 'CRITICAL', message: 'Typhoon Koinu - SHA to LAX closure forecast +36h. DRS: 84.' }),
      new Alert({ shipmentId: 'FLX-1010', severity: 'CRITICAL', message: 'Suez congestion index 0.83 - 22 vessels queued. DRS: 71.' }),
      new Alert({ shipmentId: 'FLX-1020', severity: 'WARNING', message: 'North Sea gusts 68kn - RTM crane operations suspended. DRS: 54.' }),
      new Alert({ shipmentId: 'FLX-1030', severity: 'WARNING', message: 'Port Botany berth congestion - vessel queue 8 ships. DRS: 47.' }),
    ];

    set({
      ports: mockPorts,
      shipments: mockShipments,
      carriers: mockCarriers,
      events: mockEvents,
      integrations: mockIntegrations,
      alerts: normalizedAlerts,
      systemStatus: 'NOMINAL',
    });
  },

  // -- Live Simulation --------------------------------------------------------
  triggerSimulation: () => {
    const { shipments, alerts } = get();
    const updatedShipments = shipments.map(s => {
      let newProgress = s.progress + 0.0008;
      if (newProgress > 1) newProgress = 0;
      let newRisk = s.riskScore + (Math.random() > 0.97 ? rand(0.1, 0.4) : rand(-0.008, 0.002));
      newRisk = Math.max(0, Math.min(1, newRisk));
      const updated = new Shipment({ ...s, progress: newProgress });
      updated.updateRisk(newRisk);
      return updated;
    });

    const newAlerts = [...alerts];
    updatedShipments.forEach(s => {
      if (s.status === 'CRITICAL' && !alerts.find(a => a.shipmentId === s.id) && newAlerts.length < 20) {
        const ev = pick(DISRUPTION_EVENTS);
        newAlerts.unshift(new Alert({ shipmentId: s.id, severity: ev.severity, message: ev.message }));
      }
    });

    set({
      shipments: updatedShipments,
      alerts: newAlerts.slice(0, 25),
      lastSync: new Date().toISOString(),
    });
  },
}));
