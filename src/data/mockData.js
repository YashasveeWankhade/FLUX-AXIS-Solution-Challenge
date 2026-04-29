// -- Ports -------------------------------------------------------------------
// Coordinates mapped to 680x340 SVG canvas (simplified Mercator)
export const PORTS = [
  { id: 'SHA', name: 'Shanghai',     x: 569, y: 124, status: 'critical', region: 'Asia Pacific' },
  { id: 'SIN', name: 'Singapore',    x: 536, y: 190, status: 'nominal',  region: 'Asia Pacific' },
  { id: 'RTM', name: 'Rotterdam',    x: 347, y:  82, status: 'watch',    region: 'Europe'       },
  { id: 'LAX', name: 'Los Angeles',  x: 118, y: 122, status: 'nominal',  region: 'Americas'     },
  { id: 'NYC', name: 'New York',     x: 198, y: 104, status: 'nominal',  region: 'Americas'     },
  { id: 'DXB', name: 'Dubai',        x: 444, y: 138, status: 'watch',    region: 'Middle East'  },
  { id: 'MUM', name: 'Mumbai',       x: 478, y: 154, status: 'nominal',  region: 'South Asia'   },
  { id: 'HHN', name: 'Hamburg',      x: 358, y:  76, status: 'nominal',  region: 'Europe'       },
  { id: 'TYO', name: 'Tokyo',        x: 602, y: 116, status: 'nominal',  region: 'Asia Pacific' },
  { id: 'SYD', name: 'Sydney',       x: 624, y: 258, status: 'nominal',  region: 'Oceania'      },
]

// -- Trade Lanes --------------------------------------------------------------
export const LANES = [
  { id: 'L01', from: 'SHA', to: 'LAX', shipments: 24, disrupted: true,  delay: 18 },
  { id: 'L02', from: 'SHA', to: 'RTM', shipments: 31, disrupted: false, delay: 0  },
  { id: 'L03', from: 'SIN', to: 'DXB', shipments: 18, disrupted: false, delay: 0  },
  { id: 'L04', from: 'DXB', to: 'RTM', shipments: 22, disrupted: true,  delay: 11 },
  { id: 'L05', from: 'NYC', to: 'RTM', shipments: 15, disrupted: false, delay: 0  },
  { id: 'L06', from: 'SHA', to: 'TYO', shipments: 12, disrupted: false, delay: 0  },
  { id: 'L07', from: 'SIN', to: 'SYD', shipments: 8,  disrupted: false, delay: 0  },
  { id: 'L08', from: 'MUM', to: 'DXB', shipments: 9,  disrupted: false, delay: 0  },
  { id: 'L09', from: 'LAX', to: 'NYC', shipments: 20, disrupted: false, delay: 0  },
  { id: 'L10', from: 'TYO', to: 'SYD', shipments: 6,  disrupted: false, delay: 0  },
]

// -- Active Alerts ------------------------------------------------------------
export const INITIAL_ALERTS = [
  {
    id: 'A001',
    shipmentId: 'CS-88124',
    route: 'Shanghai  to  Los Angeles',
    carrier: 'Evergreen Marine',
    drs: 84,
    severity: 'critical',
    trigger: 'Typhoon Koinu  -  Port of Long Beach closure forecast +36h',
    eta: '2026-05-02',
    etaDelta: '+18h',
    value: '$2.4M',
    priority: 'Critical',
    ts: '14:22 UTC',
  },
  {
    id: 'A002',
    shipmentId: 'CS-88247',
    route: 'Dubai  to  Rotterdam',
    carrier: 'MSC Mediterranean',
    drs: 71,
    severity: 'critical',
    trigger: 'Suez Canal congestion index 0.83  -  22 vessels queued',
    eta: '2026-05-06',
    etaDelta: '+11h',
    value: '$1.1M',
    priority: 'High',
    ts: '13:58 UTC',
  },
  {
    id: 'A003',
    shipmentId: 'CS-87993',
    route: 'Rotterdam  to  Hamburg',
    carrier: 'Hapag-Lloyd',
    drs: 54,
    severity: 'watch',
    trigger: 'North Sea wind gusts 68 knots  -  terminal crane ops suspended',
    eta: '2026-04-29',
    etaDelta: '+4h',
    value: '$380K',
    priority: 'Medium',
    ts: '12:41 UTC',
  },
  {
    id: 'A004',
    shipmentId: 'CS-88301',
    route: 'Singapore  to  Sydney',
    carrier: 'PIL Pacific',
    drs: 47,
    severity: 'watch',
    trigger: 'Berth congestion at Port Botany  -  vessel queue 8 ships',
    eta: '2026-05-04',
    etaDelta: '+6h',
    value: '$610K',
    priority: 'Medium',
    ts: '11:15 UTC',
  },
]

// -- Route Alternatives -------------------------------------------------------
export const ROUTE_ALTERNATIVES = {
  'A001': [
    {
      id: 'R1A',
      label: 'Recommended',
      via: 'Port of Oakland',
      carrier: 'COSCO Shipping',
      eta: '2026-05-03',
      etaDelta: '+6h',
      costDelta: '+$8,400',
      slaOk: true,
      co2Delta: '+2.1%',
      confidence: 91,
      capacity: 'Available',
    },
    {
      id: 'R1B',
      label: 'Alternative',
      via: 'Port of Seattle',
      carrier: 'ONE Ocean Network',
      eta: '2026-05-04',
      etaDelta: '+30h',
      costDelta: '+$3,100',
      slaOk: false,
      co2Delta: '+4.8%',
      confidence: 76,
      capacity: 'Limited',
    },
    {
      id: 'R1C',
      label: 'Air freight',
      via: 'LAX Air Cargo',
      carrier: 'FedEx Custom Critical',
      eta: '2026-04-30',
      etaDelta: '-48h',
      costDelta: '+$94,200',
      slaOk: true,
      co2Delta: '+380%',
      confidence: 99,
      capacity: 'Available',
    },
  ],
}

// -- Global Metrics -----------------------------------------------------------
export const METRICS = [
  { id: 'M1', label: 'Active shipments',  value: 2847, suffix: '',   trend: +2.4,  unit: ''  },
  { id: 'M2', label: 'System DRS avg',    value: 18,   suffix: '',   trend: -3.1,  unit: ''  },
  { id: 'M3', label: 'Alerts open',       value: 14,   suffix: '',   trend: +5,    unit: ''  },
  { id: 'M4', label: 'SLA compliance',    value: 97.2, suffix: '%',  trend: +0.4,  unit: '%' },
]

// -- Features -----------------------------------------------------------------
export const FEATURES = [
  {
    id: 'F1',
    icon: '◈',
    title: 'Proactive detection',
    body: 'Hybrid DRS engine combines real-time geospatial lag, weather severity, and port congestion into a continuous 0 - 100 risk score per shipment, flagging disruptions before ETA is missed.',
    stat: '4.2h',
    statLabel: 'avg detection lead time',
  },
  {
    id: 'F2',
    icon: '⬡',
    title: 'Dynamic re-routing',
    body: 'When DRS exceeds threshold, the optimization engine instantly queries alternative carriers and port pairs, ranks options by cost delta, SLA compliance, and CO2 impact.',
    stat: '< 90s',
    statLabel: 'recommendation latency',
  },
  {
    id: 'F3',
    icon: '◎',
    title: 'Feedback intelligence',
    body: 'Every operator decision and resolved disruption feeds back into the XGBoost scoring model. Monthly retraining cycles continuously sharpen prediction accuracy.',
    stat: '91%',
    statLabel: 'model acceptance rate',
  },
]
