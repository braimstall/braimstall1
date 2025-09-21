# Detailed Acceptance Criteria Flow Diagrams

This document contains granular flow diagrams for each acceptance criteria within the user stories.

## CJ-001: Customer Registration and Onboarding

### AC-001: Account Creation Flow

```mermaid
flowchart TD
    A[User on Registration Page] --> B[Enter Registration Information]
    B --> C{Email Unique?}
    C -->|No| D[Show Email Already Exists Error]
    D --> B
    C -->|Yes| E{Phone Number Valid UAE/GCC Format?}
    E -->|No| F[Show Invalid Phone Format Error]
    F --> B
    E -->|Yes| G{Password Meets Security Requirements?}
    G -->|No| H[Show Password Requirements Error]
    H --> B
    G -->|Yes| I{Company Registration Valid?}
    I -->|No| J[Show Company Registration Error]
    J --> B
    I -->|Yes| K[Create Account with Pending Status]
    K --> L[Generate Email Verification Code]
    L --> M[Generate SMS Verification Code]
    M --> N[Send Email with Verification Code]
    N --> O[Send SMS with Verification Code]
    O --> P[Redirect to Verification Page]
    
    style A fill:#e1f5fe
    style P fill:#c8e6c9
```

### AC-002: Account Verification Flow

```mermaid
flowchart TD
    A[User on Verification Page] --> B[Enter Email Verification Code]
    B --> C[Enter SMS Verification Code]
    C --> D[Submit Verification Codes]
    D --> E{Email Code Valid & Not Expired?}
    E -->|No| F[Show Email Code Error]
    F --> G{Attempts < 3?}
    G -->|Yes| H[Increment Attempt Counter]
    H --> I[Show Resend Option After 60s]
    I --> A
    G -->|No| J[Lock Account for 24 Hours]
    E -->|Yes| K{SMS Code Valid & Not Expired?}
    K -->|No| F
    K -->|Yes| L[Change Account Status to Active]
    L --> M[Generate Authentication Token]
    M --> N[Auto Login User]
    N --> O[Redirect to Profile Completion]
    
    style A fill:#e1f5fe
    style O fill:#c8e6c9
    style J fill:#ffcdd2
```

### AC-003: Profile Completion Flow

```mermaid
flowchart TD
    A[User on Profile Completion Page] --> B[Enter Business License Number]
    B --> C{Emirates ID/Trade License Valid?}
    C -->|No| D[Show License Validation Error]
    D --> B
    C -->|Yes| E[Enter Billing Address]
    E --> F[Verify Address Through Mapping Service]
    F --> G{Address Verified?}
    G -->|No| H[Show Address Verification Error]
    H --> E
    G -->|Yes| I[Enter Contact Person Details]
    I --> J[Submit Profile Information]
    J --> K[Mark Profile as Complete]
    K --> L[Enable Full Booking Functionality]
    L --> M[Queue Profile for Admin Approval]
    
    style A fill:#e1f5fe
    style M fill:#c8e6c9
```

### AC-004: KYC Document Upload Flow

```mermaid
flowchart TD
    A[User Selects Document Upload] --> B[Choose Trade License File]
    B --> C{File Valid Format & Size?}
    C -->|No| D[Show File Format/Size Error]
    D --> B
    C -->|Yes| E[Choose Emirates ID File]
    E --> F{File Valid Format & Size?}
    F -->|No| G[Show File Format/Size Error]
    G --> E
    F -->|Yes| H[Choose Authorization Letter]
    H --> I{File Valid Format & Size?}
    I -->|No| J[Show File Format/Size Error]
    J --> H
    I -->|Yes| K[Upload All Documents]
    K --> L[Perform Virus Scan on All Files]
    L --> M{All Files Pass Virus Scan?}
    M -->|No| N[Reject Upload & Show Error]
    N --> A
    M -->|Yes| O[Compress Images > 2MB]
    O --> P[Set Document Status: Under Review]
    P --> Q[Send Confirmation Email to Customer]
    Q --> R[Send Notification to Admin]
    
    style A fill:#e1f5fe
    style R fill:#c8e6c9
```

## CJ-002: Advanced Booking Request Creation

### AC-001: Basic Booking Information Flow

```mermaid
flowchart TD
    A[User on Create Booking Page] --> B[Enter/Select Pickup Location]
    B --> C[Use Address Search or Map Selection]
    C --> D[System Geocodes Address]
    D --> E{Address Geocoding Accurate?}
    E -->|No| F[Show Address Accuracy Error]
    F --> B
    E -->|Yes| G[Enter/Select Delivery Location]
    G --> H[Use Address Search or Map Selection]
    H --> I[System Geocodes Address]
    I --> J{Address Geocoding Accurate?}
    J -->|No| K[Show Address Accuracy Error]
    K --> G
    J -->|Yes| L[Calculate Route Distance]
    L --> M{Distance >= 1km and <= 1000km?}
    M -->|No| N[Show Distance Validation Error]
    N --> B
    M -->|Yes| O{Both Locations in Service Areas?}
    O -->|No| P[Show Service Area Error]
    P --> B
    O -->|Yes| Q[Calculate Estimated Travel Time]
    Q --> R[Display Route on Map]
    R --> S[Highlight Available Service Areas]
    
    style A fill:#e1f5fe
    style S fill:#c8e6c9
```

### AC-002: Cargo Specification Flow

```mermaid
flowchart TD
    A[User Enters Cargo Details] --> B[Select Cargo Type from List]
    B --> C[Enter Cargo Weight]
    C --> D{Weight Between 1kg - 50,000kg?}
    D -->|No| E[Show Weight Range Error]
    E --> C
    D -->|Yes| F[Enter Cargo Dimensions]
    F --> G{Dimensions Within Max Limits?}
    G -->|No| H[Show Dimension Limit Error]
    H --> F
    G -->|Yes| I{Hazardous Materials?}
    I -->|Yes| J{Special Certification Available?}
    J -->|No| K[Show Certification Required Error]
    K --> B
    J -->|Yes| L[Apply Hazardous Material Rules]
    I -->|No| M{Refrigerated Goods?}
    M -->|Yes| N[Enter Temperature Range]
    N --> O[Apply Refrigeration Requirements]
    M -->|No| P{Fragile Items?}
    P -->|Yes| Q[Confirm Special Handling]
    Q --> R[Apply Fragile Item Rules]
    P -->|No| S[Validate Weight/Dimension Compatibility]
    L --> S
    O --> S
    R --> S
    S --> T[Filter Compatible Truck Types]
    T --> U[Calculate Special Handling Fees]
    U --> V[Display Suggested Trucks]
    
    style A fill:#e1f5fe
    style V fill:#c8e6c9
```

### AC-003: Scheduling and Timeline Flow

```mermaid
flowchart TD
    A[User Sets Pickup Schedule] --> B[Select Preferred Date]
    B --> C{Date >= Current Date + 2 Hours?}
    C -->|No| D[Show Minimum Advance Booking Error]
    D --> B
    C -->|Yes| E[Select Time Slot]
    E --> F[Check Driver/Truck Availability]
    F --> G{Availability Found?}
    G -->|No| H[Show Alternative Time Slots]
    H --> E
    G -->|Yes| I{Express Service Requested?}
    I -->|Yes| J[Apply 50% Express Surcharge]
    I -->|No| K{Weekend/Holiday Booking?}
    K -->|Yes| L[Apply 25% Weekend/Holiday Surcharge]
    K -->|No| M{Peak Hours (7-9 AM, 5-7 PM)?}
    M -->|Yes| N[Apply 15% Peak Hours Surcharge]
    M -->|No| O[Standard Pricing Applied]
    J --> P[Highlight Available Time Slots]
    L --> P
    N --> P
    O --> P
    P --> Q[Display Total Scheduling Cost]
    
    style A fill:#e1f5fe
    style Q fill:#c8e6c9
```

### AC-004: Special Instructions Flow

```mermaid
flowchart TD
    A[User Adds Special Instructions] --> B{Multiple Pickup/Delivery Points?}
    B -->|Yes| C[Enter Additional Addresses]
    C --> D[Calculate Multi-Point Routing]
    D --> E[Apply Multi-Point Surcharge]
    B -->|No| F{Special Equipment Needed?}
    F -->|Yes| G[Select Required Equipment]
    G --> H[Check Equipment Availability]
    H --> I[Apply Equipment Fees]
    F -->|No| J{Security Escort Required?}
    J -->|Yes| K[Verify Security Requirements]
    K --> L[Apply Security Escort Fees]
    J -->|No| M{Time-Sensitive Delivery?}
    M -->|Yes| N[Enter Delivery Window]
    N --> O[Apply Time-Sensitive Fees]
    M -->|No| P{Customer Rep Required?}
    P -->|Yes| Q[Enter Rep Contact Details]
    Q --> R[Apply Rep Requirement Fees]
    P -->|No| S[Validate Instructions Completeness]
    E --> S
    I --> S
    L --> S
    O --> S
    R --> S
    S --> T[Flag Special Requirements for Driver]
    T --> U[Calculate Total Special Service Costs]
    
    style A fill:#e1f5fe
    style U fill:#c8e6c9
```

### AC-005: Real-time Quote Generation Flow

```mermaid
flowchart TD
    A[User Requests Quote] --> B[Calculate Base Rate by Truck Type]
    B --> C[Calculate Distance Charges per KM]
    C --> D[Calculate Weight Charges Above Base]
    D --> E[Apply Special Cargo Surcharge]
    E --> F[Apply Time-based Surcharge]
    F --> G[Apply Fuel Adjustment Factor]
    G --> H[Calculate Subtotal]
    H --> I[Apply Government Taxes (VAT)]
    I --> J[Generate Final Quote Amount]
    J --> K{Quote Generated Within 5 Seconds?}
    K -->|No| L[Show System Performance Error]
    K -->|Yes| M[Display Quote Breakdown]
    M --> N[Show All Cost Components]
    N --> O[Set Quote Validity: 24 Hours]
    O --> P[Store Quote for Customer Reference]
    
    style A fill:#e1f5fe
    style P fill:#c8e6c9
    style L fill:#ffcdd2
```

## CJ-003: Smart Truck Selection and Booking Confirmation

### AC-001: Available Truck Display Flow

```mermaid
flowchart TD
    A[System Searches Available Trucks] --> B[Filter by Cargo Compatibility]
    B --> C[Apply Best Match Algorithm Scoring]
    C --> D[Sort by Algorithm Score]
    D --> E[Get Current Location for Each Truck]
    E --> F[Calculate Distance from Pickup]
    F --> G[Estimate Arrival Time]
    G --> H[Retrieve Driver Information]
    H --> I[Get Driver Ratings & Reviews]
    I --> J[Check Insurance Coverage]
    J --> K[Verify Special Equipment]
    K --> L[Format Truck Listing Display]
    L --> M[Show Truck Type & Capacity]
    M --> N[Show Current Location & Distance]
    N --> O[Show Driver Photo & Rating]
    O --> P[Show Completed Trips Count]
    P --> Q[Show Real-time Availability]
    Q --> R[Show Vehicle Age & Condition]
    R --> S[Show Insurance Details]
    S --> T[Show Special Equipment Available]
    T --> U[Display All Truck Listings]
    
    style A fill:#e1f5fe
    style U fill:#c8e6c9
```

### AC-002: Truck Comparison Flow

```mermaid
flowchart TD
    A[User Views Available Trucks] --> B[User Selects Compare Option]
    B --> C[User Selects First Truck]
    C --> D[User Selects Second Truck]
    D --> E{Third Truck Selected?}
    E -->|Yes| F[User Selects Third Truck]
    E -->|No| G[Generate Comparison Table]
    F --> G
    G --> H[Display Side-by-Side Comparison]
    H --> I[Show All Relevant Details]
    I --> J[Highlight Price Differences]
    J --> K[Highlight Unique Features]
    K --> L[Show Comparative Ratings]
    L --> M[Enable Selection from Comparison]
    
    style A fill:#e1f5fe
    style M fill:#c8e6c9
```

### AC-003: Driver Profile and Reviews Flow

```mermaid
flowchart TD
    A[User Views Specific Truck] --> B[Click Driver Details]
    B --> C[Load Driver Profile]
    C --> D[Display Driver Photo]
    D --> E[Show Overall Rating (1-5 Stars)]
    E --> F[Display Years of Experience]
    F --> G[Show Specialized Cargo Experience]
    G --> H[Display Language Proficiency]
    H --> I[Show Safety Record]
    I --> J[Display Customer Satisfaction Rating]
    J --> K[Show Recent Performance Trends]
    K --> L[Load Recent Customer Reviews]
    L --> M[Display Performance Metrics]
    M --> N[Show On-time Delivery Rate]
    N --> O[Show Damage Rate Statistics]
    O --> P[Display Driver Certifications]
    P --> Q[Show Experience Summary]
    Q --> R[Enable Driver Selection]
    
    style A fill:#e1f5fe
    style R fill:#c8e6c9
```

### AC-004: Booking Confirmation and Payment Flow

```mermaid
flowchart TD
    A[User Selects Truck] --> B[Proceed to Confirmation]
    B --> C[Display Booking Summary]
    C --> D[Show All Booking Details]
    D --> E[User Selects Payment Method]
    E --> F{Credit Card Selected?}
    F -->|Yes| G[Enter Card Details]
    G --> H[Process Card Payment]
    H --> I{Payment Successful?}
    I -->|No| J[Show Payment Error]
    J --> E
    F -->|No| K{Bank Transfer Selected?}
    K -->|Yes| L[Generate Transfer Reference]
    L --> M[Show Bank Details]
    K -->|No| N{Corporate Credit Selected?}
    N -->|Yes| O{Credit Approved?}
    O -->|No| P[Show Credit Limit Error]
    P --> E
    O -->|Yes| Q[Apply to Credit Account]
    N -->|No| R{Pay on Delivery Selected?}
    R -->|Yes| S{Customer Approved for COD?}
    S -->|No| T[Show COD Not Available Error]
    T --> E
    S -->|Yes| U[Set Payment Status: COD]
    I -->|Yes| V[Accept Terms & Conditions]
    M --> V
    Q --> V
    U --> V
    V --> W[Generate Unique Booking Reference]
    W --> X[Confirm Booking in System]
    X --> Y[Send Email Confirmation]
    Y --> Z[Send SMS Confirmation]
    Z --> AA[Notify Assigned Driver]
    
    style A fill:#e1f5fe
    style AA fill:#c8e6c9
    style J fill:#ffcdd2
    style P fill:#ffcdd2
    style T fill:#ffcdd2
```

### AC-005: Booking Modification and Cancellation Flow

```mermaid
flowchart TD
    A[Customer Has Confirmed Booking] --> B{Modification Needed?}
    B -->|No| C[Booking Remains Active]
    B -->|Yes| D{Time Until Pickup?}
    D -->|> 24 Hours| E[Free Modification Allowed]
    E --> F[Process Modification]
    F --> G[Update Booking Details]
    G --> H[Notify Driver of Changes]
    H --> I[Send Update to Customer]
    D -->|2-24 Hours| J[Apply 10% Modification Fee]
    J --> F
    D -->|< 2 Hours| K{Cancellation Requested?}
    K -->|Yes| L[Apply 50% Cancellation Fee]
    L --> M[Process Cancellation]
    M --> N[Initiate Refund Process]
    N --> O[Notify Driver of Cancellation]
    K -->|No| P[Modification Not Allowed]
    P --> Q[Show Modification Deadline Error]
    I --> R[Updated Booking Active]
    O --> S[Booking Cancelled]
    
    style A fill:#e1f5fe
    style C fill:#c8e6c9
    style R fill:#c8e6c9
    style S fill:#fff3e0
    style P fill:#ffcdd2
```

## CJ-004: Real-time Shipment Tracking

### AC-001: Live GPS Tracking Flow

```mermaid
flowchart TD
    A[Booking Confirmed & Driver Assigned] --> B[Initialize GPS Tracking]
    B --> C[Customer Accesses Tracking Page]
    C --> D[Load Interactive Map]
    D --> E[Get Current Truck Location]
    E --> F[Display Truck Position on Map]
    F --> G[Show Route with Completed/Remaining]
    G --> H[Calculate Current ETA]
    H --> I[Update Map Display]
    I --> J[Wait 30 Seconds]
    J --> K[Get Updated Truck Location]
    K --> L{Location Changed?}
    L -->|Yes| M[Update Truck Position]
    M --> N[Recalculate ETA]
    N --> O[Update Route Progress]
    O --> P[Refresh Map Display]
    P --> Q{Delivery Complete?}
    Q -->|No| J
    L -->|No| Q
    Q -->|Yes| R[Stop GPS Tracking]
    
    style A fill:#e1f5fe
    style R fill:#c8e6c9
```

### AC-002: Delivery Status Updates Flow

```mermaid
flowchart TD
    A[Driver Status Change Occurs] --> B{Status Type?}
    B -->|Dispatched| C[Driver En Route to Pickup]
    B -->|Arrived Pickup| D[Arrived at Pickup Location]
    B -->|Cargo Loaded| E[Cargo Loaded & Departure]
    B -->|En Route Delivery| F[En Route to Delivery]
    B -->|Arrived Delivery| G[Arrived at Delivery Location]
    B -->|Delivered| H[Cargo Delivered & Signed]
    C --> I[Update Status Timeline]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J[Generate SMS Notification]
    J --> K[Generate Push Notification]
    K --> L[Send Notifications to Customer]
    L --> M[Update ETA if Applicable]
    M --> N[Log Status Change]
    N --> O{Final Delivery Status?}
    O -->|No| P[Continue Status Monitoring]
    O -->|Yes| Q[Complete Status Updates]
    
    style A fill:#e1f5fe
    style Q fill:#c8e6c9
```

### AC-003: Communication with Driver Flow

```mermaid
flowchart TD
    A[Customer Needs Driver Communication] --> B{Communication Type?}
    B -->|Phone Call| C[Initiate Masked Call]
    C --> D[Connect Customer to Driver]
    D --> E[Log Call Duration & Time]
    B -->|Text Message| F[Open In-App Messaging]
    F --> G[Customer Types Message]
    G --> H[Send Message to Driver]
    H --> I[Log Message in History]
    B -->|Voice Message| J[Record Voice Message]
    J --> K[Send Voice to Driver]
    K --> L[Log Voice Message]
    B -->|Photo Share| M[Select Photo]
    M --> N[Upload Photo]
    N --> O[Send Photo to Driver]
    O --> P[Log Photo Share]
    B -->|Emergency| Q[Connect to Operations Center]
    Q --> R[Emergency Protocol Activated]
    B -->|Translation| S[Activate Translation Service]
    S --> T[Provide Multi-language Support]
    E --> U[Update Communication History]
    I --> U
    L --> U
    P --> U
    R --> U
    T --> U
    U --> V[Maintain Communication Record]
    
    style A fill:#e1f5fe
    style V fill:#c8e6c9
```

### AC-004: Delivery Proof and Documentation Flow

```mermaid
flowchart TD
    A[Driver Completes Delivery] --> B[Capture GPS Coordinates]
    B --> C[Record Delivery Timestamp]
    C --> D[Capture Digital Signature]
    D --> E[Take Photos of Delivered Cargo]
    E --> F{Any Damage or Discrepancies?}
    F -->|Yes| G[Document Damage with Photos]
    G --> H[Record Discrepancy Notes]
    H --> I[Get Customer Acknowledgment]
    F -->|No| J[Confirm Delivery Completion]
    I --> J
    J --> K[Identify Delivery Person]
    K --> L{Special Instructions Followed?}
    L -->|No| M[Note Instruction Deviations]
    L -->|Yes| N[Confirm Instructions Compliance]
    M --> O[Generate Delivery Report]
    N --> O
    O --> P[Send Delivery Confirmation to Customer]
    P --> Q[Generate Invoice]
    Q --> R[Send Invoice to Customer]
    R --> S[Store Delivery Documentation]
    S --> T[Update Booking Status to Delivered]
    
    style A fill:#e1f5fe
    style T fill:#c8e6c9
```

### AC-005: Delivery Analytics and Feedback Flow

```mermaid
flowchart TD
    A[Delivery Completed] --> B[Calculate Total Distance Traveled]
    B --> C[Compare with Planned Route]
    C --> D[Calculate Actual vs Estimated Time]
    D --> E[Analyze Route Efficiency]
    E --> F[Calculate Fuel Consumption]
    F --> G[Assess Driver Performance]
    G --> H[Compare Actual vs Quoted Costs]
    H --> I[Generate Analytics Report]
    I --> J[Present Trip Analytics to Customer]
    J --> K[Customer Reviews Trip Details]
    K --> L[Customer Rates Driver (1-5 Stars)]
    L --> M[Customer Rates Overall Service]
    M --> N[Customer Provides Written Feedback]
    N --> O[Customer Submits Feedback]
    O --> P[Store Feedback in Database]
    P --> Q[Update Driver Rating]
    Q --> R[Store Trip Data for Future Reference]
    R --> S[Enable Dispute Resolution Access]
    S --> T[Complete Customer Journey]
    
    style A fill:#e1f5fe
    style T fill:#c8e6c9
```

## Integration Points and Error Handling

### System Integration Flow

```mermaid
flowchart TD
    A[Customer Action] --> B[Frontend Validation]
    B --> C{Valid Input?}
    C -->|No| D[Show Client-side Error]
    D --> A
    C -->|Yes| E[Send to Backend API]
    E --> F[Server-side Validation]
    F --> G{Valid Request?}
    G -->|No| H[Return Validation Error]
    H --> I[Display Server Error]
    I --> A
    G -->|Yes| J[Process Business Logic]
    J --> K[Update Database]
    K --> L{Database Update Successful?}
    L -->|No| M[Return Database Error]
    M --> N[Show System Error]
    N --> O[Log Error for Support]
    L -->|Yes| P[Send External Notifications]
    P --> Q[Return Success Response]
    Q --> R[Update UI with Success]
    R --> S[Complete User Action]
    
    style A fill:#e1f5fe
    style S fill:#c8e6c9
    style D fill:#ffcdd2
    style I fill:#ffcdd2
    style N fill:#ffcdd2
```

### Error Recovery Flow

```mermaid
flowchart TD
    A[System Error Occurs] --> B{Error Type?}
    B -->|Network Error| C[Show Network Error Message]
    C --> D[Provide Retry Option]
    D --> E[User Retries Action]
    B -->|Validation Error| F[Show Field-specific Error]
    F --> G[Highlight Invalid Fields]
    G --> H[User Corrects Input]
    B -->|Server Error| I[Show Generic Error Message]
    I --> J[Log Error Details]
    J --> K[Offer Contact Support]
    B -->|Timeout Error| L[Show Timeout Message]
    L --> M[Auto-retry with Exponential Backoff]
    M --> N{Retry Successful?}
    N -->|Yes| O[Continue Normal Flow]
    N -->|No| P[Show Persistent Error]
    P --> Q[Escalate to Support]
    E --> R{Action Successful?}
    R -->|Yes| O
    R -->|No| S[Show Retry Failed]
    S --> Q
    H --> T[Revalidate Input]
    T --> U{Validation Passed?}
    U -->|Yes| O
    U -->|No| F
    
    style A fill:#ffebee
    style O fill:#c8e6c9
    style Q fill:#fff3e0
```