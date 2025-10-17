# High-Level Package Diagram

```mermaid
graph TB
    subgraph presentation["🎯 PRESENTATION LAYER"]
        api["<b>API Controllers</b><br/>────────────<br/>Users • Places • Reviews<br/>Amenities • Authentication"]
    end

    subgraph business["⚙️ BUSINESS LOGIC LAYER"]
        facade["<b>HBnB Facade</b><br/>(Coordinator)"]
        models["<b>Domain Models</b><br/>────────────<br/>User • Place<br/>Review • Amenity"]
    end

    subgraph persistence["💾 PERSISTENCE LAYER"]
        repos["<b>Repositories</b><br/>(Data Access)"]
        orm["<b>SQLAlchemy ORM</b>"]
        db[("<b>MySQL Database</b>")]
    end

    api -->|coordinates| facade
    facade -->|uses| models
    facade -->|queries via| repos
    repos -->|maps through| orm
    orm -->|persists to| db

    %% Modern color scheme with clear hierarchy
    classDef presentationBox fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,color:#000
    classDef businessBox fill:#f3e5f5,stroke:#6a1b9a,stroke-width:3px,color:#000
    classDef persistenceBox fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px,color:#000
    classDef layerBox fill:#fafafa,stroke:#424242,stroke-width:2px,color:#000
    classDef dbBox fill:#fff3e0,stroke:#e65100,stroke-width:3px,color:#000

    class api presentationBox
    class facade,models businessBox
    class repos,orm persistenceBox
    class db dbBox
    class presentation,business,persistence layerBox
```

---

## 📋 Layer Responsibilities

### 🎯 Presentation Layer
**Handles all HTTP requests and responses**

```
┌─────────────────────────────────────────┐
│  API Controllers (Flask-RESTX)          │
├─────────────────────────────────────────┤
│  • Users API     → Registration, Login  │
│  • Places API    → CRUD Operations      │
│  • Reviews API   → Feedback System      │
│  • Amenities API → Facility Management  │
│  • Auth API      → JWT Authentication   │
└─────────────────────────────────────────┘
```

**Key Functions:**
- Request validation
- Authentication (JWT)
- Response serialization
- Error handling

---

### ⚙️ Business Logic Layer
**Enforces business rules and domain logic**

```
┌─────────────────────────────────────────┐
│  HBnB Facade (Facade Pattern)           │
├─────────────────────────────────────────┤
│  Single entry point for all operations  │
│  • Coordinates models & repositories    │
│  • Enforces business rules              │
│  • Manages transactions                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Domain Models                          │
├─────────────────────────────────────────┤
│  • User     → Auth & Roles              │
│  • Place    → Properties & Location     │
│  • Review   → Ratings & Feedback        │
│  • Amenity  → Features & Facilities     │
│  • BaseModel → Shared Attributes        │
└─────────────────────────────────────────┘
```

**Key Functions:**
- Business rule validation
- Domain logic execution
- Entity relationships
- State management

---

### 💾 Persistence Layer
**Manages all data storage and retrieval**

```
┌─────────────────────────────────────────┐
│  Repositories (Repository Pattern)      │
├─────────────────────────────────────────┤
│  • UserRepository     → User queries    │
│  • PlaceRepository    → Place queries   │
│  • ReviewRepository   → Review queries  │
│  • SQLAlchemyRepo     → Generic CRUD    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SQLAlchemy ORM                         │
├─────────────────────────────────────────┤
│  Object ←→ Relational mapping           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  MySQL Database                         │
├─────────────────────────────────────────┤
│  Persistent data storage                │
└─────────────────────────────────────────┘
```

**Key Functions:**
- Data access abstraction
- Query optimization
- Transaction management
- Database connection pooling

---

## 🔄 Request Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│          │    │          │    │          │    │          │    │          │
│  Client  │───▶│   API    │───▶│  Facade  │───▶│   Repo   │───▶│ Database │
│          │    │          │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                      │              │
                      ▼              ▼
                 Validation    Business Rules
```

---

## 🎨 Design Patterns

| Pattern | Layer | Purpose |
|---------|-------|---------|
| **Facade** | Business Logic | Simplifies complex subsystem interactions |
| **Repository** | Persistence | Abstracts data access logic |
| **MVC** | All Layers | Separates concerns (Model-View-Controller) |

---

## ✨ Key Benefits

✅ **Separation of Concerns** - Each layer has clear responsibilities
✅ **Testability** - Layers can be tested independently
✅ **Maintainability** - Changes isolated to specific layers
✅ **Scalability** - Easy to add new features or modify existing ones
✅ **Reusability** - Components can be reused across the application
