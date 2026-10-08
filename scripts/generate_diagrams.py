"""
TripMate Diagram Generator
Produces professional, publication-quality vector SVG diagrams for all 16 engineering phases
"""

import os

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def generate_use_case_svg(filepath):
    ensure_dir(filepath)
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 950 650" width="100%" height="100%" style="background:#0f172a; font-family:'Segoe UI',sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Title -->
  <text x="475" y="40" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="bold">TripMate — UML Use Case Diagram (Access Control &amp; Collaboration)</text>

  <!-- System Boundary Box -->
  <rect x="220" y="70" width="510" height="550" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" filter="url(#shadow)"/>
  <text x="475" y="98" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="bold" letter-spacing="1">SYSTEM BOUNDARY: TRIPMATE COLLABORATIVE ENGINE</text>

  <!-- Actors Left: Primary Users -->
  <!-- Actor 1: Trip Owner -->
  <circle cx="100" cy="180" r="18" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
  <line x1="100" y1="198" x2="100" y2="240" stroke="#fff" stroke-width="2"/>
  <line x1="75" y1="215" x2="125" y2="215" stroke="#fff" stroke-width="2"/>
  <line x1="100" y1="240" x2="80" y2="280" stroke="#fff" stroke-width="2"/>
  <line x1="100" y1="240" x2="120" y2="280" stroke="#fff" stroke-width="2"/>
  <text x="100" y="305" text-anchor="middle" fill="#f59e0b" font-size="13" font-weight="bold">Trip Owner</text>
  <text x="100" y="322" text-anchor="middle" fill="#94a3b8" font-size="11">(Full Admin Rights)</text>

  <!-- Actor 2: Trip Editor -->
  <circle cx="100" cy="420" r="18" fill="#0ea5e9" stroke="#fff" stroke-width="2"/>
  <line x1="100" y1="438" x2="100" y2="480" stroke="#fff" stroke-width="2"/>
  <line x1="75" y1="455" x2="125" y2="455" stroke="#fff" stroke-width="2"/>
  <line x1="100" y1="480" x2="80" y2="520" stroke="#fff" stroke-width="2"/>
  <line x1="100" y1="480" x2="120" y2="520" stroke="#fff" stroke-width="2"/>
  <text x="100" y="545" text-anchor="middle" fill="#0ea5e9" font-size="13" font-weight="bold">Trip Editor</text>
  <text x="100" y="562" text-anchor="middle" fill="#94a3b8" font-size="11">(Contributor)</text>

  <!-- Actors Right: Viewer & Auditor -->
  <!-- Actor 3: Trip Viewer -->
  <circle cx="850" cy="220" r="18" fill="#94a3b8" stroke="#fff" stroke-width="2"/>
  <line x1="850" y1="238" x2="850" y2="280" stroke="#fff" stroke-width="2"/>
  <line x1="825" y1="255" x2="875" y2="255" stroke="#fff" stroke-width="2"/>
  <line x1="850" y1="280" x2="830" y2="320" stroke="#fff" stroke-width="2"/>
  <line x1="850" y1="280" x2="870" y2="320" stroke="#fff" stroke-width="2"/>
  <text x="850" y="345" text-anchor="middle" fill="#cbd5e1" font-size="13" font-weight="bold">Trip Viewer</text>
  <text x="850" y="362" text-anchor="middle" fill="#94a3b8" font-size="11">(Read-Only Access)</text>

  <!-- Actor 4: Security Admin -->
  <circle cx="850" cy="460" r="18" fill="#ef4444" stroke="#fff" stroke-width="2"/>
  <line x1="850" y1="478" x2="850" y2="520" stroke="#fff" stroke-width="2"/>
  <line x1="825" y1="495" x2="875" y2="495" stroke="#fff" stroke-width="2"/>
  <line x1="850" y1="520" x2="830" y2="560" stroke="#fff" stroke-width="2"/>
  <line x1="850" y1="520" x2="870" y2="560" stroke="#fff" stroke-width="2"/>
  <text x="850" y="585" text-anchor="middle" fill="#ef4444" font-size="13" font-weight="bold">Security Auditor</text>
  <text x="850" y="602" text-anchor="middle" fill="#94a3b8" font-size="11">(Compliance &amp; Logs)</text>

  <!-- Use Cases (Ellipses) -->
  <!-- UC1: Authenticate -->
  <ellipse cx="475" cy="140" rx="100" ry="25" fill="#334155" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="475" y="145" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">Authenticate User (JWT)</text>

  <!-- UC2: Create & Manage Trip -->
  <ellipse cx="360" cy="210" rx="105" ry="26" fill="#334155" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="360" y="215" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">Create &amp; Delete Trip</text>

  <!-- UC3: Delegate Roles -->
  <ellipse cx="590" cy="210" rx="105" ry="26" fill="#334155" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="590" y="215" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">Invite &amp; Delegate Roles</text>

  <!-- UC4: Add Destinations & Itinerary -->
  <ellipse cx="360" cy="300" rx="110" ry="26" fill="#334155" stroke="#0ea5e9" stroke-width="1.5"/>
  <text x="360" y="305" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">Schedule Itinerary &amp; Tasks</text>

  <!-- UC5: Record Expenses -->
  <ellipse cx="590" cy="300" rx="105" ry="26" fill="#334155" stroke="#10b981" stroke-width="1.5"/>
  <text x="590" y="305" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">Log Expenses &amp; Split</text>

  <!-- UC6: Reconcile Debts -->
  <ellipse cx="475" cy="390" rx="115" ry="26" fill="#334155" stroke="#10b981" stroke-width="1.5"/>
  <text x="475" y="395" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">Reconcile Debt Matrix</text>

  <!-- UC7: View Trip -->
  <ellipse cx="475" cy="480" rx="110" ry="26" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="475" y="485" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">View Route &amp; Expenses</text>

  <!-- UC8: Inspect Audit Logs -->
  <ellipse cx="475" cy="565" rx="105" ry="26" fill="#334155" stroke="#ef4444" stroke-width="1.5"/>
  <text x="475" y="570" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">Audit Security Events</text>

  <!-- Association Lines -->
  <!-- Owner connections -->
  <line x1="125" y1="215" x2="255" y2="210" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="125" y1="215" x2="485" y2="210" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="125" y1="215" x2="375" y2="140" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4"/>

  <!-- Editor connections -->
  <line x1="125" y1="455" x2="250" y2="305" stroke="#0ea5e9" stroke-width="1.5"/>
  <line x1="125" y1="455" x2="485" y2="305" stroke="#0ea5e9" stroke-width="1.5"/>
  <line x1="125" y1="455" x2="360" y2="390" stroke="#0ea5e9" stroke-width="1.5"/>

  <!-- Viewer connections -->
  <line x1="825" y1="255" x2="585" y2="480" stroke="#94a3b8" stroke-width="1.5"/>

  <!-- Auditor connections -->
  <line x1="825" y1="495" x2="580" y2="565" stroke="#ef4444" stroke-width="1.5"/>

  <!-- Include / Extend relationships -->
  <!-- UC2 includes UC1 -->
  <line x1="390" y1="184" x2="435" y2="160" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4"/>
  <text x="430" y="180" fill="#38bdf8" font-size="10">&lt;&lt;include&gt;&gt;</text>

  <!-- UC5 extends UC6 -->
  <line x1="560" y1="326" x2="505" y2="365" stroke="#10b981" stroke-width="1" stroke-dasharray="4"/>
  <text x="545" y="355" fill="#10b981" font-size="10">&lt;&lt;extend&gt;&gt;</text>
</svg>
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated: {filepath}")

def generate_er_diagram_svg(filepath):
    ensure_dir(filepath)
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="100%" height="100%" style="background:#0f172a; font-family:'Consolas','Segoe UI',sans-serif;">
  <!-- Title -->
  <text x="500" y="35" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="bold">TripMate — Relational Entity Relationship (ER) Data Model</text>

  <!-- USER Table -->
  <g transform="translate(40, 70)">
    <rect width="240" height="190" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <rect width="240" height="32" rx="8" fill="#0284c7"/>
    <text x="120" y="22" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">USER</text>
    <text x="15" y="55" fill="#f8fafc" font-size="12">🔑 id: VARCHAR (PK)</text>
    <text x="15" y="78" fill="#f8fafc" font-size="12">  email: VARCHAR (UNIQUE)</text>
    <text x="15" y="101" fill="#f8fafc" font-size="12">  passwordHash: VARCHAR</text>
    <text x="15" y="124" fill="#f8fafc" font-size="12">  name: VARCHAR</text>
    <text x="15" y="147" fill="#f8fafc" font-size="12">  role: VARCHAR [user|admin]</text>
    <text x="15" y="170" fill="#94a3b8" font-size="11">  createdAt: TIMESTAMP</text>
  </g>

  <!-- TRIP Table -->
  <g transform="translate(380, 70)">
    <rect width="240" height="210" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <rect width="240" height="32" rx="8" fill="#d97706"/>
    <text x="120" y="22" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">TRIP</text>
    <text x="15" y="55" fill="#f8fafc" font-size="12">🔑 id: VARCHAR (PK)</text>
    <text x="15" y="78" fill="#f8fafc" font-size="12">🔗 ownerId: VARCHAR (FK)</text>
    <text x="15" y="101" fill="#f8fafc" font-size="12">  title: VARCHAR</text>
    <text x="15" y="124" fill="#f8fafc" font-size="12">  startDate, endDate: DATE</text>
    <text x="15" y="147" fill="#f8fafc" font-size="12">  budget: DECIMAL(10,2)</text>
    <text x="15" y="170" fill="#f8fafc" font-size="12">  currency: VARCHAR(3)</text>
    <text x="15" y="193" fill="#f8fafc" font-size="12">  isPrivate: BOOLEAN</text>
  </g>

  <!-- COLLABORATOR Table (Join Entity) -->
  <g transform="translate(720, 70)">
    <rect width="240" height="170" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <rect width="240" height="32" rx="8" fill="#059669"/>
    <text x="120" y="22" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">COLLABORATOR</text>
    <text x="15" y="55" fill="#f8fafc" font-size="12">🔑 id: VARCHAR (PK)</text>
    <text x="15" y="78" fill="#f8fafc" font-size="12">🔗 tripId: VARCHAR (FK)</text>
    <text x="15" y="101" fill="#f8fafc" font-size="12">🔗 userId: VARCHAR (FK)</text>
    <text x="15" y="124" fill="#f8fafc" font-size="12">  role: [owner|editor|viewer]</text>
    <text x="15" y="147" fill="#94a3b8" font-size="11">  joinedAt: TIMESTAMP</text>
  </g>

  <!-- DESTINATION Table -->
  <g transform="translate(40, 360)">
    <rect width="240" height="190" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="2"/>
    <rect width="240" height="32" rx="8" fill="#7c3aed"/>
    <text x="120" y="22" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">DESTINATION</text>
    <text x="15" y="55" fill="#f8fafc" font-size="12">🔑 id: VARCHAR (PK)</text>
    <text x="15" y="78" fill="#f8fafc" font-size="12">🔗 tripId: VARCHAR (FK)</text>
    <text x="15" y="101" fill="#f8fafc" font-size="12">  name, city, country</text>
    <text x="15" y="124" fill="#f8fafc" font-size="12">  arrivalDate, departureDate</text>
    <text x="15" y="147" fill="#f8fafc" font-size="12">  orderIndex: INT</text>
    <text x="15" y="170" fill="#f8fafc" font-size="12">  notes: TEXT</text>
  </g>

  <!-- ITINERARY Table -->
  <g transform="translate(380, 360)">
    <rect width="240" height="220" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="2"/>
    <rect width="240" height="32" rx="8" fill="#db2777"/>
    <text x="120" y="22" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">ITINERARY_ITEM</text>
    <text x="15" y="55" fill="#f8fafc" font-size="12">🔑 id: VARCHAR (PK)</text>
    <text x="15" y="78" fill="#f8fafc" font-size="12">🔗 tripId: VARCHAR (FK)</text>
    <text x="15" y="101" fill="#f8fafc" font-size="12">🔗 destinationId: VARCHAR (FK)</text>
    <text x="15" y="124" fill="#f8fafc" font-size="12">🔗 assignedToUserId: (FK)</text>
    <text x="15" y="147" fill="#f8fafc" font-size="12">  title, time, location</text>
    <text x="15" y="170" fill="#f8fafc" font-size="12">  estimatedCost: DECIMAL</text>
    <text x="15" y="193" fill="#f8fafc" font-size="12">  isCompleted: BOOLEAN</text>
  </g>

  <!-- EXPENSE Table -->
  <g transform="translate(720, 360)">
    <rect width="240" height="230" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <rect width="240" height="32" rx="8" fill="#059669"/>
    <text x="120" y="22" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">EXPENSE</text>
    <text x="15" y="55" fill="#f8fafc" font-size="12">🔑 id: VARCHAR (PK)</text>
    <text x="15" y="78" fill="#f8fafc" font-size="12">🔗 tripId: VARCHAR (FK)</text>
    <text x="15" y="101" fill="#f8fafc" font-size="12">🔗 paidByUserId: VARCHAR (FK)</text>
    <text x="15" y="124" fill="#f8fafc" font-size="12">  amount: DECIMAL(10,2)</text>
    <text x="15" y="147" fill="#f8fafc" font-size="12">  category: VARCHAR</text>
    <text x="15" y="170" fill="#f8fafc" font-size="12">  splitWithUserIds: JSON</text>
    <text x="15" y="193" fill="#f8fafc" font-size="12">  isSettled: BOOLEAN</text>
  </g>

  <!-- Relationships Lines -->
  <!-- User to Trip (1:N) -->
  <line x1="280" y1="130" x2="380" y2="130" stroke="#38bdf8" stroke-width="2"/>
  <text x="330" y="120" fill="#38bdf8" font-size="11">1 : N</text>

  <!-- Trip to Collaborator (1:N) -->
  <line x1="620" y1="130" x2="720" y2="130" stroke="#f59e0b" stroke-width="2"/>
  <text x="670" y="120" fill="#f59e0b" font-size="11">1 : N</text>

  <!-- Trip to Destination (1:N) -->
  <path d="M 400 280 L 400 320 L 160 320 L 160 360" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <text x="260" y="315" fill="#f59e0b" font-size="11">1 : N</text>

  <!-- Trip to Itinerary (1:N) -->
  <line x1="500" y1="280" x2="500" y2="360" stroke="#f59e0b" stroke-width="2"/>
  <text x="510" y="325" fill="#f59e0b" font-size="11">1 : N</text>

  <!-- Trip to Expense (1:N) -->
  <path d="M 600 280 L 600 320 L 840 320 L 840 360" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <text x="700" y="315" fill="#f59e0b" font-size="11">1 : N</text>
</svg>
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated: {filepath}")

def generate_dfd_svg(filepath):
    ensure_dir(filepath)
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="100%" height="100%" style="background:#0f172a; font-family:'Segoe UI',sans-serif;">
  <!-- Title -->
  <text x="500" y="35" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="bold">TripMate — Level-1 Data Flow Diagram (DFD) &amp; Trust Boundaries</text>

  <!-- Trust Boundary 1: Client to DMZ / Gateway -->
  <rect x="250" y="70" width="710" height="580" rx="16" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="270" y="95" fill="#f43f5e" font-size="13" font-weight="bold">🛡️ TRUST BOUNDARY 1 (Public Client / Browser vs API Ingress)</text>

  <!-- Trust Boundary 2: Gateway to Internal Core Engine -->
  <rect x="470" y="120" width="470" height="510" rx="14" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="490" y="145" fill="#f59e0b" font-size="12" font-weight="bold">🛡️ TRUST BOUNDARY 2 (Auth Interceptor vs Core App Services)</text>

  <!-- External Entity: Travelers / Collaborators -->
  <rect x="30" y="240" width="170" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="115" y="275" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">TRAVELER /</text>
  <text x="115" y="295" text-anchor="middle" fill="#fff" font-weight="bold" font-size="14">COLLABORATOR</text>
  <text x="115" y="315" text-anchor="middle" fill="#94a3b8" font-size="11">[Untrusted Actor]</text>

  <!-- Process 1.0: Auth & JWT Session Verification -->
  <g transform="translate(280, 240)">
    <circle cx="65" cy="45" r="50" fill="#1e293b" stroke="#0ea5e9" stroke-width="2"/>
    <text x="65" y="40" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">1.0</text>
    <text x="65" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">Auth &amp; RBAC</text>
  </g>

  <!-- Process 2.0: Trip & Route Manager -->
  <g transform="translate(520, 180)">
    <circle cx="60" cy="45" r="48" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="60" y="40" text-anchor="middle" fill="#34d399" font-size="12" font-weight="bold">2.0</text>
    <text x="60" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">Trip &amp; Dest</text>
  </g>

  <!-- Process 3.0: Collaborative Itinerary Scheduler -->
  <g transform="translate(520, 320)">
    <circle cx="60" cy="45" r="48" fill="#1e293b" stroke="#8b5cf6" stroke-width="2"/>
    <text x="60" y="40" text-anchor="middle" fill="#a78bfa" font-size="12" font-weight="bold">3.0</text>
    <text x="60" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">Itinerary &amp; Tasks</text>
  </g>

  <!-- Process 4.0: Expense & Debt Reconciliation -->
  <g transform="translate(520, 460)">
    <circle cx="60" cy="45" r="48" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="60" y="40" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="bold">4.0</text>
    <text x="60" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">Expense Split</text>
  </g>

  <!-- Process 5.0: Security Audit Logger -->
  <g transform="translate(760, 460)">
    <circle cx="60" cy="45" r="48" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
    <text x="60" y="40" text-anchor="middle" fill="#f87171" font-size="12" font-weight="bold">5.0</text>
    <text x="60" y="55" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">Audit Trail</text>
  </g>

  <!-- Data Stores (Open-ended rects) -->
  <!-- D1: User Store -->
  <g transform="translate(740, 170)">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#38bdf8" stroke-width="2"/>
    <line x1="0" y1="40" x2="160" y2="40" stroke="#38bdf8" stroke-width="2"/>
    <line x1="0" y1="0" x2="0" y2="40" stroke="#38bdf8" stroke-width="2"/>
    <text x="15" y="25" fill="#f8fafc" font-size="12">D1: Users &amp; Auth</text>
  </g>

  <!-- D2: Trips & Itinerary Store -->
  <g transform="translate(740, 260)">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#10b981" stroke-width="2"/>
    <line x1="0" y1="40" x2="160" y2="40" stroke="#10b981" stroke-width="2"/>
    <line x1="0" y1="0" x2="0" y2="40" stroke="#10b981" stroke-width="2"/>
    <text x="15" y="25" fill="#f8fafc" font-size="12">D2: Trips &amp; Routes</text>
  </g>

  <!-- D3: Expenses & Ledger Store -->
  <g transform="translate(740, 350)">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#f59e0b" stroke-width="2"/>
    <line x1="0" y1="40" x2="160" y2="40" stroke="#f59e0b" stroke-width="2"/>
    <line x1="0" y1="0" x2="0" y2="40" stroke="#f59e0b" stroke-width="2"/>
    <text x="15" y="25" fill="#f8fafc" font-size="12">D3: Expense Ledger</text>
  </g>

  <!-- Data Flows -->
  <line x1="200" y1="285" x2="280" y2="285" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="210" y="275" fill="#94a3b8" font-size="10">Credentials / JWT</text>

  <line x1="400" y1="260" x2="520" y2="225" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="400" y1="285" x2="520" y2="365" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="400" y1="310" x2="520" y2="495" stroke="#38bdf8" stroke-width="1.5"/>

  <!-- Store connections -->
  <line x1="640" y1="225" x2="740" y2="280" stroke="#10b981" stroke-width="1.5"/>
  <line x1="640" y1="365" x2="740" y2="280" stroke="#8b5cf6" stroke-width="1.5"/>
  <line x1="640" y1="505" x2="740" y2="370" stroke="#f59e0b" stroke-width="1.5"/>

  <!-- Audit dispatch -->
  <line x1="640" y1="505" x2="760" y2="505" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="680" y="495" fill="#ef4444" font-size="10">Security Event</text>
</svg>
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated: {filepath}")

def generate_attack_tree_svg(filepath):
    ensure_dir(filepath)
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="100%" height="100%" style="background:#0f172a; font-family:'Segoe UI',sans-serif;">
  <text x="500" y="35" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="bold">TripMate — Security Attack Tree &amp; Defense Controls</text>

  <!-- Root Goal -->
  <rect x="250" y="60" width="500" height="55" rx="10" fill="#991b1b" stroke="#f87171" stroke-width="2"/>
  <text x="500" y="93" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">ROOT GOAL: Exfiltrate Private Trip Plans OR Falsify Group Expenses</text>

  <!-- Sub-Goals Level 1 -->
  <!-- Sub 1: BOLA/IDOR -->
  <rect x="50" y="180" width="260" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="180" y="210" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="bold">[OR] 1.0 Bypass Access Control (IDOR)</text>

  <!-- Sub 2: Token Theft -->
  <rect x="370" y="180" width="260" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="500" y="210" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="bold">[OR] 2.0 Hijack Session Token / Auth</text>

  <!-- Sub 3: Financial Ledger Tampering -->
  <rect x="690" y="180" width="260" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="820" y="210" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="bold">[OR] 3.0 Manipulate Split Ledger</text>

  <!-- Connect Root to Sub-goals -->
  <line x1="500" y1="115" x2="180" y2="180" stroke="#f87171" stroke-width="2"/>
  <line x1="500" y1="115" x2="500" y2="180" stroke="#f87171" stroke-width="2"/>
  <line x1="500" y1="115" x2="820" y2="180" stroke="#f87171" stroke-width="2"/>

  <!-- Leaf Attacks Level 2 -->
  <!-- Path 1.1 -->
  <rect x="30" y="290" width="140" height="80" rx="6" fill="#334155" stroke="#ef4444" stroke-width="1.5"/>
  <text x="100" y="320" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">1.1 Parameter</text>
  <text x="100" y="336" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Tampering on</text>
  <text x="100" y="352" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">tripId in API</text>

  <!-- Path 1.2 -->
  <rect x="190" y="290" width="140" height="80" rx="6" fill="#334155" stroke="#ef4444" stroke-width="1.5"/>
  <text x="260" y="320" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">1.2 Forced Role</text>
  <text x="260" y="336" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Escalation via</text>
  <text x="260" y="352" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Direct PUT</text>

  <!-- Path 2.1 -->
  <rect x="350" y="290" width="140" height="80" rx="6" fill="#334155" stroke="#ef4444" stroke-width="1.5"/>
  <text x="420" y="320" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">2.1 Brute Force</text>
  <text x="420" y="336" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Credential</text>
  <text x="420" y="352" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Stuffing</text>

  <!-- Path 2.2 -->
  <rect x="510" y="290" width="140" height="80" rx="6" fill="#334155" stroke="#ef4444" stroke-width="1.5"/>
  <text x="580" y="320" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">2.2 XSS Script</text>
  <text x="580" y="336" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Injection to</text>
  <text x="580" y="352" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Steal JWT</text>

  <!-- Path 3.1 -->
  <rect x="680" y="290" width="130" height="80" rx="6" fill="#334155" stroke="#ef4444" stroke-width="1.5"/>
  <text x="745" y="320" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">3.1 Floating Point</text>
  <text x="745" y="336" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Drift Injection</text>
  <text x="745" y="352" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">(Negative Amt)</text>

  <!-- Path 3.2 -->
  <rect x="830" y="290" width="130" height="80" rx="6" fill="#334155" stroke="#ef4444" stroke-width="1.5"/>
  <text x="895" y="320" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">3.2 Race Condition</text>
  <text x="895" y="336" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">on Expense</text>
  <text x="895" y="352" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="600">Settlement</text>

  <!-- Lines from Sub to Leaves -->
  <line x1="180" y1="230" x2="100" y2="290" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="180" y1="230" x2="260" y2="290" stroke="#94a3b8" stroke-width="1.5"/>

  <line x1="500" y1="230" x2="420" y2="290" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="500" y1="230" x2="580" y2="290" stroke="#94a3b8" stroke-width="1.5"/>

  <line x1="820" y1="230" x2="745" y2="290" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="820" y1="230" x2="895" y2="290" stroke="#94a3b8" stroke-width="1.5"/>

  <!-- Mitigations Box (Controls Layer) -->
  <rect x="30" y="440" width="940" height="130" rx="12" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
  <text x="50" y="470" fill="#34d399" font-size="14" font-weight="bold">🛡️ IMPLEMENTED PREVENTIVE &amp; DETECTIVE CONTROLS</text>
  <text x="50" y="495" fill="#f8fafc" font-size="12">✓ Control 1: requireTripRole Middleware blocks any access unless user is verified collaborator in DB (IDOR defense).</text>
  <text x="50" y="515" fill="#f8fafc" font-size="12">✓ Control 2: Rate Limiting (authLimiter) &amp; Bcrypt salt rounds (10) halt brute-force credential attacks.</text>
  <text x="50" y="535" fill="#f8fafc" font-size="12">✓ Control 3: Content-Security-Policy &amp; HTML entity escaping neutralize DOM XSS and cookie/token exfiltration.</text>
  <text x="50" y="555" fill="#f8fafc" font-size="12">✓ Control 4: Strict Schema Validation &amp; Atomic Write Locking ensure financial zero-sum conservation.</text>
</svg>
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated: {filepath}")

def generate_burndown_svg(filepath):
    ensure_dir(filepath)
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 480" width="100%" height="100%" style="background:#0f172a; font-family:'Segoe UI',sans-serif;">
  <text x="425" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="bold">TripMate — Sprint 2 Burndown Chart (Story Points vs Time)</text>
  
  <!-- Chart area -->
  <rect x="80" y="70" width="700" height="320" fill="#1e293b" rx="8" stroke="#334155"/>

  <!-- Grid lines -->
  <line x1="80" y1="134" x2="780" y2="134" stroke="#334155" stroke-dasharray="4"/>
  <line x1="80" y1="198" x2="780" y2="198" stroke="#334155" stroke-dasharray="4"/>
  <line x1="80" y1="262" x2="780" y2="262" stroke="#334155" stroke-dasharray="4"/>
  <line x1="80" y1="326" x2="780" y2="326" stroke="#334155" stroke-dasharray="4"/>

  <!-- Y-Axis labels (Story points: 26 to 0) -->
  <text x="65" y="75" text-anchor="end" fill="#94a3b8" font-size="11">26 pts</text>
  <text x="65" y="139" text-anchor="end" fill="#94a3b8" font-size="11">20 pts</text>
  <text x="65" y="203" text-anchor="end" fill="#94a3b8" font-size="11">15 pts</text>
  <text x="65" y="267" text-anchor="end" fill="#94a3b8" font-size="11">10 pts</text>
  <text x="65" y="331" text-anchor="end" fill="#94a3b8" font-size="11">5 pts</text>
  <text x="65" y="395" text-anchor="end" fill="#94a3b8" font-size="11">0 pts</text>

  <!-- X-Axis labels (Days 1 to 10) -->
  <text x="80" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 1</text>
  <text x="157" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 2</text>
  <text x="235" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 3</text>
  <text x="313" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 4</text>
  <text x="391" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 5</text>
  <text x="468" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 6</text>
  <text x="546" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 7</text>
  <text x="624" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 8</text>
  <text x="702" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 9</text>
  <text x="780" y="415" text-anchor="middle" fill="#94a3b8" font-size="11">Day 10</text>

  <!-- Ideal Trend Line (Grey Dashed: 26 to 0) -->
  <line x1="80" y1="70" x2="780" y2="390" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6"/>

  <!-- Actual Burndown Line (Vibrant Cyan) -->
  <!-- D1: 26 (y=70), D2: 24 (y=95), D3: 21 (y=132), D4: 18 (y=169), D5: 14 (y=218), D6: 11 (y=255), D7: 8 (y=292), D8: 5 (y=329), D9: 2 (y=365), D10: 0 (y=390) -->
  <polyline points="80,70 157,95 235,132 313,169 391,218 468,255 546,292 624,329 702,365 780,390"
            fill="none" stroke="#06b6d4" stroke-width="3.5"/>

  <!-- Actual Data Points -->
  <circle cx="80" cy="70" r="5" fill="#06b6d4"/>
  <circle cx="157" cy="95" r="5" fill="#06b6d4"/>
  <circle cx="235" cy="132" r="5" fill="#06b6d4"/>
  <circle cx="313" cy="169" r="5" fill="#06b6d4"/>
  <circle cx="391" cy="218" r="5" fill="#06b6d4"/>
  <circle cx="468" cy="255" r="5" fill="#06b6d4"/>
  <circle cx="546" cy="292" r="5" fill="#06b6d4"/>
  <circle cx="624" cy="329" r="5" fill="#06b6d4"/>
  <circle cx="702" cy="365" r="5" fill="#06b6d4"/>
  <circle cx="780" cy="390" r="5" fill="#10b981"/>

  <!-- Legend -->
  <g transform="translate(560, 90)">
    <line x1="0" y1="10" x2="25" y2="10" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4"/>
    <text x="35" y="14" fill="#94a3b8" font-size="12">Ideal Guideline</text>

    <line x1="0" y1="30" x2="25" y2="30" stroke="#06b6d4" stroke-width="3"/>
    <text x="35" y="34" fill="#06b6d4" font-size="12">Actual Velocity Burn</text>
  </g>
</svg>
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated: {filepath}")

def main():
    print("Generating diagrams...")
    generate_use_case_svg("deliverables/phase_03_requirements_analysis_uml/diagrams/use_case_diagram.svg")
    generate_er_diagram_svg("deliverables/phase_04_data_information_flow/diagrams/er_diagram.svg")
    generate_dfd_svg("deliverables/phase_04_data_information_flow/diagrams/dfd_level_1_trust_boundaries.svg")
    generate_attack_tree_svg("deliverables/phase_08_attack_tree_refinement/diagrams/attack_tree.svg")
    generate_burndown_svg("deliverables/phase_10_sprint_execution_metrics/diagrams/sprint_burndown_chart.svg")
    print("All core vector diagrams generated successfully.")

if __name__ == "__main__":
    main()
