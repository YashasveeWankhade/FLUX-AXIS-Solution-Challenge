<p align="center">
  <img src="logo pfp.png" alt="FluxAxis Logo" width="400" />
</p>

<h1 align="center"> ## Supply Chain Intelligence Platform</h1>

<p align="center">
  <strong>Real-time global logistics monitoring, AI-driven risk assessment, and autonomous route optimization.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/status-MVP-orange?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge" alt="Build" />
  <img src="https://img.shields.io/badge/PRs-welcome-ff69b4?style=for-the-badge" alt="PRs Welcome" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#️-system-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Quick Start</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📋 Overview

**FluxAxis** is an enterprise-grade supply chain intelligence platform designed to provide logistics operators with full situational awareness across global shipping networks. It combines real-time vessel tracking, AI-powered disruption risk scoring (DRS), predictive analytics, and autonomous rerouting into a single command center.

> Built for the **Google Solution Challenge 2026** — addressing UN SDG 9 (Industry, Innovation & Infrastructure) and SDG 12 (Responsible Consumption & Production).

### 🎯 Problem Statement

Global supply chains face $4.4 trillion in annual disruptions from weather events, geopolitical instability, port congestion, and carrier failures. Traditional logistics tools offer fragmented visibility and reactive responses. FluxAxis transforms supply chain management from reactive firefighting to proactive intelligence.

---

## ✨ Features

| Category | Feature | Description |
|:---------|:--------|:------------|
| 🌐 **Operations** | Live Network Map | Interactive 3D globe with real-time vessel positions and route arcs |
| 📊 **Operations** | Global Operations Center | KPI dashboard with active shipments, SLA compliance, and risk metrics |
| 🚨 **Operations** | Alert Command | Severity-filtered signal dispatch with one-click resolution workflow |
| 🛤️ **Operations** | Route Intelligence | 3D route visualization with AI-recommended alternative routes |
| 🏗️ **Operations** | Port Intelligence | 3D terminal visualization with congestion, berth, and weather data |
| 🚢 **Operations** | Carrier Analytics | Fleet performance rankings with reliability and delay metrics |
| ⚡ **Operations** | Event Monitor | Live disruption event feed with affected shipment correlation |
| 🔮 **Intelligence** | Predictive Engine | Signal-based forecasting with confidence scoring and trend analysis |
| 📈 **Intelligence** | Analytics Hub | Throughput trends, delay analysis, and lane performance matrices |
| 🔄 **Intelligence** | Decision Loop | Operator feedback system for continuous model improvement |
| 🔌 **System** | Integrations | AIS tracker, NOAA weather, customs EDI, ERP, and AI model connectors |
| ⚙️ **System** | Settings | Theme customization, accent colors, notifications, and API management |

---

## 📸 Screenshots

### Landing — Operator Authentication
<p align="center">
  <img src="docs/screenshots/landing_page.png" alt="FluxAxis Landing Page" width="90%" />
</p>

### Command Overview — Global Operations Center
<p align="center">
  <img src="docs/screenshots/overview_dashboard.png" alt="Command Overview Dashboard" width="90%" />
</p>

### Live Network — 3D Globe & Shipment Inventory
<p align="center">
  <img src="docs/screenshots/live_network.png" alt="Live Network Globe" width="90%" />
</p>

### Alert Command — Signal Dispatch & Triage
<p align="center">
  <img src="docs/screenshots/alerts_command.png" alt="Alert Command Center" width="90%" />
</p>

### Route Intelligence — 3D Visualization & AI Rerouting
<p align="center">
  <img src="docs/screenshots/route_intelligence.png" alt="Route Intelligence" width="90%" />
</p>

### Port Intelligence — 3D Terminal & Congestion Data
<p align="center">
  <img src="docs/screenshots/port_intelligence.png" alt="Port Intelligence" width="90%" />
</p>

### Analytics Hub — Throughput & Performance Metrics
<p align="center">
  <img src="docs/screenshots/analytics_hub.png" alt="Analytics Hub" width="90%" />
</p>

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer"]
        BROWSER["Browser / React SPA"]
        THREE["Three.js 3D Engine"]
        D3["D3.js Data Viz"]
        FRAMER["Framer Motion"]
    end

    subgraph APP["⚛️ Application Layer"]
        ROUTER["React Router v6"]
        ZUSTAND["Zustand State Store"]
        DOMAIN["Domain Models<br/>(OOP Classes)"]
        SIMULATION["Live Simulation Engine"]
    end

    subgraph PAGES["📄 Page Modules (12 Views)"]
        direction LR
        P1["HomePage"]
        P2["LandingPage"]
        P3["NetworkPage"]
        P4["RiskPage"]
        P5["RoutesPage"]
        P6["PortsPage"]
        P7["CarriersPage"]
        P8["EventsPage"]
        P9["SignalsPage"]
        P10["AnalyticsPage"]
        P11["FeedbackPage"]
        P12["IntegrationsPage"]
    end

    subgraph COMPONENTS["🧩 Shared Components"]
        LAYOUT["Layout Shell"]
        NAVBAR["Top Navbar"]
        MAP["ShipmentMap"]
        ALERTS["AlertQueue"]
        ROUTE_PANEL["RoutePanel"]
        HERO["HeroSection"]
    end

    subgraph DATA["💾 Data Layer"]
        MOCK["Mock Data Generator"]
        MODELS["Shipment / Port / Alert / Integration"]
        STORE["Centralized State"]
    end

    BROWSER --> ROUTER
    ROUTER --> PAGES
    PAGES --> COMPONENTS
    COMPONENTS --> ZUSTAND
    ZUSTAND --> DOMAIN
    DOMAIN --> MODELS
    SIMULATION --> ZUSTAND
    THREE --> BROWSER
    D3 --> BROWSER
    FRAMER --> BROWSER
    MOCK --> STORE
    STORE --> ZUSTAND

    style CLIENT fill:#1a1a2e,color:#e0e0e0,stroke:#3F6C8F
    style APP fill:#16213e,color:#e0e0e0,stroke:#3F6C8F
    style PAGES fill:#0f3460,color:#e0e0e0,stroke:#3F6C8F
    style COMPONENTS fill:#1a1a2e,color:#e0e0e0,stroke:#3F6C8F
    style DATA fill:#16213e,color:#e0e0e0,stroke:#3F6C8F
```

---

## 🔄 Data Flow — Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Operator
    participant UI as React UI
    participant Router as React Router
    participant Store as Zustand Store
    participant Domain as Domain Models
    participant Sim as Simulation Engine
    participant ThreeJS as Three.js Renderer

    Operator->>UI: Opens FluxAxis (localhost:5173)
    UI->>Router: Route "/"  →  HomePage
    Operator->>UI: Clicks "Authenticate"
    UI->>Router: Navigate to "/overview"
    Router->>Store: initializeSystem()
    Store->>Domain: Instantiate Shipments, Ports, Alerts
    Domain-->>Store: 40 Shipments, 9 Ports, 4 Alerts seeded
    Store-->>UI: Render Global Operations Center

    loop Every 2 seconds
        Sim->>Store: triggerSimulation()
        Store->>Domain: updateRisk() for each Shipment
        Domain-->>Store: New risk scores & statuses
        Store-->>UI: Re-render affected components
    end

    Operator->>UI: Navigates to "/network"
    UI->>ThreeJS: Render 3D Globe + Route Arcs
    ThreeJS-->>UI: Interactive globe with port markers

    Operator->>UI: Clicks on FLX-1000 Alert
    UI->>Store: resolveAlert(id)
    Store->>Domain: Remove alert, update shipment
    Store-->>UI: Notification "Alert resolved"

    Operator->>UI: Navigates to "/routes"
    UI->>Store: Select shipment for rerouting
    UI->>ThreeJS: Render 3D route arc
    Operator->>UI: Clicks "Execute Reroute"
    UI->>Store: executeReroute(shipmentId, routeId)
    Store->>Domain: Reduce riskScore by 60%
    Store-->>UI: Notification "Reroute submitted"
```

---

## 🔀 Application Flow — Flowchart

```mermaid
flowchart TD
    START(["🚀 User opens FluxAxis"]) --> AUTH{"Authenticated?"}
    AUTH -- "No" --> LOGIN["HomePage<br/>Operator Authentication"]
    LOGIN --> GOOGLE["Google OAuth / Email"]
    GOOGLE --> AUTH
    AUTH -- "Yes" --> DASHBOARD["Global Operations Center<br/>/overview"]

    DASHBOARD --> |"View shipments"| NETWORK["Live Network<br/>3D Globe + Inventory"]
    DASHBOARD --> |"Check alerts"| ALERTS["Alert Command<br/>Signal Dispatch"]
    DASHBOARD --> |"Analyze routes"| ROUTES["Route Intelligence<br/>3D Visualization"]
    DASHBOARD --> |"Monitor ports"| PORTS["Port Intelligence<br/>Terminal Visualization"]
    DASHBOARD --> |"Carrier data"| CARRIERS["Carrier Analytics<br/>Fleet Performance"]
    DASHBOARD --> |"Track events"| EVENTS["Event Monitor<br/>Disruption Feed"]

    ALERTS --> RESOLVE{"Severity?"}
    RESOLVE -- "CRITICAL" --> REROUTE["AI Reroute<br/>Recommendation"]
    RESOLVE -- "WARNING" --> MONITOR["Continue<br/>Monitoring"]
    REROUTE --> EXECUTE["Execute Reroute<br/>Risk ↓60%"]
    EXECUTE --> DASHBOARD

    NETWORK --> PREDICTIVE["Predictive Engine<br/>Signal Forecasting"]
    PREDICTIVE --> ANALYTICS["Analytics Hub<br/>Throughput & Delay"]
    ANALYTICS --> FEEDBACK["Decision Loop<br/>Operator Feedback"]
    FEEDBACK --> |"Improves models"| PREDICTIVE

    DASHBOARD --> SETTINGS["⚙️ Settings<br/>Theme / API / Profile"]
    DASHBOARD --> INTEGRATIONS["🔌 Integrations<br/>AIS / NOAA / EDI"]

    style START fill:#3F6C8F,color:#fff,stroke:#2d5270
    style DASHBOARD fill:#1a1a2e,color:#e0e0e0,stroke:#3F6C8F
    style REROUTE fill:#b71c1c,color:#fff
    style EXECUTE fill:#2e7d32,color:#fff
    style MONITOR fill:#f57f17,color:#fff
```

---

## 🧠 Domain Model — Class Diagram

```mermaid
classDiagram
    class Shipment {
        +String id
        +Object origin
        +Object destination
        +String carrier
        +String cargoType
        +String status
        +Float riskScore
        +String eta
        +String value
        +Float progress
        +Array path
        +Int containers
        +String weight
        +updateRisk(newScore)
        +get drs() Int
        +get etaFormatted() String
    }

    class Alert {
        +String id
        +String shipmentId
        +String severity
        +String message
        +String timestamp
        +Boolean resolved
    }

    class Port {
        +String id
        +String name
        +Object coords
        +Float congestion
        +Int vessels
        +String region
        +Int throughput
        +String weather
        +Int berths
        +get congestionLabel() String
    }

    class Integration {
        +String id
        +String name
        +String status
        +Int latency
        +String type
    }

    class AppStore {
        +Array~Shipment~ shipments
        +Array~Port~ ports
        +Array~Alert~ alerts
        +Array carriers
        +Array events
        +Array~Integration~ integrations
        +String systemStatus
        +Object settings
        +initializeSystem()
        +triggerSimulation()
        +resolveAlert(id)
        +executeReroute(shipmentId, routeId)
        +createAlert(data)
        +requestBerthAllocation(portId)
    }

    AppStore "1" --> "*" Shipment : manages
    AppStore "1" --> "*" Alert : dispatches
    AppStore "1" --> "*" Port : monitors
    AppStore "1" --> "*" Integration : connects
    Alert --> Shipment : references
    Shipment --> Port : origin/destination
```

---

## 🛠️ Tech Stack

### Frontend Core

| Technology | Purpose | Badge |
|:-----------|:--------|:------|
| **React 18** | UI Component Library | ![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white) |
| **Vite 5** | Build Tool & Dev Server | ![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **React Router v6** | Client-Side Routing | ![React Router](https://img.shields.io/badge/React_Router-6.22-CA4245?style=flat-square&logo=reactrouter&logoColor=white) |
| **Zustand 4** | Global State Management | ![Zustand](https://img.shields.io/badge/Zustand-4.5-443E38?style=flat-square&logo=npm&logoColor=white) |

### Visualization & Animation

| Technology | Purpose | Badge |
|:-----------|:--------|:------|
| **Three.js** | 3D Globe, Route Arcs, Terminal Viz | ![Three.js](https://img.shields.io/badge/Three.js-0.184-000000?style=flat-square&logo=threedotjs&logoColor=white) |
| **React Three Fiber** | React bindings for Three.js | ![R3F](https://img.shields.io/badge/R3F-8.18-000000?style=flat-square&logo=threedotjs&logoColor=white) |
| **React Three Drei** | Three.js helper components | ![Drei](https://img.shields.io/badge/Drei-9.122-000000?style=flat-square&logo=threedotjs&logoColor=white) |
| **D3.js** | SVG charts and data-driven maps | ![D3](https://img.shields.io/badge/D3.js-7.9-F9A03C?style=flat-square&logo=d3dotjs&logoColor=white) |
| **Framer Motion** | Page transitions & micro-animations | ![Framer](https://img.shields.io/badge/Framer_Motion-11.3-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Dotted Map** | World map point visualization | ![DottedMap](https://img.shields.io/badge/Dotted_Map-2.2-333333?style=flat-square&logo=npm&logoColor=white) |

### UI & Design System

| Technology | Purpose | Badge |
|:-----------|:--------|:------|
| **Lucide React** | Icon system (460+ icons) | ![Lucide](https://img.shields.io/badge/Lucide-0.460-F56565?style=flat-square&logo=lucide&logoColor=white) |
| **JetBrains Mono** | Monospace typography | ![Font](https://img.shields.io/badge/JetBrains_Mono-Google_Fonts-4285F4?style=flat-square&logo=googlefonts&logoColor=white) |
| **CSS Custom Properties** | Dynamic theming engine | ![CSS](https://img.shields.io/badge/CSS3-Custom_Props-1572B6?style=flat-square&logo=css3&logoColor=white) |

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fluxaxis-platform.git

# Navigate to project directory
cd fluxaxis-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **`http://localhost:5173`**

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
fluxaxis-platform/
├── public/
│   ├── logo.png                    # App logo (transparent)
│   └── logo_pfp.png               # Logo profile picture
│
├── src/
│   ├── main.jsx                    # React entry point + BrowserRouter
│   ├── App.jsx                     # Root component + route definitions
│   │
│   ├── components/                 # Shared UI components
│   │   ├── Layout.jsx              # Dashboard shell (sidebar + topbar)
│   │   ├── Navbar.jsx              # Top navigation bar
│   │   ├── HeroSection.jsx         # Landing page hero with 3D background
│   │   ├── FeaturesSection.jsx     # Landing page feature cards
│   │   ├── MetricsSection.jsx      # Landing page live metrics
│   │   ├── DashboardSection.jsx    # Landing page dashboard preview
│   │   ├── Footer.jsx              # Landing page footer
│   │   ├── ShipmentMap.jsx         # Dotted world map with route lines
│   │   ├── AlertQueue.jsx          # Real-time alert feed component
│   │   ├── RoutePanel.jsx          # Route detail panel with 3D viz
│   │   └── ui/                     # Primitive UI components
│   │
│   ├── pages/                      # Route-level page components
│   │   ├── HomePage.jsx            # Authentication landing (/)
│   │   ├── LandingPage.jsx         # Global Operations Center (/overview)
│   │   ├── NetworkPage.jsx         # 3D Globe + Shipment list (/network)
│   │   ├── RiskPage.jsx            # Alert Command Center (/alerts)
│   │   ├── RoutesPage.jsx          # Route Intelligence (/routes)
│   │   ├── PortsPage.jsx           # Port Intelligence (/ports)
│   │   ├── CarriersPage.jsx        # Carrier Analytics (/carriers)
│   │   ├── EventsPage.jsx          # Event Monitor (/events)
│   │   ├── SignalsPage.jsx         # Predictive Engine (/predictive)
│   │   ├── AnalyticsPage.jsx       # Analytics Hub (/analytics)
│   │   ├── FeedbackPage.jsx        # Decision Loop (/feedback)
│   │   ├── IntegrationsPage.jsx    # System Integrations (/integrations)
│   │   └── SettingsPage.jsx        # User Settings (/settings)
│   │
│   ├── domain/                     # Object-Oriented Domain Models
│   │   └── models.js               # Shipment, Alert, Port, Integration
│   │
│   ├── store/                      # State Management
│   │   └── useAppStore.js          # Zustand store (300+ lines)
│   │
│   ├── data/                       # Static/Mock Data
│   │   └── mockData.js             # Seed data for development
│   │
│   └── styles/                     # Global Styles
│       └── globals.css             # CSS custom properties + themes
│
├── docs/
│   └── screenshots/                # App screenshots for documentation
│
├── index.html                      # HTML entry point
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

---

## 🗺️ Route Map

| Route | Page | Description |
|:------|:-----|:------------|
| `/` | `HomePage` | Operator authentication with Google OAuth |
| `/overview` | `LandingPage` | Global Operations Center — KPI summary |
| `/network` | `NetworkPage` | 3D globe with live vessel positions |
| `/alerts` | `RiskPage` | Alert signal dispatch & triage |
| `/routes` | `RoutesPage` | Route visualization & AI rerouting |
| `/ports` | `PortsPage` | 3D terminal & congestion analytics |
| `/carriers` | `CarriersPage` | Carrier fleet performance rankings |
| `/events` | `EventsPage` | Live disruption event feed |
| `/predictive` | `SignalsPage` | Predictive signal engine |
| `/analytics` | `AnalyticsPage` | Throughput, delay & lane metrics |
| `/feedback` | `FeedbackPage` | Operator feedback loop |
| `/integrations` | `IntegrationsPage` | External system connectors |
| `/settings` | `SettingsPage` | Theme, profile & API management |

---

## 🔐 State Management Architecture

```mermaid
graph LR
    subgraph ZUSTAND["Zustand Store"]
        direction TB
        CORE["Core Data<br/>shipments, ports, alerts,<br/>carriers, events, integrations"]
        UI["UI State<br/>searchQuery, profileOpen,<br/>chatMessages, notifications"]
        SETTINGS["Global Settings<br/>theme, accent, language,<br/>currency, alerts config"]
        ACTIONS["Actions<br/>resolveAlert, executeReroute,<br/>createAlert, requestBerth"]
    end

    INIT["initializeSystem()"] --> CORE
    SIM["triggerSimulation()"] --> CORE
    USER["User Interactions"] --> ACTIONS
    ACTIONS --> CORE
    ACTIONS --> UI
    CORE --> REACT["React Components<br/>(auto re-render)"]
    UI --> REACT
    SETTINGS --> REACT
    SETTINGS --> CSS["CSS Custom Properties<br/>--accent, theme class"]

    style ZUSTAND fill:#1a1a2e,color:#e0e0e0,stroke:#3F6C8F
    style REACT fill:#61DAFB,color:#000
    style CSS fill:#1572B6,color:#fff
```

---

## 📊 Port Network Data

| Port | Code | Region | Congestion | Vessels | Berths | Throughput (TEU) |
|:-----|:----:|:------:|:----------:|:-------:|:------:|:----------------:|
| Shanghai | SHA | Asia Pacific | 42% 🟡 | 124 | 42 | 47,230 |
| Los Angeles | LAX | Americas | 82% 🔴 | 45 | 18 | 21,800 |
| Rotterdam | RTM | Europe | 25% 🟢 | 88 | 35 | 33,500 |
| Singapore | SIN | Asia Pacific | 15% 🟢 | 210 | 55 | 39,100 |
| Dubai | DXB | Middle East | 61% 🟡 | 62 | 22 | 18,900 |
| Tokyo | TYO | Asia Pacific | 33% 🟢 | 77 | 28 | 24,600 |
| New York | NYC | Americas | 44% 🟡 | 55 | 20 | 19,200 |
| Mumbai | MUM | South Asia | 55% 🟡 | 40 | 15 | 12,400 |
| Sydney | SYD | Oceania | 22% 🟢 | 30 | 12 | 8,700 |

---

## 🧮 Disruption Risk Score (DRS)

The **Disruption Risk Score** is FluxAxis's core risk metric, ranging from `0` (no risk) to `100` (maximum disruption).

```mermaid
graph LR
    A["Raw Signals<br/>Weather, Geopolitical,<br/>Port, Carrier"] --> B["Risk Aggregator<br/>Weighted scoring"]
    B --> C{"DRS Score"}
    C -->|"0-40"| D["🟢 STABLE<br/>Normal operations"]
    C -->|"41-75"| E["🟡 WARNING<br/>Elevated monitoring"]
    C -->|"76-100"| F["🔴 CRITICAL<br/>Immediate action required"]
    F --> G["AI Reroute<br/>Recommendation Engine"]
    G --> H["Operator Approval<br/>Execute or Dismiss"]

    style D fill:#2e7d32,color:#fff
    style E fill:#f57f17,color:#fff
    style F fill:#b71c1c,color:#fff
    style G fill:#3F6C8F,color:#fff
```

| DRS Range | Status | Action | SLA Impact |
|:---------:|:------:|:-------|:-----------|
| 0 – 40 | 🟢 STABLE | Continue normal transit | None |
| 41 – 75 | 🟡 WARNING | Elevated monitoring, prepare alternatives | Potential +12h |
| 76 – 100 | 🔴 CRITICAL | Immediate reroute recommendation | SLA breach risk |

---

## 🔌 Integration Connectors

| Service | Type | Status | Latency | Records | Uptime |
|:--------|:----:|:------:|:-------:|:-------:|:------:|
| AIS Vessel Tracker | MARITIME | 🟢 Active | 42ms | 847K | 99.98% |
| NOAA Weather API | WEATHER | 🟢 Active | 88ms | 2.1M | 99.95% |
| Customs Broker EDI | CUSTOMS | 🟡 Degraded | 412ms | 340K | 97.22% |
| ERP SAP S/4 HANA | ERP | 🟢 Active | 64ms | 12.4M | 99.97% |
| Carrier EDI Network | CARRIER | 🟢 Active | 28ms | 5.8M | 99.99% |
| Port Community System | PORT | 🟢 Active | 110ms | 1.2M | 99.91% |
| GenAI Risk Model v3 | AI | 🟢 Active | 190ms | — | 99.85% |
| Stripe Payments | FINANCE | ⚪ Inactive | — | — | — |

---

## 🚀 Deployment Pipeline

```mermaid
flowchart LR
    DEV["💻 Local Dev<br/>npm run dev"] --> LINT["🔍 Lint & Format<br/>ESLint + Prettier"]
    LINT --> BUILD["📦 Vite Build<br/>npm run build"]
    BUILD --> TEST["🧪 Preview<br/>npm run preview"]
    TEST --> DEPLOY["☁️ Deploy<br/>Vercel / Firebase"]
    DEPLOY --> PROD["🌐 Production<br/>fluxaxis.io"]

    style DEV fill:#3F6C8F,color:#fff
    style BUILD fill:#646CFF,color:#fff
    style DEPLOY fill:#2e7d32,color:#fff
    style PROD fill:#1a1a2e,color:#e0e0e0,stroke:#3F6C8F
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

| Prefix | Purpose |
|:-------|:--------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring |
| `perf:` | Performance improvement |
| `test:` | Adding tests |
| `chore:` | Build process or auxiliary |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <img src="logo pfp.png" alt="FluxAxis" width="80" />
</p>

<p align="center">
  <strong>FluxAxis</strong> — Supply Chain Intelligence, Reimagined.
  <br />
  <sub>Built with ❤️ for the Google Solution Challenge 2026</sub>
</p>
