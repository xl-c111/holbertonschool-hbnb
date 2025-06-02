# HBnB - UML Project

## 1. Introduction

This document provides a technical overview for the HBnB Evolution project—an extensible AirBnB-like platform.

**Scope:**
- Outlines overall system architecture.
- Details the design and relationships of core entities.
- Illustrates API interaction flows.
- Clarifies major design decisions.

---

## 2. High-Level Architecture

### 2.1 Diagram

![High-Level Package Diagram](./High-Level_Package_Diagram.png)
### 2.2 Explanation

- **Presentation Layer**:  
  Handles requests from users or external systems (`ServiceAPI`, `UserController`, `PlaceController`).

- **Business Logic Layer**:  
  Core models and rules (`User`, `Place`, `Amenity`, `Review`).  
  The `HBnBFacade` provides a single access point for business operations.

- **Persistence Layer**:  
  Manages data storage and retrieval (`UserRepo`, `PlaceRepo`, `AmenityRepo`, `ReviewRepo`, `Database Connection`).

- **Facade Pattern**:  
  The `HBnBFacade` acts as the unified entry for business logic, simplifying interactions and enforcing separation of concerns.

---

## 3. Business Logic Layer (Class Diagram)

### 3.1 Diagram

![Class Diagram](./Screenshot_2025-06-02_at_6.09.13_pm.png)

### 3.2 Key Entities

- **User**:  
  Attributes: id, firstName, lastName, email, password, isAdmin, timestamps  
  Methods: register(), updateProfile(), deleteAccount()

- **Place**:  
  Attributes: id, title, description, price, location, amenities, timestamps  
  Methods: createPlace(), updatePlace(), deletePlace(), listPlaces(), listByAmenity()

- **Amenity**:  
  Attributes: id, name, description, timestamps  
  Methods: addAmenity(), updateAmenity(), deleteAmenity()

- **Review**:  
  Attributes: id, place, rating, comment, timestamps  
  Methods: create(), update(), delete(), listByPlace()

**Relationships:**  
- User owns Place  
- Place consists of Amenity  
- Place has Review

---

## 4. API Interaction Flow (Sequence Diagrams)

### 4.1 Diagram

![Sequence Diagram](./Screenshot_2025-06-02_at_6.09.32_pm.png)

### 4.2 Key Flows

- **User Registration:**  
  User → API → BusinessLogic → Database → BusinessLogic → API → User

- **Place Creation:**  
  User → API → BusinessLogic → Database → BusinessLogic → API → User

- **Review Submission:**  
  User → API → BusinessLogic → Database → BusinessLogic → API → User

- **Fetch Place List:**  
  User → API → BusinessLogic → Database → BusinessLogic → API → User

Each API call flows through all layers, ensuring validation, processing, and persistence.

---

## 5. Conclusion

This document brings together the architecture, class design, and API flows of HBnB Evolution, serving as a blueprint for robust implementation and future reference.

