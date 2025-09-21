## Customer Journey Management — End-to-End Flow

```mermaid
flowchart TD
  %% EPIC 1: CUSTOMER JOURNEY MANAGEMENT (Truck Transportation Management System)

  %% ───────── CJ-001: Customer Registration & Onboarding ─────────
  subgraph CJ001[ CJ-001: Registration & Onboarding ]
    A1([Start]) --> A2[Registration form]
    A2 --> A3{Inputs valid?\n• Email unique\n• Phone format (UAE/GCC)\n• Password rules\n• Company reg no.}
    A3 -- Yes --> A4[Create account\nstatus: Pending Verification]
    A3 -- No --> A2E[Show validation errors]
    A2E --> A2

    A4 --> A5[Send Email + SMS codes]
    A5 --> A6[Redirect to Verification page]
    A6 --> A7{Codes valid?}
    A7 -- Yes --> A8[Activate account]
    A8 --> A9[Auto-login → Profile completion page]
    A7 -- No --> A7E[Show error; increment attempts]
    A7E --> A7C{Attempts ≥ 3?}
    A7C -- Yes --> A7L[Lock account 24h]
    A7L --> A7R[Resend allowed after 60s]
    A7C -- No --> A7R[Resend allowed after 60s]
    A7R --> A6

    A9 --> A10[Complete mandatory profile fields\n(business license, billing address, contact person)]
    A10 --> A11[Validate: Emirates ID/Trade License,\nAddress verification, Document uploads (PDF/JPG/PNG ≤5MB)]
    A11 --> A12{KYC documents uploaded?}
    A12 -- Yes --> A13[Scan for viruses + validate]
    A13 --> A14[Set doc status: "Under Review"]
    A14 --> A15[Notify admin + send confirmation email]
    A15 --> A16[Queue profile for admin approval]
    A16 --> A17[Mark profile complete → Grant booking access]
    A12 -- No --> A17[Mark profile complete → Grant booking access]
  end

  %% ───────── CJ-002: Advanced Booking Request Creation ─────────
  subgraph CJ002[ CJ-002: Advanced Booking Request Creation ]
    B1([Create Booking]) --> B2[Enter pickup & delivery\nvia search or map]
    B2 --> B3[Validate addresses\n& calculate route distance/time]
    B3 --> B4{Within service rules?\n• In service areas\n• 1–1000 km\n• Geocoding OK}
    B4 -- Yes --> B5[Proceed to Cargo Specification]
    B4 -- No --> B2E[Show validation errors]
    B2E --> B2

    B5 --> B6[Enter cargo type, weight, dimensions, special reqs]
    B6 --> B7[Validate compatibility\nFilter suggested truck types\nCalculate special handling fees]
    B7 --> B8{Within cargo limits?\n• 1–50,000 kg\n• ≤15m × 3m × 4m\n• Hazmat cert\n• Refrigeration temp\n• Fragile handling}
    B8 -- Yes --> B9[Proceed to Scheduling]
    B8 -- No --> B6E[Show incompatibility; adjust inputs]
    B6E --> B6

    B9 --> B10[Select preferred pickup/delivery slots]
    B10 --> B11[Check driver/truck availability\nHighlight available slots]
    B11 --> B12[Apply time-based surcharges\n(Express +50%, Weekend/Holiday +25%,\nPeak hours +15%, Min 2h advance)]
    B12 --> B13[Add Special Instructions]

    B13 --> B14[Enter instructions (contacts, access codes, equipment, escort, windows)]
    B14 --> B15[Validate completeness\nCalculate additional costs\nFlag requirements for assignment]
    B15 --> B16[Request real-time quote]

    B16 --> B17[Calculate pricing (≤5s)\nBase rate + Distance + Weight + Special cargo + Time + Fuel + VAT]
    B17 --> B18[Display quote + cost breakdown\nValidity: 24 hours]
  end

  %% ───────── CJ-003: Smart Truck Selection & Booking Confirmation ─────────
  subgraph CJ003[ CJ-003: Smart Truck Selection & Booking Confirmation ]
    C1([From Quote]) --> C2[Search available trucks]
    C2 --> C3[Display filtered trucks\n(details, driver info, ratings, pricing, ETA)]
    C3 --> C4[Option: Compare up to 3 trucks side-by-side]
    C3 --> C5[View driver profile & reviews\n(on-time rate, damage rate, certifications)]
    C4 --> C6[Select truck]
    C5 --> C6[Select truck]
    C6 --> C7[Review booking summary]
    C7 --> C8[Choose payment method\n(Card, Bank transfer, Corporate credit, Pay on delivery, Split)]
    C8 --> C9[Accept Terms & Conditions]
    C9 --> C10{Payment/approval successful?}
    C10 -- Yes --> C11[Confirm booking\nGenerate unique reference]
    C11 --> C12[Send confirmation via Email & SMS]
    C10 -- No --> C10E[Show failure; retry or choose different method]

    C12 --> C13{Need to modify or cancel?}
    C13 -- No --> C14[Proceed to assignment & tracking]
    C13 -- Yes --> C15[Apply modification/cancellation rules\n• Free mods ≤24h\n• 10% mods <24h\n• 25% cancel <24h\n• 50% cancel <2h\n• No refund: no-show/last-minute]
    C15 --> C16[Notify driver automatically\nInitiate refund if applicable]
  end

  %% ───────── CJ-004: Real-time Shipment Tracking ─────────
  subgraph CJ004[ CJ-004: Real-time Shipment Tracking ]
    D1([Booking confirmed & driver assigned]) --> D2[Tracking page]
    D2 --> D3[Live GPS map (30s updates)\nRoute, ETA, traffic, markers, geofences]
    D3 --> D4[Status updates via SMS & push\nTimeline in app]
    D4 --> D5[Communication with driver\nMasked calls, in-app messages, voice, photos, emergency, translation]
    D5 --> D6[Delivery completed]
    D6 --> D7[Proof of delivery\nTimestamp, GPS, photos, signature, damage notes]
    D7 --> D8[Auto-generate invoice]
    D8 --> D9[Post-trip analytics\nDistance vs planned, time variance, route efficiency, fuel, performance, cost]
    D9 --> D10[Rate driver & provide feedback]
    D10 --> D11([End])
  end

  %% High-level path across subgraphs
  A17 -.→ B1
  B18 -.→ C1
  C14 -.→ D1
  C16 -.→ D1
```

Notes
- This diagram groups the end-to-end flow into four subgraphs matching `CJ-001` to `CJ-004`.
- Decision points reflect acceptance criteria and business rules drawn from the document.
- Time-based rules and surcharges are shown as annotations within the relevant steps.

