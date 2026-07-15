# Entity Relationship Diagram

```mermaid
erDiagram

    USER ||--|| USER_PROFILE : owns

    USER ||--o{ MIGRATION_BLUEPRINT : creates

    USER ||--o{ MIGRATION_JOURNEY : contributes

    MIGRATION_BLUEPRINT }o--|| CITY : origin

    MIGRATION_BLUEPRINT }o--|| CITY : destination

    MIGRATION_BLUEPRINT ||--|| BUDGET : contains

    BUDGET ||--o{ EXPENSE_ITEM : includes

    EXPENSE_CATEGORY ||--o{ EXPENSE_ITEM : categorizes

    MIGRATION_BLUEPRINT ||--|| ATLAS_SCORE : generates
```

-------------------------------------------------------------------------------------

# Relationship Notes

| Entity | Relationship |
|----------|--------------|
| User → Profile | One to One |
| User → Blueprint | One to Many |
| User → Journey | One to Many |
| Blueprint → Budget | One to One |
| Budget → Expense Items | One to Many |
| Expense Category → Expense Items | One to Many |
| Blueprint → Atlas Score | One to One |
| Blueprint → City | Many to One (Origin & Destination) |