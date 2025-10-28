# Software Requirements Specification (SRS)
## Hand Over System - Traffic Fine Management

**Document Version:** 1.0  
**Date:** January 2025  
**Prepared by:** Development Team  
**Reviewed by:** Papa Birame Tall, Amine Mohamed, Wael Al Tammam, Omar, Abdalwahab Qunies  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the Hand Over System, specifically focusing on traffic fine management and vehicle handover functionality. The system integrates with external APIs to process traffic violations and manage vehicle check-in/check-out operations.

### 1.2 Scope
The system encompasses:
- Traffic fine data processing and validation
- Vehicle handover management (check-in/check-out)
- Workshop check-in/check-out operations
- Data mapping and transformation between external APIs and internal systems
- Error handling and validation criteria

### 1.3 Definitions and Acronyms
- **API**: Application Programming Interface
- **CHK_IN**: Check In transaction type
- **CHK_OUT**: Check Out transaction type
- **FMS**: Fine Management System
- **SRS**: Software Requirements Specification
- **TransactionId**: Unique identifier for each transaction
- **InternalNo**: Internal vehicle number identifier

---

## 2. Overall Description

### 2.1 Product Perspective
The Hand Over System is a middleware solution that processes traffic fine data and vehicle handover information from external APIs. It validates, transforms, and stores data according to predefined business rules and system constraints.

### 2.2 Product Functions
- **Traffic Fine Processing**: Import and validate traffic fine data from external APIs
- **Vehicle Handover Management**: Process vehicle check-in and check-out transactions
- **Workshop Operations**: Handle workshop check-in/check-out processes
- **Data Mapping**: Transform external API data to internal system format
- **Validation**: Apply business rules and data validation criteria

### 2.3 User Classes and Characteristics
- **System Administrators**: Manage system configuration and data mapping
- **Traffic Department Users**: Process and review traffic fine data
- **Vehicle Management Users**: Handle vehicle handover operations
- **Workshop Staff**: Manage workshop check-in/check-out processes

---

## 3. Specific Requirements

### 3.1 Traffic Violation Types

#### 3.1.1 Functional Requirements

**FR-001: Dynamic Violation Type Creation**
- The system SHALL create a new traffic violation type for each unique description received from the API
- The system SHALL store violation descriptions in both Arabic and English as received
- The system SHALL handle more than 85 different violation type values
- The system SHALL allow unlimited expansion of violation types over time

**FR-002: Violation Type Storage**
- The system SHALL store each unique description as a separate traffic fine type
- The system SHALL use the API Description field for violation type identification
- The system SHALL NOT require standardization of violation types within the system

#### 3.1.2 Data Model
```
TrafficViolationType {
    id: Integer (Primary Key)
    description: String (Unique)
    language: String (AR/EN)
    created_date: DateTime
    is_active: Boolean
}
```

### 3.2 Traffic Departments

#### 3.2.1 Functional Requirements

**FR-003: Predefined Department List**
The system SHALL maintain the following predefined traffic departments:
- Dubai Traffic Dept
- Abu Dhabi Traffic Dept
- Sharjah Traffic Dept
- Umm al-Qaiwain Traffic Dept
- Fujairah Traffic Dept
- Ajman Traffic Dept
- Ras al-Khaimah Traffic Dept

**FR-004: Department Mapping Logic**
- The system SHALL search within any part of the source value to identify emirate names
- The system SHALL map source values to predefined departments using pattern matching
- The system SHALL mark unmapped entries with "General Department" as default
- The system SHALL handle non-matching entries without requiring system changes

**FR-005: Source-to-Department Mapping**
The system SHALL implement the following mapping rules:
- "Abu Dhabi Police" → "Abu Dhabi Traffic Dept"
- "Dubai Police" → "Dubai Traffic Dept"
- "Sharjah Police" → "Sharjah Traffic Dept"
- "Roads & Transport Authority" → "General Department"
- "Integrated Transport Center" → "General Department"
- Unknown values → "General Department"

#### 3.2.2 Data Model
```
TrafficDepartment {
    id: Integer (Primary Key)
    name: String (Predefined list)
    source_patterns: String[] (Mapping patterns)
    is_active: Boolean
}
```

### 3.3 Vehicle Handover System

#### 3.3.1 Functional Requirements

**FR-006: Independent Event Processing**
- The system SHALL treat CHK_IN and CHK_OUT as independent events
- The system SHALL NOT require strict pairing of check-in and check-out records
- The system SHALL accommodate missing or single-sided records
- The system SHALL NOT use Transaction IDs for strict pairing

**FR-007: Grouping and Sequence Reconstruction**
- The system SHALL group records by InternalNo
- The system SHALL use timestamp progression for sequence reconstruction
- The system SHALL use odometer progression for validation
- The system SHALL reconstruct sequences without using Transaction IDs

**FR-008: Transaction Type Validation**
- The system SHALL accept "CHK_IN" and "CHK_OUT" as default predefined values
- The system SHALL handle "Check In" and "Check Out" (human-readable format)
- The system SHALL validate TransactionType field format
- The system SHALL support both formats: "CHK_IN/CHK_OUT" and "Check In/Check Out"

**FR-009: Data Consolidation**
- The system SHALL group records by TransactionId for consolidation
- The system SHALL select the record with the latest TransactionDate
- The system SHALL use Custodian field from the most recent record
- The system SHALL create single consolidated record per TransactionId

#### 3.3.2 Data Model
```
VehicleHandover {
    id: Integer (Primary Key)
    internal_no: String
    transaction_date: DateTime
    transaction_type: String (CHK_IN/CHK_OUT or Check In/Check Out)
    transaction_id: Integer (Unique per transaction)
    odometer: Integer
    custodian: String
    driver: String
    created_date: DateTime
    is_consolidated: Boolean
}
```

### 3.4 Workshop Check-In/Check-Out

#### 3.4.1 Functional Requirements

**FR-010: Workshop Transaction Processing**
- The system SHALL process workshop check-in and check-out transactions
- The system SHALL use the same transaction type values as vehicle handover
- The system SHALL maintain separate processing logic for workshop operations
- The system SHALL handle 8,760+ workshop records

#### 3.4.2 Data Model
```
WorkshopTransaction {
    id: Integer (Primary Key)
    internal_no: String
    transaction_date: DateTime
    transaction_type: String (CHK_IN/CHK_OUT)
    transaction_id: Integer (Unique)
    workshop_details: String
    technician: String
    created_date: DateTime
}
```

### 3.5 API Integration Requirements

#### 3.5.1 Missing API Fields
The system SHALL handle the following missing fields from the AddTrafficFine API:
- Traffic Violation Type
- Confiscation Fees Amount
- Black Points
- Payment Delay Fees

#### 3.5.2 API Data Validation
**FR-011: Null Value Handling**
- The system SHALL validate Location and Source fields for null values
- The system SHALL implement validation rules for null value scenarios
- The system SHALL handle 810+ traffic fine records with no null values in Location/Source fields

**FR-012: Data Volume Handling**
- The system SHALL process 58,609+ API validation records
- The system SHALL handle 4,983+ vehicle handover records
- The system SHALL process 8,760+ workshop transaction records

### 3.6 Error Handling and Validation

#### 3.6.1 Functional Requirements

**FR-013: Error Code Validation**
- The system SHALL implement comprehensive error code validation
- The system SHALL provide detailed error messages for API integration issues
- The system SHALL maintain error logging and tracking

**FR-014: Data Validation Rules**
- The system SHALL validate TransactionId uniqueness
- The system SHALL validate date format consistency
- The system SHALL validate odometer progression logic
- The system SHALL validate custodian and driver information

---

## 4. System Constraints

### 4.1 Technical Constraints
- The system MUST work within existing system architecture
- The system MUST NOT require changes to core system behavior
- The system MUST accommodate API inconsistencies
- The system MUST handle data model and ingestion limitations

### 4.2 Business Constraints
- Implementation timeline: Approximately 3 weeks
- No standardization required for violation types
- Predefined department list cannot be modified
- Transaction ID uniqueness must be maintained

### 4.3 Data Constraints
- TransactionId must be unique per transaction (not reused)
- InternalNo must be used for grouping operations
- Timestamp and odometer must be used for sequence validation
- Source field mapping must accommodate unlimited variations

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- The system SHALL process 58,609+ records efficiently
- The system SHALL handle real-time API data processing
- The system SHALL maintain acceptable response times for data validation

### 5.2 Reliability Requirements
- The system SHALL maintain data integrity during processing
- The system SHALL handle missing or incomplete records gracefully
- The system SHALL provide data recovery mechanisms

### 5.3 Usability Requirements
- The system SHALL provide clear error messages
- The system SHALL support both Arabic and English data
- The system SHALL maintain user-friendly interfaces

---

## 6. Assumptions and Dependencies

### 6.1 Assumptions
- External APIs will continue to provide data in current format
- Data volume will remain within current ranges
- Business rules will remain consistent
- System architecture will support required functionality

### 6.2 Dependencies
- External API availability and reliability
- Database system performance
- Network connectivity for API integration
- User training and adoption

---

## 7. Acceptance Criteria

### 7.1 Traffic Violation Processing
- [ ] System creates new violation types for each unique description
- [ ] System handles 85+ different violation types
- [ ] System supports both Arabic and English descriptions
- [ ] System allows unlimited expansion of violation types

### 7.2 Traffic Department Mapping
- [ ] System maps source values to predefined departments
- [ ] System handles non-matching entries with default value
- [ ] System searches within any part of source value
- [ ] System maintains predefined department list

### 3.3 Vehicle Handover Processing
- [ ] System treats CHK_IN and CHK_OUT as independent events
- [ ] System groups records by InternalNo with timestamp progression
- [ ] System handles missing or single-sided records
- [ ] System consolidates records by TransactionId
- [ ] System supports both transaction type formats

### 7.4 Workshop Operations
- [ ] System processes workshop check-in/check-out transactions
- [ ] System handles 8,760+ workshop records
- [ ] System maintains separate processing logic

### 7.5 API Integration
- [ ] System handles missing API fields appropriately
- [ ] System validates null values in Location/Source fields
- [ ] System processes 58,609+ validation records
- [ ] System implements comprehensive error code validation

---

## 8. Implementation Timeline

**Estimated Duration:** 3 weeks

**Week 1:**
- Traffic violation type processing implementation
- Traffic department mapping logic development
- Basic API integration setup

**Week 2:**
- Vehicle handover system implementation
- Workshop operations development
- Data validation and error handling

**Week 3:**
- System integration and testing
- Error code validation implementation
- Documentation and deployment preparation

---

## 9. Appendices

### 9.1 API Documentation References
- AddTrafficFine API specification
- Vehicle Handover API documentation
- Workshop Check In Check Out API documentation

### 9.2 Data Sample References
- 58,609 API validation records
- 4,983 vehicle handover records
- 8,760 workshop transaction records
- 810 traffic fine records with validation data

---

**Document Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | Papa Birame Tall | | |
| Technical Lead | Amine Mohamed | | |
| Developer | Marwa Helweh | | |
| QA Lead | Wael Al Tammam | | |
| Business Analyst | Omar | | |
| Stakeholder | Abdalwahab Qunies | | |

---

*This document represents the agreed-upon requirements based on the validation criteria review and subsequent email correspondence between the development team and stakeholders.*