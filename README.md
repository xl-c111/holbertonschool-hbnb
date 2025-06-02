HBnB Evolution Project
Technical Documentation
1. Introduction
This document provides a comprehensive technical overview for the HBnB Evolution project—a simplified, modular, and extensible version of an AirBnB-like platform. The primary purpose of this document is to serve as a blueprint for system implementation, guiding the development team through the key architectural layers, business logic design, and component interactions.

Scope:

Outlines overall system architecture.

Details the design and relationships of core entities.

Illustrates typical API interaction flows.

Clarifies the rationale behind major design decisions.

2. High-Level Architecture
2.1 Purpose of the Diagram
The high-level package diagram provides a bird’s-eye view of the system’s architecture, illustrating the three-layer design (Presentation, Business Logic, Persistence) and how these layers interact via the Facade pattern.

2.2 Diagram
![High-Level Package Diagram](./High-Level_Package_Diagram.png)

2.3 Key Components & Explanation
Presentation Layer
Includes ServiceAPI, UserController, and PlaceController. This layer acts as the main entry point, handling requests from users and external systems.

Business Logic Layer
Contains core models (User, Place, Amenity, Review) and the HBnBFacade. All business rules, validations, and coordination between entities occur here. The HBnBFacade implements the facade pattern, acting as a single gateway for all business logic operations.

Persistence Layer
Consists of repositories (UserRepo, PlaceRepo, AmenityRepo, ReviewRepo) responsible for storing and retrieving domain data, all interacting with the Database Connection.

2.4 Design Decisions
Layered separation improves modularity and maintainability.

Facade pattern centralizes business logic access, hiding complexity and ensuring loose coupling between controllers and domain logic.

3. Business Logic Layer: Detailed Design
3.1 Purpose of the Diagram
The class diagram for the business logic layer details the attributes, methods, and relationships of key entities. It defines the application’s main business rules and entity interactions.

3.2 Diagram

3.3 Key Entities & Relationships
User

Attributes: ID, firstName, lastName, email, password, isAdmin, createdAt, updatedAt

Methods: register(), updateProfile(), deleteAccount()

Each user can be a regular user or admin.

Place

Attributes: ID, title, description, price, latitude, longitude, userID, amenities, createdAt, updatedAt

Methods: createPlace(), updatePlace(), deletePlace(), listPlaces(), listByAmenity()

Each place is owned by a user, can have multiple amenities, and can be reviewed.

Amenity

Attributes: ID, name, description, createdAt, updatedAt

Methods: addAmenity(), updateAmenity(), deleteAmenity()

Amenities are associated with places.

Review

Attributes: ID, place, rating, comment, createdAt, updatedAt

Methods: create(), update(), delete(), listByPlace()

Each review is linked to a specific place.

3.4 Design Decisions
Unique IDs and timestamps are included for all entities for audit and tracking.

Relationships:

User “owns” Place (one-to-many)

Place “consists of” Amenity (many-to-many, shown as a composition/aggregation)

Place “has” Review (one-to-many)

Business rules (e.g., only owners can update places, reviews must be associated with places and users) are enforced in this layer.

4. API Interaction Flow
4.1 Purpose of the Diagrams
The sequence diagrams illustrate how major API calls traverse the system, showing the sequence of operations and flow of information between the layers.

4.2 Diagram

4.3 Key Flows & Explanations
User Registration API Call
User sends registration request to API.

API forwards request to business logic for validation and user creation.

Business logic saves user data to database.

Database returns confirmation.

Result flows back through business logic and API to the user.

Place Creation API Call
User sends request to create a place.

API sends request to business logic for validation and creation.

Business logic inserts new place data into database.

Database confirms operation.

API returns result to user.

Review Submission API Call
User submits a review.

API forwards review to business logic for validation and processing.

Business logic stores review in database.

Database returns result.

User receives confirmation via API.

Fetching a List of Places API Call
User requests list of places via API.

API forwards request to business logic.

Business logic retrieves data from database.

Results flow back to user through API.

4.4 Design Decisions
Every API operation passes through all three layers, ensuring validation, consistency, and data integrity.

The facade ensures controllers and APIs do not directly manipulate domain objects, enforcing strict separation of concerns.

5. Conclusion
This document compiles the core diagrams and explanatory notes that define the architecture, business logic, and system interactions of HBnB Evolution. These specifications serve as a reference throughout the development process, supporting clarity, maintainability, and successful implementation of the application.
