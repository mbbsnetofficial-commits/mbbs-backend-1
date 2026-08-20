# 🗺️ MBBS.NET User Flow & Architecture Diagrams

This document details the end-to-end user flows and system interactions across **MBBS Backend 1 (Core Engine)** and **MBBS Backend 2 (CSE Finder Engine)**.

---

## 1. Student Authentication & Onboarding Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend as Frontend Web App
    participant Auth as Backend 1 Auth API
    participant DB as MongoDB (Users)

    Student->>Frontend: Click Signup / Enter Phone
    Frontend->>Auth: POST /api/v1/auth/signup
    Auth->>Auth: Generate 6-Digit OTP
    Auth-->>Student: Send SMS via Twilio / Firebase
    Student->>Frontend: Enter Received OTP
    Frontend->>Auth: POST /api/v1/auth/verify-signup-otp
    Auth->>DB: Activate User Account
    Auth-->>Frontend: Return JWT Access Token (1h) & Refresh Token (30d)
    Frontend->>Frontend: Store Token in Secure Storage
```

---

## 2. CSE Open University Finder Flow (Backend 2 Integration)

```mermaid
flowchart TD
    A["Step 1: Student visits /finder"] --> B["GET /api/v1/cse/countries"]
    B --> C["Display Countries (Russia, Uzbekistan, Kazakhstan, etc.)"]
    C --> D["Step 2: Student selects Country"]
    D --> E["GET /api/v1/cse/countries/{countryId}/questions"]
    E --> F["Render Dynamic Questionnaire (PCB %, NEET Score, Budget, Language)"]
    F --> G["Step 3: Student submits answers"]
    G --> H["POST /api/v1/cse/recommendations"]
    H --> I["Backend 2 Recommendation Engine Ranks Universities"]
    I --> J["Return Ranked Universities & Match %"]
    J --> K["Step 4: Student views University Profile"]
    K --> L["GET /api/v1/cse/universities/{slug}"]
    L --> M["Display Fees, Hostel, Recognition & MBBS Courses"]
```

---

## 3. NEET Practice & Quick Test Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Frontend App
    participant API as Backend 1 Core
    participant DB as MongoDB

    Student->>UI: Select Subject & Chapters for Quick Test
    UI->>API: GET /api/v1/test-questions
    API-->>UI: Return Practice Questions
    Student->>UI: Answer Questions & Submit Test
    UI->>API: POST /api/v1/test-questions/submit
    API->>DB: Record Test Session & Score
    API-->>UI: Return Test Results & Instant Feedback
    UI->>API: GET /api/v1/leaderboard
    API-->>UI: Render Top Ranked Students
```

---

## 4. UCAT Preparation & AI Study Assistant Flow

```mermaid
flowchart LR
    A["Student"] -->|Start UCAT Exam| B["POST /api/v1/ucat/test/start"]
    B --> C["Timed Exam Session Active"]
    C -->|Submit Test| D["POST /api/v1/ucat/test/submit"]
    D --> E["Compute Performance Score & Insights"]
    E -->|Ask Doubts| F["POST /api/v1/ucat/chat (AI Tutor)"]
    F --> G["Gemini AI generates detailed step-by-step guidance"]
```

---

## 5. Summary of System Interactions Between Backend 1 and Backend 2

| User Action | Backend Handling Request | Description |
| :--- | :--- | :--- |
| **Login / Token Issuance** | `MBBS Backend 1` | Generates JWT Signed with shared `SECRET_KEY`. |
| **NEET Prep & PYQ** | `MBBS Backend 1` | Serves Question Bank, Streaks & Leaderboards. |
| **UCAT & AI Assistant** | `MBBS Backend 1` | Integrates with Gemini AI & UCAT Engine. |
| **University Search & Eligibility** | `MBBS Backend 2` | Evaluates eligibility criteria and outputs matching MBBS universities. |
| **Admin Operations** | `Backend 1` & `Backend 2` | Backend 1 manages Blogs/Users; Backend 2 manages Universities/Courses. |
