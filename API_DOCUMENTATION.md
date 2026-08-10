# 📚 MBBS.NET Ecosystem API Documentation

Welcome to the official API documentation for the **MBBS.NET System**. This ecosystem comprises two decoupled microservices:

1. **MBBS Backend 1 (`MBBS-backend`)**: Primary backend handling Student & Admin Authentication, NEET Practice & Question Bank, UCAT Module, Blog CMS, AI Chat, User Activity Tracking, and Admin Control Panel.
2. **MBBS Backend 2 (`MBBS-backend-2`)**: Dedicated **CSE (College Search Engine)** handling Destination Country Discovery, Interactive Eligibility Questionnaire, University Matching & Recommendation Algorithm, and Course Details.

---

## 🌐 Service Deployment & Base URLs

| Service Name | Environment | Base URL | Documentation |
| :--- | :--- | :--- | :--- |
| **MBBS Backend 1 (Core)** | Production | `https://api.mbbs.net` | `https://api.mbbs.net/api-docs` |
| **MBBS Backend 2 (CSE Engine)** | Production | `https://cse-api.mbbs.net` | `https://cse-api.mbbs.net/api-docs` |
| **Local Development** | Local | `http://localhost:3000` | `http://localhost:3000/api-docs` |

---

## 🔐 Authentication & Authorization Mechanics

The ecosystem uses **JSON Web Tokens (JWT)**. Backend 1 acts as the Identity Provider (IdP).

- **Header Name**: `Authorization`
- **Header Format**: `Bearer <JWT_TOKEN>`
- **Token Validity**: Access Tokens expire in `1h`, Refresh Tokens expire in `30d`.
- **Backend Cross-Validation**: Backend 2 (`MBBS-backend-2`) shares the `SECRET_KEY` with Backend 1 to decode and verify JWT Bearer tokens transparently without extra HTTP hops.

---

## 🚀 API Endpoint Reference Index

### 1. Authentication & Account Management (`Backend 1`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register new student account & trigger OTP | None |
| `POST` | `/api/v1/auth/verify-signup-otp` | Verify OTP and activate student account | None |
| `POST` | `/api/v1/auth/login` | Login with Phone/Email & Password | None |
| `POST` | `/api/v1/auth/google-login` | Verify Firebase Google ID Token & Login | None |
| `POST` | `/api/v1/auth/refresh-token` | Exchange valid Refresh Token for new Access Token | None |
| `POST` | `/api/v1/auth/send-reset-otp` | Trigger password reset OTP to phone/email | None |
| `POST` | `/api/v1/auth/verify-reset-otp` | Verify password reset OTP | None |
| `POST` | `/api/v1/auth/reset-password` | Set new account password via verified OTP session | None |

---

### 2. NEET Practice & Question Bank (`Backend 1`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/qod` | Fetch Question of the Day with streak status | Optional |
| `POST` | `/api/v1/qod/answer` | Submit answer for Question of the Day | Optional |
| `GET` | `/api/v1/test-questions` | Fetch NEET practice questions with subject/topic filters | Optional |
| `POST` | `/api/v1/test-questions/submit` | Submit practice test session & receive instant score | Bearer Token |
| `GET` | `/api/v1/leaderboard` | Global & Weekly student performance leaderboard | None |
| `GET` | `/api/v1/previous-year-tests` | List NEET Previous Year Question (PYQ) Papers | None |
| `GET` | `/api/v1/previous-year-tests/:id` | Fetch specific PYQ paper with questions | None |

---

### 3. UCAT Entrance Exam Module (`Backend 1`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ucat/test/start` | Initialize a timed UCAT test session | Bearer Token |
| `POST` | `/api/v1/ucat/test/submit` | Submit UCAT test responses and compute score | Bearer Token |
| `GET` | `/api/v1/ucat/streaks` | Get student UCAT preparation streak | Bearer Token |
| `POST` | `/api/v1/ucat/chat` | Send question to AI UCAT Tutor | Bearer Token |
| `GET` | `/api/v1/ucat/insights` | Fetch AI-driven performance zone insights | Bearer Token |

---

### 4. CSE - Open University Finder Engine (`Backend 2`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cse/countries` | **Step 1**: Load available destination countries | None |
| `GET` | `/api/v1/cse/countries/:countryId/questions` | **Step 2A**: Load country eligibility questionnaire (Path) | None |
| `POST` | `/api/v1/cse/countries/questions` | **Step 2B**: Load questionnaire (JSON Body `{country_id}`) | None |
| `POST` | `/api/v1/cse/recommendations` | **Step 3**: Submit student marks/budget & get ranked universities | Optional |
| `GET` | `/api/v1/cse/recommendations/:sessionId` | Retrieve saved recommendation session results | None |
| `GET` | `/api/v1/cse/universities/:identifier` | **Step 4**: Fetch university profile, fee structure & courses | None |
| `POST` | `/api/v1/cse/seed` | Seed initial countries, questions, universities & courses | Admin Key |

---

### 5. Blog & Content Management System (CMS) (`Backend 1`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pages` | List published static pages (Terms, Privacy, About) | None |
| `GET` | `/api/v1/blog-search` | Search articles by keyword, category, or tag | None |
| `GET` | `/api/v1/blog-reviews` | Public user reviews and feedback on articles | None |
| `POST` | `/api/v1/blog-reviews` | Submit article review | Bearer Token |

---

### 6. Admin Blog Management APIs (`Backend 1`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/blogs` | List all blogs with pagination, filter, search | Admin Token |
| `POST` | `/api/v1/admin/blogs` | Create a new blog post in DRAFT status | Admin Token |
| `GET` | `/api/v1/admin/blogs/:id` | Get single blog details by MongoDB ObjectId | Admin Token |
| `PATCH` | `/api/v1/admin/blogs/:id` | Update fields of an existing blog post | Admin Token |
| `POST` | `/api/v1/admin/blogs/:id/publish` | Publish a draft or scheduled blog post | Admin Token |
| `POST` | `/api/v1/admin/blogs/:id/unpublish` | Revert published blog post to DRAFT status | Admin Token |
| `POST` | `/api/v1/admin/blogs/:id/schedule` | Schedule blog publication for a future date/time | Admin Token |
| `POST` | `/api/v1/admin/blogs/:id/duplicate` | Duplicate an existing blog as a new draft | Admin Token |
| `POST` | `/api/v1/admin/blogs/:id/featured-image` | Upload and attach featured banner image | Admin Token |
| `DELETE` | `/api/v1/admin/blogs/:id` | **Soft Delete Blog**: Marks `isDeleted=true`, status `ARCHIVED` | Admin Token |
| `DELETE` | `/api/v1/admin/blogs/:id/permanent` | **Permanent Delete Blog**: Permanently purges from DB | Admin Token |
| `PATCH` | `/api/v1/admin/blogs/:id/restore` | Restore soft-deleted blog back to DRAFT status | Admin Token |

---

## 📋 Comprehensive Blog Model Fields

Below is the complete list of all database schema fields for a Blog entry:

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Unique MongoDB Identifier |
| `title` | String | **Yes** | Article Title (max 250 chars) |
| `blogCode` | String | Auto | Unique Immutable Code (e.g. `BLG-NEET-2026-X12`) |
| `slug` | String | **Yes** | URL Slug (Unique, Lowercase) |
| `shortDescription` | String | No | Brief summary (max 500 chars) |
| `excerpt` | String | Auto/Optional | Auto-generated or manual text snippet (180 chars) |
| `content` | Object/String | **Yes** | Full article content (Rich Text / HTML / JSON Blocks) |
| `blogType` | Enum | No | `BLOG`, `NEWS`, `ARTICLE`, `GUIDE`, `FAQ`, `CASE_STUDY` |
| `template` | ObjectId | **Yes** | Reference to `BlogTemplate` |
| `category` | ObjectId | **Yes** | Reference to `BlogCategory` |
| `tags` | Array[ObjectId] | No | References to `BlogTag` |
| `author` | ObjectId | **Yes** | Reference to `BlogAuthor` |
| `featuredImage` | Object | No | `{ url: String, alt: String, caption: String }` |
| `gallery` | Array[Object] | No | Array of `{ url: String, alt: String }` |
| `videos` | Array[Object] | No | Array of `{ title: String, url: String }` |
| `status` | Enum | No | `DRAFT`, `REVIEW`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED` |
| `visibility` | Enum | No | `PUBLIC`, `PRIVATE`, `PASSWORD` |
| `password` | String | Conditional | Required if `visibility === "PASSWORD"` |
| `publishedAt` | Date | Auto | Timestamp when published |
| `scheduledAt` | Date | Conditional | Future publication timestamp |
| `isFeatured` | Boolean | Default false | Highlight in featured carousel |
| `isTrending` | Boolean | Default false | Highlight in trending section |
| `isPinned` | Boolean | Default false | Pin to top of category listing |
| `readingTime` | Number | Auto | Calculated reading time in minutes |
| `totalViews` | Number | Default 0 | Total reader view count |
| `totalLikes` | Number | Default 0 | Total user like count |
| `totalShares` | Number | Default 0 | Total share count |
| `totalComments` | Number | Default 0 | Total comment count |
| `seo` | Object | No | `{ metaTitle, metaDescription, keywords: [], canonicalUrl, robots }` |
| `faqs` | Array[Object] | No | Array of `{ question: String, answer: String }` |
| `relatedBlogs` | Array[ObjectId] | No | References to other `Blog` documents |
| `metadata` | Object | Default `{}` | Custom key-value metadata |
| `createdBy` | ObjectId | Auto | Admin user who created the blog |
| `updatedBy` | ObjectId | Auto | Admin user who last updated the blog |
| `isDeleted` | Boolean | Default false | Soft deletion flag |
| `deletedAt` | Date | Default null | Soft deletion timestamp |
