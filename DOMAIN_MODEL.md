# Domain Model

> Version: 1.0
>
> Status: Draft
>
> Purpose:
>
> This document defines the core business entities of LVN Atlas and the relationships between them.
>
> The domain model represents the language of the business, independent of databases, APIs, or frameworks.
>
> Database schemas, REST APIs, services, and business logic will be derived from this document.

---

# Core Domain

The primary domain of LVN Atlas is:

**Relocation Decision Planning**

The platform exists to help users determine whether relocating to another city is financially sustainable before making the move.

---

# Core Entities

## User

Represents a registered individual using LVN Atlas.

### Responsibilities

- Owns migration blueprints
- Maintains profile information
- Saves relocation scenarios
- Contributes anonymous migration journeys

---

## User Profile

Contains information required for personalization.

Examples:

- Occupation
- Current City
- Family Size
- Lifestyle
- Dietary Preference
- Transportation Preference
- Housing Preference

A profile belongs to exactly one user.

---

## Migration Blueprint

The central entity of the platform.

A Migration Blueprint represents one relocation scenario.

Examples

- Jaipur → Mumbai
- Jaipur → Pune
- Delhi → Bangalore

Each blueprint belongs to exactly one user.

A user may own multiple blueprints.

---

## City

Represents a supported city.

Examples

- Mumbai
- Pune
- Jaipur
- Bangalore

Cities provide:

- Cost-of-living information
- Migration statistics
- Community insights

---

## Budget

Represents the estimated monthly financial plan for a Migration Blueprint.

Includes:

- Income
- Expenses
- Savings
- Disposable Income

A budget belongs to one Migration Blueprint.

---

## Expense Category

Represents a type of expense.

Examples

- Rent
- Groceries
- Transportation
- Utilities
- Healthcare
- Entertainment

Categories are shared across all users.

---

## Expense Item

Represents an individual expense within a budget.

Example

Category:

Groceries

Estimated Amount:

₹6,200

Expense Items belong to one Budget.

---

## Migration Journey

Represents an anonymous real-world relocation experience shared by users.

Includes:

- Origin City
- Destination City
- Occupation
- Salary Range
- Expense Breakdown

Migration Journeys improve future recommendations.

---

## Atlas Score™

Represents the relocation readiness score generated for a Migration Blueprint.

The score is calculated rather than manually entered.

Factors may include:

- Income
- Expected Savings
- Housing Cost Ratio
- Family Size
- Community Data
- Cost of Living

---

# Relationships

User
→ owns → User Profile

User
→ owns → Migration Blueprints

Migration Blueprint
→ references → Origin City

Migration Blueprint
→ references → Destination City

Migration Blueprint
→ owns → Budget

Budget
→ contains → Expense Items

Expense Item
→ belongs to → Expense Category

Migration Blueprint
→ generates → Atlas Score™

Migration Journeys
→ influence → Migration Blueprint recommendations

---

# Business Rules

## User

- A user must have exactly one profile.
- A user may create multiple migration blueprints.

---

## Migration Blueprint

- Every blueprint has one origin city.
- Every blueprint has one destination city.
- Every blueprint generates one budget.
- Every blueprint generates one Atlas Score.

---

## Budget

- Budgets contain multiple expense items.
- Expense totals determine projected savings.

---

## Migration Journey

- Personal identity must never be exposed.
- Journeys may be updated by their owners.
- Journeys contribute to recommendation quality.

---

# Future Entities

These entities are intentionally excluded from the MVP.

- Company
- Job Offer
- Notification
- Timeline
- Recommendation Engine
- Audit Log
- Admin
- Employer
- AI Recommendation

These will be introduced in later milestones.