# Software Requirements Specification (SRS)
## Hand Over System Integration Project

**Document Version:** 1.0  
**Date:** September 14, 2025  
**Prepared by:** Development Team  
**Organization:** MARMARA FOR MODERN SOFTWARE LLC  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Requirements](#5-system-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Validation Criteria](#7-validation-criteria)
8. [Implementation Timeline](#8-implementation-timeline)
9. [Appendices](#9-appendices)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Hand Over System Integration project, which involves integrating traffic fine data and vehicle handover processes through API-based data exchange.

### 1.2 Scope
The system will handle:
- Traffic fine data integration and validation
- Vehicle handover process management (check-in/check-out)
- Workshop check-in/check-out operations
- Data mapping and transformation between external APIs and internal systems

### 1.3 Definitions and Acronyms
- **API**: Application Programming Interface
- **FMS**: Fleet Management System
- **CHK_IN**: Check In transaction type
- **CHK_OUT**: Check Out transaction type
- **SRS**: Software Requirements Specification

### 1.4 References
- Email correspondence between development team and stakeholders
- API documentation for Vehicle Handover and Workshop Check In/Check Out
- Traffic Fine Details Report specifications

---

## 2. Overall Description

### 2.1 Product Perspective
The system serves as an integration layer between external fleet management APIs and the internal traffic management system, handling data validation, transformation, and storage.

### 2.2 Product Functions
- Import and validate traffic fine data from external APIs
- Process vehicle handover transactions
- Handle workshop check-in/check-out operations
- Implement data mapping and validation rules
- Generate consolidated reports

### 2.3 User Classes and Characteristics
- **System Administrators**: Manage integration configurations
- **Traffic Officers**: Access traffic fine data
- **Fleet Managers**: Monitor vehicle handovers
- **Workshop Staff**: Handle vehicle check-in/out processes

---

## 3. System Features

### 3.1 Traffic Fine Integration

#### 3.1.1 Description
Integration of traffic fine data from external FMS API into the internal system.

#### 3.1.2 Functional Requirements

**FR-TF-001**: The system SHALL import traffic fine data from the external API
- **Priority**: High
- **Input**: API response containing traffic fine records
- **Processing**: Validate and transform data according to mapping rules
- **Output**: Stored traffic fine records in internal database

**FR-TF-002**: The system SHALL handle missing mandatory fields
- **Priority**: High
- **Details**: 
  - Traffic Violation Type (not provided by API)
  - Confiscation Fees Amount (not provided by API)
  - Black Points (not provided by API)
  - Payment Delay Fees (not provided by API)

**FR-TF-003**: The system SHALL map traffic violation types
- **Priority**: High
- **Rule**: Store each unique description as a separate traffic fine type
- **Behavior**: New types will be created dynamically as new descriptions are encountered

**FR-TF-004**: The system SHALL map traffic departments
- **Priority**: High
- **Predefined Values**:
  - Dubai Traffic Dept
  - Abu Dhabi Traffic Dept
  - Sharjah Traffic Dept
  - Umm al-Qaiwain Traffic Dept
  - Fujairah Traffic Dept
  - Ajman Traffic Dept
  - Ras al-Khaimah Traffic Dept
- **Rule**: Search within source value to identify emirate name; use "General Department" as default

### 3.2 Vehicle Handover Management

#### 3.2.1 Description
Processing of vehicle handover transactions including check-in and check-out operations.

#### 3.2.2 Functional Requirements

**FR-VH-001**: The system SHALL process vehicle handover transactions
- **Priority**: High
- **Input**: Vehicle handover API data
- **Transaction Types**: CHK_IN, CHK_OUT, "Check In", "Check Out"

**FR-VH-002**: The system SHALL treat check-in and check-out as independent events
- **Priority**: High
- **Rule**: No strict pairing required between CHK_IN and CHK_OUT records
- **Grouping**: Based on InternalNo with timestamp and odometer progression

**FR-VH-003**: The system SHALL handle incomplete transaction pairs
- **Priority**: High
- **Behavior**: Accept records with only check-in OR only check-out
- **Tracking**: Use InternalNo, timestamp, and odometer sequence for analysis

### 3.3 Workshop Check-In/Check-Out

#### 3.3.1 Description
Management of workshop-related vehicle check-in and check-out processes.

#### 3.3.2 Functional Requirements

**FR-WS-001**: The system SHALL process workshop check-in/check-out data
- **Priority**: High
- **Volume**: Handle approximately 8,760 records
- **Transaction Types**: CHK_IN, CHK_OUT

---

## 4. External Interface Requirements

### 4.1 API Interfaces

#### 4.1.1 Traffic Fine API
- **Endpoint**: AddTrafficFine API
- **Method**: POST/GET (as per API specification)
- **Data Volume**: 58,609 records validated
- **Response Format**: JSON

**Sample API Fields**:
```json
{
  "Description": "Exceeding speed limit",
  "Location": "Dubai - Sheikh Zayed Road",
  "Source": "Abu Dhabi Police",
  "Amount": 600.00,
  "Date": "2025-08-15T10:30:00Z"
}
```

#### 4.1.2 Vehicle Handover API
- **Data Volume**: 4,983 records
- **Transaction Types**: CHK_IN, CHK_OUT, "Check In"

**Sample Payload**:
```json
{
  "InternalNo": "B0073719",
  "TransactionDate": "06/28/2025 13:32:00",
  "TransactionType": "Check In",
  "TransactionId": 542753,
  "Odometer": 32123,
  "Custodian": "John Doe",
  "Driver": "Jane Smith"
}
```

#### 4.1.3 Workshop Check In/Check Out API
- **Data Volume**: 8,760 records
- **Transaction Types**: CHK_IN, CHK_OUT

---

## 5. System Requirements

### 5.1 Performance Requirements

**PR-001**: The system SHALL process traffic fine imports within acceptable time limits
- **Volume**: Handle 58,609+ records efficiently
- **Response Time**: Import process completion within 30 minutes for full dataset

**PR-002**: The system SHALL handle concurrent API requests
- **Requirement**: Support multiple simultaneous API calls without data corruption

### 5.2 Reliability Requirements

**RR-001**: The system SHALL maintain data integrity during import processes
- **Requirement**: Implement transaction rollback on import failures
- **Validation**: All imported data must pass validation rules

**RR-002**: The system SHALL handle API unavailability gracefully
- **Requirement**: Implement retry mechanisms and error logging

### 5.3 Security Requirements

**SR-001**: The system SHALL validate all incoming API data
- **Requirement**: Implement input validation and sanitization
- **Protection**: Prevent SQL injection and data corruption attacks

---

## 6. Data Requirements

### 6.1 Traffic Fine Data Mapping

| Internal Field | API Field | Mapping Rule | Default Value |
|---|---|---|---|
| Traffic Violation Type | Description | Create new type for each unique description | "General Violation" |
| Traffic Department | Source | Map based on emirate name search | "General Department" |
| Amount | Amount | Direct mapping | N/A |
| Location | Location | Direct mapping | Handle null values |
| Date | Date | Direct mapping with format validation | N/A |

### 6.2 Vehicle Handover Data Mapping

| Internal Field | API Field | Mapping Rule | Notes |
|---|---|---|---|
| Internal Number | InternalNo | Direct mapping | Used for grouping |
| Transaction Date | TransactionDate | Direct mapping | Format: MM/DD/YYYY HH:MM:SS |
| Transaction Type | TransactionType | Accept CHK_IN, CHK_OUT, "Check In", "Check Out" | Case sensitive |
| Transaction ID | TransactionId | Direct mapping | Must be unique per transaction |
| Odometer | Odometer | Direct mapping | Used for sequence validation |
| Custodian | Custodian | Direct mapping | Used for batch consolidation |
| Driver | Driver | Direct mapping | Optional field |

### 6.3 Data Validation Rules

#### 6.3.1 Traffic Fine Validation
- **VR-TF-001**: Amount must be positive numeric value
- **VR-TF-002**: Date must be valid date format
- **VR-TF-003**: Location and Source fields can contain null values
- **VR-TF-004**: Description field is mandatory for violation type creation

#### 6.3.2 Vehicle Handover Validation
- **VR-VH-001**: TransactionId must be unique and numeric
- **VR-VH-002**: InternalNo is mandatory
- **VR-VH-003**: TransactionDate must be valid datetime
- **VR-VH-004**: Odometer must be numeric (can be null)
- **VR-VH-005**: TransactionType must be one of: CHK_IN, CHK_OUT, "Check In", "Check Out"

---

## 7. Validation Criteria

### 7.1 Agreed Validation Points

Based on stakeholder correspondence, the following validation criteria have been confirmed:

#### 7.1.1 Traffic Violation Types
- **Status**: ✅ Agreed
- **Approach**: Store each unique description as a traffic fine type
- **Expansion**: Types will grow over time (85+ different values already identified)
- **Languages**: Support both Arabic and English descriptions
- **Standardization**: No further standardization required

#### 7.1.2 Traffic Departments
- **Status**: ✅ Agreed  
- **Approach**: Maintain predefined emirate list
- **Mapping**: Search within source value for emirate identification
- **Fallback**: Use "General Department" for unmatched entries
- **Non-matching**: Keep entries outside official categories without system changes

#### 7.1.3 Vehicle Handover Processing
- **Status**: ✅ Agreed
- **Approach**: Treat CHK_IN and CHK_OUT as independent events
- **Grouping**: Use InternalNo with timestamp and odometer progression
- **Pairing**: No strict Transaction ID pairing required
- **Incomplete Records**: Accept single-sided records (check-in only or check-out only)
- **Tracking**: Ensure accurate tracking and analysis without core system changes

### 7.2 Data Quality Metrics

#### 7.2.1 Traffic Fine Data Quality
- **Total Records Validated**: 58,609
- **Null Values**: Confirmed in Location and Source fields
- **Violation Types**: 85+ unique descriptions identified
- **Languages**: Mixed Arabic and English content

#### 7.2.2 Vehicle Handover Data Quality
- **Vehicle Handover API**: 4,983 records
- **Workshop API**: 8,760 records
- **Transaction Types**: CHK_IN, CHK_OUT (majority), "Check In" (3 records)
- **Consistency**: Standardized on CHK_IN/CHK_OUT format

---

## 8. Implementation Timeline

### 8.1 Estimated Duration
**Total Implementation Time**: 3 weeks (as estimated by development team)

### 8.2 Implementation Phases

#### Phase 1: Data Validation and Mapping (Week 1)
- Implement traffic fine data validation
- Create department mapping logic
- Set up violation type dynamic creation
- Handle null value scenarios

#### Phase 2: Vehicle Handover Integration (Week 2)
- Implement independent event processing
- Create InternalNo-based grouping
- Set up timestamp and odometer progression tracking
- Handle incomplete transaction pairs

#### Phase 3: Testing and Documentation (Week 3)
- Comprehensive testing with provided data volumes
- Error code validation implementation
- API documentation updates
- Final validation and deployment preparation

---

## 9. Appendices

### Appendix A: Email Communication Summary

The requirements in this SRS are based on extensive email correspondence between:
- **Development Team**: Marwa Helweh (Senior Developer, MARMARA FOR MODERN SOFTWARE LLC)
- **Stakeholders**: Papa Birame Tall, Amine Mohamed, Wael Al Tammam, Omar, Abdalwahab Qunies

### Appendix B: Data Samples

#### B.1 Traffic Fine API Response Structure
```json
{
  "records": [
    {
      "Description": "Exceeding speed limit",
      "Location": "Dubai - Sheikh Zayed Road",
      "Source": "Abu Dhabi Police",
      "Amount": 600.00,
      "Date": "2025-08-15T10:30:00Z"
    }
  ]
}
```

#### B.2 Vehicle Handover API Response Structure
```json
{
  "InternalNo": "B0073719",
  "TransactionDate": "06/28/2025 13:32:00",
  "TransactionType": "Check In",
  "TransactionId": 542753,
  "Odometer": 32123,
  "Custodian": "John Doe",
  "Driver": "Jane Smith"
}
```

### Appendix C: Error Handling

#### C.1 API Error Codes
- Error code validation has been implemented for all provided APIs
- Updated API documentation includes error code validation details
- Comprehensive error handling for missing fields, invalid formats, and null values

#### C.2 Business Rule Violations
- Invalid transaction types
- Duplicate transaction IDs
- Missing mandatory fields
- Data format inconsistencies

---

**Document Control:**
- **Created**: September 14, 2025
- **Last Modified**: September 14, 2025
- **Version**: 1.0
- **Status**: Final
- **Approved By**: [Pending stakeholder approval]

---

*This SRS document serves as the foundation for the Hand Over System Integration project implementation and should be reviewed and approved by all stakeholders before development begins.*