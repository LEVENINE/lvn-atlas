# Domain Model

> Version: 1.1
>
> Status: Draft

---

# Purpose

This document defines the core business concepts and relationships within LVN Atlas.

It intentionally avoids implementation details such as databases, APIs, frameworks, or specific storage technologies.

Instead, it answers one question:

**What concepts exist in the LVN Atlas business domain?**

---

# Core Domain

## Relocation Decision Planning

LVN Atlas helps users evaluate whether relocating from one city to another is financially sustainable.

The platform enables users to:

- plan hypothetical relocation scenarios
- estimate monthly living expenses
- compare income against projected expenses
- discover anonymized real-world relocation journeys
- use relevant journeys as references for their own plans
- calculate financial indicators such as expected savings and relocation readiness

The core distinction within the domain is:

**Migration Blueprint**

A hypothetical or planned relocation scenario created by a user.

**Migration Journey**

An anonymized representation of an actual relocation experience contributed by a user.

---

# Aggregate Root

## User

The User is the primary owner of personal data and relocation planning activities within the system.

A User can:

- maintain one User Profile
- create multiple Migration Blueprints
- contribute multiple Migration Journeys
- use Migration Journeys as references when planning a relocation

Relationship:

User (1) → User Profile (1)

User (1) → Migration Blueprint (N)

User (1) → Migration Journey (N)

---

# Entities

## User Profile

Represents reusable personal and lifestyle information used to personalize relocation planning and journey recommendations.

Contains:

- Occupation
- Household Size
- Number of Dependents
- Dietary Preference
- Housing Preference
- Transportation Preference
- Lifestyle Preference

Location-specific information is not permanently tied to the User Profile because a user may evaluate multiple relocation scenarios involving different cities.

Relationship:

User (1) → User Profile (1)

---

## Migration Blueprint

Represents a hypothetical or planned relocation scenario.

Examples:

- Jaipur → Mumbai
- Jaipur → Pune
- Mumbai → Bengaluru

A user may create multiple Migration Blueprints to compare different relocation options.

Contains:

- Origin City
- Destination City
- Expected Monthly Income
- Planned Relocation Date
- Relocating Household Size
- Budget

A Migration Blueprint may also use a Migration Journey as a reference when creating or customizing its projected expenses.

Relationship:

User (1) → Migration Blueprint (N)

City (1) → Migration Blueprint (N) as Origin City

City (1) → Migration Blueprint (N) as Destination City

Migration Blueprint (1) → Budget (1)

Migration Journey (1) → Migration Blueprint (N) as optional reference

---

## Budget

Represents the projected monthly financial plan associated with a Migration Blueprint.

Contains:

- Monthly Income
- Expense Items

The following values are derived from the Budget and should be calculated from its underlying financial data:

- Total Expenses
- Expected Savings
- Disposable Income

Relationship:

Migration Blueprint (1) → Budget (1)

Budget (1) → Expense Item (N)

---

## Expense Category

Represents a globally shared classification of expenses.

Examples:

- Rent
- Groceries
- Utilities
- Healthcare
- Transportation
- Internet
- Education
- Entertainment
- Miscellaneous

Expense Categories provide consistent classification across Migration Blueprints and Migration Journeys.

Relationship:

Expense Category (1) → Expense Item (N)

Expense Category (1) → Journey Expense Item (N)

---

## Expense Item

Represents one projected monthly expense within a Migration Blueprint's Budget.

Examples:

- Rent — ₹18,000
- Groceries — ₹6,200
- Internet — ₹900

Contains:

- Expense Category
- Amount

Relationship:

Budget (1) → Expense Item (N)

Expense Category (1) → Expense Item (N)

---

## City

Represents a supported geographical city within LVN Atlas.

Contains:

- Name
- State or Region
- Country

Cities are referenced by Migration Blueprints and Migration Journeys as origin and destination locations.

Future city-related data may include:

- Cost of Living Index
- Population
- Housing Statistics
- Transportation Statistics
- Community Statistics

---

## Migration Journey

Represents an anonymized real-world relocation experience contributed by a user.

A Migration Journey describes what relocating from one city to another actually looked like financially and practically for a person or household.

Contains:

- Origin City
- Destination City
- Occupation
- Household Size
- Monthly Income or Income Range
- Dietary Preference
- Housing Type
- Transportation Preference
- Journey Expense Items

Personally identifying information must not be exposed when a Migration Journey is presented to other users.

Relationship:

User (1) → Migration Journey (N)

City (1) → Migration Journey (N) as Origin City

City (1) → Migration Journey (N) as Destination City

Migration Journey (1) → Journey Expense Item (N)

---

## Journey Expense Item

Represents an actual monthly expense associated with a Migration Journey.

Examples:

- Rent — ₹15,000
- Groceries — ₹5,500
- Transportation — ₹2,000

Contains:

- Expense Category
- Amount

Relationship:

Migration Journey (1) → Journey Expense Item (N)

Expense Category (1) → Journey Expense Item (N)

---

# Derived Domain Values

The following concepts are calculated from existing domain data rather than treated as independently managed entities.

## Total Expenses

Calculated as the sum of all Expense Items associated with a Budget.

---

## Expected Savings

Calculated using projected income and projected expenses.

Expected Savings = Monthly Income - Total Expenses

---

## Disposable Income

Represents the projected amount remaining after required or essential expenses.

The exact calculation rules may evolve as expense categories are classified into essential and discretionary expenses.

---

## Atlas Score

Represents the system's assessment of relocation readiness or financial sustainability.

The Atlas Score may consider factors such as:

- Expected Monthly Income
- Total Expenses
- Expected Savings
- Housing Cost Ratio
- Relocating Household Size
- Relevant Migration Journey data
- Future community or city-level data

The Atlas Score is generated by the system and cannot be manually entered by users.

For the MVP, Atlas Score is treated as a derived domain value rather than a standalone entity.

Historical score snapshots may be introduced in the future if score tracking becomes a product requirement.

---

# Migration Journey Matching

LVN Atlas may recommend Migration Journeys that are relevant to a user's Migration Blueprint.

Similarity may be determined using factors such as:

- Origin City
- Destination City
- Occupation
- Income Range
- Household Size
- Dietary Preference
- Housing Preference
- Transportation Preference

The matching mechanism may evolve over time.

The initial MVP may use deterministic filtering and weighted similarity rather than a machine-learning recommendation system.

---

# Blueprint Creation from Migration Journeys

A user may use a relevant Migration Journey as a reference when creating or modifying a Migration Blueprint.

Conceptual flow:

User creates Migration Blueprint

↓

LVN Atlas finds relevant Migration Journeys

↓

User explores anonymized Journey data

↓

User selects a Journey as a reference

↓

Journey expense structure is copied into the Blueprint Budget

↓

User customizes projected expenses

↓

LVN Atlas calculates financial indicators and Atlas Score

The resulting Migration Blueprint belongs entirely to the user and can be modified independently of the original Migration Journey.

---

# Business Rules

A User must have exactly one User Profile.

A User may create multiple Migration Blueprints.

A User may contribute multiple Migration Journeys.

A Migration Blueprint must reference exactly one Origin City.

A Migration Blueprint must reference exactly one Destination City.

The Origin City and Destination City of a Migration Blueprint must not be the same.

A Migration Blueprint owns exactly one Budget.

A Budget contains multiple Expense Items.

An Expense Item belongs to exactly one Expense Category.

Expense Categories are shared globally.

A Migration Journey must reference exactly one Origin City.

A Migration Journey must reference exactly one Destination City.

A Migration Journey contains multiple Journey Expense Items.

A Journey Expense Item belongs to exactly one Expense Category.

Migration Journeys presented to other users must not expose personally identifying information.

A Migration Blueprint may optionally reference a Migration Journey as its source or inspiration.

Changes to a source Migration Journey must not automatically modify an existing Migration Blueprint.

Total Expenses, Expected Savings, Disposable Income, and Atlas Score are calculated by the system.

---

# MVP Domain Objects

The MVP includes:

- User
- User Profile
- City
- Migration Blueprint
- Budget
- Expense Category
- Expense Item
- Migration Journey
- Journey Expense Item

The MVP also includes calculated domain values:

- Total Expenses
- Expected Savings
- Disposable Income
- Atlas Score

---

# Future Domain Objects

The following concepts are intentionally excluded from the initial MVP:

- Job Offer
- Employer
- Relocation Timeline
- Notification
- Advanced Recommendation Engine
- Machine Learning Journey Matching
- Analytics
- Admin Management
- Community Features
- Atlas Score History