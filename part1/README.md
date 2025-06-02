# HBnB - UML Project

## Team Members
- Tas Gidkaos
- Xiaoling Cui
- Wawa Niampoung

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

![High-Level Package Diagram](High-Level%20Package%20Diagram.png)

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

![Detailed Class Diagram for Business Logic Layer](Detailed%20Class%20Diagram%20for%20Business%20Logic%20Layer.png)

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

![Sequence Diagrams for API Calls](Sequence%20Diagrams%20for%20API%20Calls.png)

### 4.2 Key Flows

#### User Registration

- **User → API:** Send registration request with user details  
- **API → BusinessLogic:** Forward registration data for validation and user creation  
- **BusinessLogic → Database:** Save new user information  
- **Database → BusinessLogic:** Return success or failure confirmation  
- **BusinessLogic → API:** Send registration result (success or error)  
- **API → User:** Respond to user with registration outcome  

---

#### Place Creation

- **User → API:** Submit request to create a new place with details (title, description, price, etc.)  
- **API → BusinessLogic:** Validate request and create place object  
- **BusinessLogic → Database:** Insert new place record  
- **Database → BusinessLogic:** Return insert confirmation  
- **BusinessLogic → API:** Pass creation result to API  
- **API → User:** Notify user of place creation result  

---

#### Review Submission

- **User → API:** Submit review for a place (rating, comment)  
- **API → BusinessLogic:** Validate review (e.g., user permissions, content) and process submission  
- **BusinessLogic → Database:** Store review data  
- **Database → BusinessLogic:** Return confirmation of review addition  
- **BusinessLogic → API:** Send review submission result  
- **API → User:** Notify user of review submission status  

---

#### Fetch Place List

- **User → API:** Request list of available places  
- **API → BusinessLogic:** Ask business logic to retrieve and process places  
- **BusinessLogic → Database:** Query database for places  
- **Database → BusinessLogic:** Return list of places  
- **BusinessLogic → API:** Send processed place list to API  
- **API → User:** Respond with list of places  

---

Each API call flows through all layers, ensuring validation, processing, and persistence.

---

## 5. Conclusion

This document brings together the architecture, class design, and API flows of HBnB Evolution, serving as a blueprint for robust implementation and future reference.

