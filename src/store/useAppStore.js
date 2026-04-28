import { create } from 'zustand';
import { Shipment, Port, Alert, Integration } from '../domain/models';

const generatePath = (start, end) => {
  const steps = 100;
  const path = [];
  for (let i = 0; i <= steps; i++) {
    path.push({
      lat: start.lat + (end.lat - start.lat) * (i / steps),
      lng: start.lng + (end.lng - start.lng) * (i / steps)
    });
  }
  return path;
};

export const useAppStore = create((set, get) => ({
  shipments: [],
  ports: [],
  alerts: [],
  integrations: [],
  systemStatus: 'NOMINAL',

  initializeSystem: () => {
    const mockPorts = [
      new Port({ id: 'SHA', name: 'Shanghai', coords: { lat: 31.2, lng: 121.5 }, congestion: 0.42, vessels: 124 }),
      new Port({ id: 'LAX', name: 'Los Angeles', coords: { lat: 33.7, lng: -118.2 }, congestion: 0.82, vessels: 45 }),
      new Port({ id: 'RTM', name: 'Rotterdam', coords: { lat: 51.9, lng: 4.4 }, congestion: 0.25, vessels: 88 }),
      new Port({ id: 'SIN', name: 'Singapore', coords: { lat: 1.3, lng: 103.8 }, congestion: 0.15, vessels: 210 }),
    ];

    const mockShipments = Array.from({ length: 40 }).map((_, i) => {
      const origin = mockPorts[Math.floor(Math.random() * mockPorts.length)];
      const dest = mockPorts[Math.floor(Math.random() * mockPorts.length)];
      if (origin.id === dest.id) return null;
      
      return new Shipment({
        id: `FLX-${1000 + i}`,
        origin,
        destination: dest,
        carrier: 'Maersk',
        progress: Math.random(),
        riskScore: Math.random() * 0.3,
        value: `$${(Math.random() * 4).toFixed(1)}M`,
        eta: '2026-05-12T14:00:00Z',
        path: generatePath(origin.coords, dest.coords)
      });
    }).filter(Boolean);

    set({ ports: mockPorts, shipments: mockShipments, systemStatus: 'NOMINAL' });
  },

  triggerSimulation: () => {
    const { shipments, alerts } = get();
    const updatedShipments = shipments.map(s => {
      let newProgress = s.progress + 0.001;
      if (newProgress > 1) newProgress = 0;
      let newRisk = s.riskScore + (Math.random() > 0.98 ? 0.3 : -0.01);
      newRisk = Math.max(0, Math.min(1, newRisk));
      const updated = new Shipment({ ...s, progress: newProgress, riskScore: newRisk });
      updated.updateRisk(newRisk);
      return updated;
    });

    const newAlerts = [...alerts];
    updatedShipments.forEach(s => {
      if (s.status === 'CRITICAL' && !alerts.find(a => a.shipmentId === s.id)) {
        newAlerts.unshift(new Alert({ shipmentId: s.id, severity: 'CRITICAL', message: `Critical threshold breach on ${s.id}` }));
      }
    });

    set({ shipments: updatedShipments, alerts: newAlerts.slice(0, 20) });
  },

  resolveAlert: (id) => set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }))
}));
