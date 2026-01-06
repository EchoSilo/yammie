# Mermaid Zoom Preview - Test File

This file contains various Mermaid diagrams to test the zoom and pan functionality.

## Simple Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database

    User->>Browser: Click button
    Browser->>Server: HTTP Request
    Server->>Database: Query data
    Database-->>Server: Return results
    Server-->>Browser: JSON Response
    Browser-->>User: Display data
```

## Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
        +fetch()
    }
    class Cat {
        +String color
        +meow()
        +scratch()
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Start
    Processing --> Success : Complete
    Processing --> Error : Fail
    Success --> Idle : Reset
    Error --> Idle : Retry
    Error --> [*] : Abort
```

## Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "is in"
    CUSTOMER {
        string name
        string email
        string address
    }
    ORDER {
        int orderNumber
        date orderDate
        string status
    }
    PRODUCT {
        int productId
        string name
        float price
    }
```

## Gantt Chart

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design          :a2, after a1, 14d
    section Development
    Backend         :b1, after a2, 21d
    Frontend        :b2, after a2, 21d
    section Testing
    Integration     :c1, after b1, 7d
    UAT             :c2, after c1, 7d
```

## Pie Chart

```mermaid
pie title Language Distribution
    "JavaScript" : 40
    "TypeScript" : 30
    "Python" : 20
    "Other" : 10
```

## Complex Flowchart (for testing zoom)

```mermaid
flowchart TB
    subgraph Frontend
        A[React App] --> B[Redux Store]
        B --> C[Components]
        C --> D[Router]
        D --> E[Pages]
    end

    subgraph Backend
        F[Express Server] --> G[Auth Middleware]
        G --> H[Controllers]
        H --> I[Services]
        I --> J[Models]
    end

    subgraph Database
        K[(PostgreSQL)]
        L[(Redis Cache)]
        M[(S3 Storage)]
    end

    E --> F
    J --> K
    J --> L
    I --> M
```

---

## Testing Instructions

1. **Zoom In**: Use the mouse wheel to scroll up, or click the [+] button
2. **Zoom Out**: Use the mouse wheel to scroll down, or click the [-] button
3. **Pan**: Click and drag anywhere on the diagram
4. **Reset**: Click the reset button to fit the diagram to view
5. **State Persistence**: Edit this file and verify zoom state is preserved
