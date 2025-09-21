# Customer Journey Management System - Flow Diagrams

This document contains detailed flow diagrams for all user stories in the Customer Journey Management system.

## Story CJ-001: Customer Registration and Onboarding Flow

```mermaid
flowchart TD
    A[New Customer Visits Registration Page] --> B{Valid Registration Info?}
    B -->|No| C[Show Validation Errors]
    C --> A
    B -->|Yes| D[Create Account in Pending Status]
    D --> E[Send Email & SMS Verification Codes]
    E --> F[Redirect to Verification Page]
    F --> G[Customer Enters Verification Codes]
    G --> H{Codes Valid & Not Expired?}
    H -->|No| I{Attempts < 3?}
    I -->|Yes| J[Show Error Message]
    J --> K[Offer Resend Option After 60s]
    K --> G
    I -->|No| L[Account Lockout for 24 Hours]
    H -->|Yes| M[Change Account Status to Active]
    M --> N[Auto Login Customer]
    N --> O[Redirect to Profile Completion]
    O --> P[Customer Completes Mandatory Fields]
    P --> Q{Profile Complete?}
    Q -->|No| R[Show Required Field Errors]
    R --> P
    Q -->|Yes| S[Mark Profile as Complete]
    S --> T[Customer Uploads KYC Documents]
    T --> U[Virus Scan Documents]
    U --> V{Scan Passed?}
    V -->|No| W[Reject Documents & Notify]
    W --> T
    V -->|Yes| X[Set Document Status: Under Review]
    X --> Y[Send Confirmation Email]
    Y --> Z[Notify Admin for Review]
    Z --> AA[Grant Full Booking Access]
    
    style A fill:#e1f5fe
    style AA fill:#c8e6c9
    style L fill:#ffcdd2
```

## Story CJ-002: Advanced Booking Request Creation Flow

```mermaid
flowchart TD
    A[Verified Customer Accesses Create Booking] --> B[Enter Pickup & Delivery Locations]
    B --> C[System Validates Addresses]
    C --> D{Addresses Valid?}
    D -->|No| E[Show Address Errors]
    E --> B
    D -->|Yes| F[Calculate Route Distance & Time]
    F --> G{Within Service Area & Distance Limits?}
    G -->|No| H[Show Service Area/Distance Error]
    H --> B
    G -->|Yes| I[Display Route & Estimated Time]
    I --> J[Customer Enters Cargo Details]
    J --> K[System Validates Cargo Specs]
    K --> L{Weight/Dimension Compatible?}
    L -->|No| M[Show Cargo Validation Errors]
    M --> J
    L -->|Yes| N[Filter & Display Suggested Trucks]
    N --> O[Calculate Special Handling Fees]
    O --> P[Customer Sets Schedule & Timeline]
    P --> Q[Check Driver/Truck Availability]
    Q --> R{Availability Found?}
    R -->|No| S[Show Alternative Time Slots]
    S --> P
    R -->|Yes| T[Highlight Available Slots]
    T --> U[Show Express/Urgent Options with Costs]
    U --> V[Customer Adds Special Instructions]
    V --> W[Validate Instructions Completeness]
    W --> X[Calculate Additional Service Costs]
    X --> Y[Customer Requests Quote]
    Y --> Z[System Calculates Comprehensive Pricing]
    Z --> AA[Display Quote Breakdown Within 5s]
    AA --> BB[Set Quote Validity: 24 Hours]
    
    style A fill:#e1f5fe
    style BB fill:#c8e6c9
```

## Story CJ-003: Smart Truck Selection and Booking Confirmation Flow

```mermaid
flowchart TD
    A[Customer Has Valid Quote] --> B[System Searches Available Trucks]
    B --> C[Filter Trucks by Cargo Compatibility]
    C --> D[Apply Best Match Algorithm]
    D --> E[Display Truck Listings with Details]
    E --> F{Customer Wants to Compare?}
    F -->|Yes| G[Select Up to 3 Trucks]
    G --> H[Show Side-by-Side Comparison]
    H --> I[Customer Reviews Comparison]
    I --> J[Select Preferred Truck]
    F -->|No| J
    J --> K[View Driver Profile & Reviews]
    K --> L[Review Driver Performance Metrics]
    L --> M[Customer Selects Truck]
    M --> N[Proceed to Booking Confirmation]
    N --> O[Review All Booking Details]
    O --> P[Select Payment Method]
    P --> Q[Accept Terms & Conditions]
    Q --> R{Payment Processed?}
    R -->|No| S[Show Payment Error]
    S --> P
    R -->|Yes| T[Generate Unique Booking Reference]
    T --> U[Confirm Booking in System]
    U --> V[Send Confirmation via Email & SMS]
    V --> W[Notify Driver of Assignment]
    W --> X{Customer Needs Modification?}
    X -->|Yes| Y{Within Modification Window?}
    Y -->|Yes| Z[Process Modification]
    Z --> AA[Update Driver & Customer]
    Y -->|No| BB[Apply Modification/Cancellation Fees]
    BB --> Z
    X -->|No| CC[Booking Confirmed & Active]
    
    style A fill:#e1f5fe
    style CC fill:#c8e6c9
    style S fill:#ffcdd2
```

## Story CJ-004: Real-time Shipment Tracking Flow

```mermaid
flowchart TD
    A[Booking Confirmed & Driver Assigned] --> B[Customer Accesses Tracking Page]
    B --> C[Display Interactive Map with Real-time Location]
    C --> D[Update Truck Position Every 30s]
    D --> E[Calculate & Update ETA]
    E --> F[Show Route with Completed/Remaining Portions]
    F --> G[Driver Status Change Occurs]
    G --> H[Send Automatic SMS & Push Notifications]
    H --> I[Update Status Timeline in App]
    I --> J{Customer Needs Communication?}
    J -->|Yes| K[Use In-App Communication]
    K --> L[Call Driver with Masked Numbers]
    K --> M[Send Text Messages Through App]
    K --> N[Share Photos/Voice Messages]
    J -->|No| O[Continue Tracking]
    O --> P{Delivery Status?}
    P -->|En Route| D
    P -->|Arrived at Delivery| Q[Driver Completes Delivery Process]
    Q --> R[Capture GPS Coordinates & Timestamp]
    R --> S[Get Digital Signature]
    S --> T[Take Photos of Delivered Cargo]
    T --> U[Document Any Damage/Discrepancies]
    U --> V[Generate Delivery Confirmation]
    V --> W[Send Delivery Proof to Customer]
    W --> X[Generate & Send Invoice]
    X --> Y[Customer Reviews Trip Analytics]
    Y --> Z[Customer Rates Driver & Service]
    Z --> AA[Customer Provides Detailed Feedback]
    AA --> BB[Store Trip Data for Future Reference]
    
    style A fill:#e1f5fe
    style BB fill:#c8e6c9
```

## Master Customer Journey Flow

```mermaid
flowchart TD
    A[New Customer] --> B[Registration & Onboarding<br/>CJ-001]
    B --> C[Verified Customer Profile]
    C --> D[Create Booking Request<br/>CJ-002]
    D --> E[Valid Quote Generated]
    E --> F[Truck Selection & Confirmation<br/>CJ-003]
    F --> G[Confirmed Booking]
    G --> H[Real-time Tracking<br/>CJ-004]
    H --> I[Successful Delivery]
    I --> J[Customer Feedback & Analytics]
    J --> K{Future Booking?}
    K -->|Yes| D
    K -->|No| L[End of Journey]
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
    style C fill:#fff3e0
    style E fill:#fff3e0
    style G fill:#fff3e0
    style I fill:#fff3e0
```

## Key Process States and Business Rules

### Registration Process States
- **Pending**: Account created, awaiting verification
- **Active**: Email/SMS verified, can complete profile
- **Complete**: Profile completed, KYC uploaded
- **Approved**: Admin approved, full access granted
- **Locked**: Too many failed verification attempts

### Booking Process States
- **Draft**: Booking being created
- **Quoted**: Quote generated and valid
- **Confirmed**: Payment processed, booking confirmed
- **Assigned**: Driver assigned to booking
- **In Transit**: Cargo picked up and en route
- **Delivered**: Cargo successfully delivered
- **Completed**: Customer feedback received

### Key Business Rules
1. **Service Area Validation**: Both pickup and delivery must be within service areas
2. **Distance Limits**: 1km minimum, 1000km maximum per booking
3. **Weight Limits**: 1kg to 50,000kg capacity
4. **Dimension Limits**: Max 15m x 3m x 4m
5. **Advance Booking**: Minimum 2 hours for standard service
6. **Modification Windows**: Free changes up to 24 hours before pickup
7. **Cancellation Fees**: Graduated fees based on timing (25% within 24hrs, 50% within 2hrs)

### Performance Requirements
- Quote generation: Within 5 seconds
- GPS tracking updates: Every 30 seconds
- Document upload: Complete within 30 seconds
- Virus scanning: Complete within 5 seconds
- Map updates: Real-time with 30-second refresh