# 📚 MBBS.NET Ecosystem API Documentation

Welcome to the official API documentation for the **MBBS.NET System**. This backend provides comprehensive APIs for Student Authentication, NEET Practice & Examination, UCAT Exam Preparation, Learning Reports & Dashboard Analytics, Blog CMS Engine, AI Tutoring, and Platform Administration.

---

## 🌐 Deployments & Base URLs

| Environment | Base URL | Swagger UI Documentation |
| :--- | :--- | :--- |
| **Production (Railway)** | `https://mbbs-backend-1-production.up.railway.app` | `https://mbbs-backend-1-production.up.railway.app/api-docs` |
| **Custom Domain** | `https://api.mbbs.net` | `https://api.mbbs.net/api-docs` |
| **Local Development** | `http://localhost:3000` | `http://localhost:3000/api-docs` |

> 🔒 **Swagger Basic Authentication**: Accessing `/api-docs`, `/swagger.json`, or `/openapi.json` requires basic authentication credentials configured on the server.

---

## 🔐 Authentication & Authorization

All authenticated endpoints expect a standard JSON Web Token (JWT) in the `Authorization` header:

```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

- **Token Type**: Bearer JWT
- **Access Token Expiry**: 30 Days (configurable via `LOGIN_EXPIRES`)
- **Refresh Token Expiry**: 30 Days (configurable via `REFRESH_TOKEN_EXPIRES`)
- **Admin Tokens**: Separate JWT issued via `POST /api/v1/admin/login`

---

## 📑 Table of Contents

1. [Authentication & Account Management](#1-authentication--account-management)
2. [Platform Admin Authentication](#2-platform-admin-authentication)
3. [NEET Practice Tests & Question Bank](#3-neet-practice-tests--question-bank)
4. [NEET Previous Year Question Papers (PYQ)](#4-neet-previous-year-question-papers-pyq)
5. [UCAT Entrance Examination Module](#5-ucat-entrance-examination-module)
6. [Student Dashboard & Learning Reports](#6-student-dashboard--learning-reports)
7. [Student Profile, Activity & Leaderboard](#7-student-profile-activity--leaderboard)
8. [Notifications & Question Feedback](#8-notifications--question-feedback)
9. [Blog CMS & Public Content Engine](#9-blog-cms--public-content-engine)
10. [Admin Blog Management APIs](#10-admin-blog-management-apis)
11. [AI Review Tutoring & Blog Assistant](#11-ai-review-tutoring--blog-assistant)
12. [Standard Response & Error Formats](#12-standard-response--error-formats)

---

## 1. Authentication & Account Management

**Base Path**: `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Register student with Phone, Email & Password; triggers OTP | None |
| `POST` | `/verify-signup-otp` | Verify 6-digit WhatsApp/SMS OTP and activate account | None |
| `POST` | `/login` | Authenticate with Email/Phone & Password | None |
| `POST` | `/google-login` | Authenticate using Firebase Google ID Token (`idToken`) | None |
| `POST` | `/refresh-token` | Exchange valid Refresh Token for fresh Access Token | None |
| `POST` | `/send-reset-otp` | Send password reset OTP to registered Phone/Email | None |
| `POST` | `/verify-reset-otp` | Verify reset OTP and receive a one-time `resetToken` | None |
| `POST` | `/reset-password` | Reset password using `resetToken` | None |
| `POST` | `/change-password` | Update password for logged-in student | `Bearer Token` |

### Sample Payload: Student Signup
```json
{
  "firstName": "Sanjay",
  "lastName": "Kumar",
  "email": "sanjay@example.com",
  "phoneNumber": "8903605604",
  "password": "password123",
  "confirmPassword": "password123"
}
```

---

## 2. Platform Admin Authentication

**Base Path**: `/api/v1/admin`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Platform administrator authentication | None |
| `GET` | `/me` | Retrieve current authenticated admin profile | `Admin Bearer Token` |

---

## 3. NEET Practice Tests & Question Bank

**Base Path**: `/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/test-questions` | Fetch practice questions with filters (`subjects`, `chapters`, `limit`, `difficulty`) | Optional |
| `POST` | `/test-questions/submit` | Submit practice test responses and compute score & review | `Bearer Token` |
| `GET` | `/test-questions/results/:sessionId` | Fetch detailed score breakdown, question analysis & review | `Bearer Token` |
| `GET` | `/test-questions/history` | Retrieve student practice test history | `Bearer Token` |
| `GET` | `/leaderboard` | Top student rankings based on completed test performance | None |

### Sample Payload: Test Submission
```json
{
  "sessionId": "NEET_TEST_1722458400000_123",
  "answers": [
    {
      "question_id": "60a7c1b2c45e8a001c9a1234",
      "selected_option": "B",
      "time_spent": 45
    }
  ]
}
```

---

## 4. NEET Previous Year Question Papers (PYQ)

**Base Path**: `/api/v1/previous-year-tests`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all available NEET Previous Year question papers | None |
| `GET` | `/:id` | Fetch specific PYQ paper details and question set | None |
| `POST` | `/submit` | Submit completed previous year test paper | `Bearer Token` |
| `GET` | `/results/:sessionId` | Retrieve result analysis for PYQ attempt | `Bearer Token` |

---

## 5. UCAT Entrance Examination Module

**Base Path**: `/api/v1/ucat`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/test/questions` | Browse UCAT question bank with section & difficulty filters | None |
| `GET` | `/test/topics` | List UCAT topics and subtopics per section | None |
| `GET` | `/test/filters` | Get all available UCAT filter options (sections, difficulties) | None |
| `POST` | `/test/start` | Initialize timed UCAT practice or test session | `Bearer Token` |
| `POST` | `/test/submit` | Submit UCAT answers, compute scaled score & band | `Bearer Token` |
| `GET` | `/test/results/:sessionId` | Retrieve UCAT session performance report | `Bearer Token` |
| `GET` | `/test/history` | List previous UCAT test attempts | `Bearer Token` |
| `GET` | `/previous-year-tests` | List past UCAT official examination papers | None |
| `GET` | `/streaks` | Get student daily practice streak statistics | `Bearer Token` |
| `POST` | `/streaks/record` | Log practice activity to maintain active streak | `Bearer Token` |
| `GET` | `/insights/zones` | Fetch student section accuracy and weak/strong zones | `Bearer Token` |
| `POST` | `/insights/generate` | Generate AI-driven performance insights for a test session | `Bearer Token` |
| `POST` | `/chat/sessions` | Create AI UCAT review chat session grounded in wrong answers | `Bearer Token` |
| `POST` | `/chat/sessions/:sessionId/messages` | Send message to AI tutor in an active review chat | `Bearer Token` |

---

## 6. Student Dashboard & Learning Reports

**Base Path**: `/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/neet/tests/builtin` | List all active built-in NEET tests from database | `Bearer Token` |
| `GET` | `/student/dashboard/neet-summary` | High-level NEET performance metrics, score cards & stats | `Bearer Token` |
| `GET` | `/student/dashboard/neet-learning-report` | Unified NEET Learning Report (Built-in + PYQ attempts) | `Bearer Token` |
| `GET` | `/student/dashboard/neet-learning-report/filters` | Dropdown filter options for NEET learning report | `Bearer Token` |
| `GET` | `/ucat/tests/builtin` | List all active built-in UCAT test papers | `Bearer Token` |
| `GET` | `/student/dashboard/ucat-summary` | High-level UCAT performance metrics & subtest scores | `Bearer Token` |
| `GET` | `/student/dashboard/ucat-learning-report` | Unified UCAT Learning Report | `Bearer Token` |
| `GET` | `/student/dashboard/ucat-learning-report/filters` | Dropdown filter options for UCAT learning report | `Bearer Token` |

---

## 7. Student Profile, Activity & Leaderboard

**Base Path**: `/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/student-profile/me` | Fetch authenticated student profile | `Bearer Token` |
| `POST` | `/student-profile` | Create or update student profile details | `Bearer Token` |
| `POST` | `/student-activity/record` | Log student in-app learning activity | `Bearer Token` |
| `GET` | `/user-activity/:userId` | Retrieve activity history for numeric user ID | None |
| `POST` | `/authors/:authorId/follow` | Follow a blog author | `Bearer Token` |
| `DELETE` | `/authors/:authorId/follow` | Unfollow a blog author | `Bearer Token` |
| `GET` | `/authors/following/me` | List authors followed by current student | `Bearer Token` |
| `POST` | `/blogs/:blogId/like` | Like or unlike a blog article | `Bearer Token` |
| `POST` | `/blogs/:blogId/save` | Bookmark or unbookmark a blog article | `Bearer Token` |
| `GET` | `/blogs/saved/me` | List student bookmarked blog articles | `Bearer Token` |

---

## 8. Notifications & Question Feedback

**Base Path**: `/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/notifications/device-token` | Register/refresh FCM device token for push notifications | `Bearer Token` |
| `DELETE` | `/notifications/device-token` | Deactivate FCM device token on logout | `Bearer Token` |
| `POST` | `/notifications/send` | Send targeted push & in-app notification to user(s) | `Bearer Token` |
| `POST` | `/notifications/broadcast` | Broadcast push & in-app notification to students | `Bearer Token` |
| `GET` | `/notifications` | List student notifications with pagination | `Bearer Token` |
| `GET` | `/notifications/unread-count` | Get total count of unread notifications | `Bearer Token` |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read | `Bearer Token` |
| `PATCH` | `/notifications/:notificationId/read` | Mark a specific notification as read | `Bearer Token` |
| `DELETE` | `/notifications/:notificationId` | Dismiss a specific notification | `Bearer Token` |
| `POST` | `/question-feedback` | Submit student feedback or issue on a test question | `Bearer Token` |
| `GET` | `/question-feedback/:questionId` | Retrieve student feedback for a question | `Bearer Token` |
| `POST` | `/review-comments` | Submit review comment for test or question | `Bearer Token` |
| `GET` | `/review-comments/:targetId` | Retrieve review comments for target resource | None |

---

## 9. Blog CMS & Public Content Engine

**Base Path**: `/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/pages` | Fetch public static pages (About, Terms, Privacy) | None |
| `GET` | `/pages/:slug` | Fetch single page by slug | None |
| `GET` | `/blog-search` | Search published blogs by keyword, category, tag | None |
| `GET` | `/blog-reviews` | List approved public article reviews | None |
| `POST` | `/blog-reviews` | Submit user review on a published blog post | `Bearer Token` |

---

## 10. Admin Blog Management APIs

**Base Path**: `/api/v1/admin`

| Resource | Endpoints | Description | Auth |
| :--- | :--- | :--- | :--- |
| **Blogs** | `GET/POST /blogs`, `GET/PATCH/DELETE /blogs/:id` | Full lifecycle CMS (draft, schedule, publish, soft/hard delete, restore) | `Admin Token` |
| **Publishing** | `POST /blogs/:id/publish`, `/unpublish`, `/schedule`, `/duplicate` | Publication workflow management | `Admin Token` |
| **Templates** | `GET/POST /blog-templates`, `GET/PATCH/DELETE /blog-templates/:id` | Reusable layout structures and sections | `Admin Token` |
| **Categories**| `GET/POST /blog-categories`, `GET/PATCH/DELETE /blog-categories/:id` | Hierarchical blog category management | `Admin Token` |
| **Tags** | `GET/POST /blog-tags`, `GET/PATCH/DELETE /blog-tags/:id` | Searchable tags and metrics | `Admin Token` |
| **Authors** | `GET/POST /blog-authors`, `GET/PATCH/DELETE /blog-authors/:id` | Author profiles, credentials and social links | `Admin Token` |
| **Media** | `POST /blog-media/upload`, `GET /blog-media`, `DELETE /blog-media/:id` | Cloudinary asset management | `Admin Token` |
| **SEO** | `GET/PATCH /blog-seo/:id` | Meta tags, canonical URLs, Schema.org config | `Admin Token` |
| **Reviews** | `GET/PATCH/DELETE /blog-reviews/:id` | Review moderation, approve/reject reviews | `Admin Token` |
| **Analytics**| `GET /blog-analytics/overview`, `/performance`, `/views` | Live metrics, readership growth & snapshots | `Admin Token` |

---

## 11. AI Review Tutoring & Blog Assistant

**Base Path**: `/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/chat/sessions` | Initialize AI review chat session grounded in wrong answers | `Bearer Token` |
| `POST` | `/chat/messages` | Exchange conversational messages with Gemini AI tutor | `Bearer Token` |
| `POST` | `/admin/ai/generate-content` | Generate blog content sections via Gemini AI | `Admin Token` |
| `POST` | `/admin/ai/seo-suggestions` | Generate AI meta titles, descriptions & keywords | `Admin Token` |

---

## 12. Standard Response & Error Formats

### Successful Response (`200 OK` / `201 Created`)
```json
{
  "status": "success",
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### Error Response (`400 Bad Request` / `401 Unauthorized` / `404 Not Found`)
```json
{
  "status": "fail",
  "message": "Invalid credentials or request parameters."
}
```

### Server Error (`500 Internal Server Error`)
```json
{
  "status": "fail",
  "message": "An unexpected server error occurred."
}
```
