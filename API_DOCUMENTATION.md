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

### 5. Blog & Content Management System (`Backend 1`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pages` | List published static pages (Terms, Privacy, About) | None |
| `GET` | `/api/v1/blog-search` | Search articles by keyword, category, or tag | None |
| `GET` | `/api/v1/blog-reviews` | Public user reviews and feedback on articles | None |
| `POST` | `/api/v1/blog-reviews` | Submit article review | Bearer Token |

---

### 6. Admin Control Panel (`Backend 1` & `Backend 2`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/admin/login` | Platform Admin Login | None |
| `GET` | `/api/v1/admin/blog-analytics` | Comprehensive blog traffic & reader analytics | Admin Token |
| `POST` | `/api/v1/admin/blogs` | Create new blog post | Admin Token |
| `PUT` | `/api/v1/admin/blogs/:id` | Edit existing blog post | Admin Token |
| `POST` | `/api/v1/admin/blog-media` | Upload media image to Cloudinary | Admin Token |
| `POST` | `/api/v1/cse/admin/universities` | Create/Edit university entry in CSE Engine | Admin Token |
| `POST` | `/api/v1/cse/admin/courses` | Create/Edit course entry in CSE Engine | Admin Token |

---

## 📝 Request & Response Payload Examples

### 1. CSE Recommendation Request (`POST /api/v1/cse/recommendations`)
```json
{
  "country_id": "66b0a1b2c3d4e5f6789a0b1c",
  "answers": {
    "pcb_percentage": 65,
    "neet_score": 240,
    "budget_usd": 25000,
    "preferred_language": "English"
  },
  "student_info": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "+919876543210"
  }
}
```

### 2. CSE Recommendation Response
```json
{
  "status": "success",
  "data": {
    "session_id": "REC-1723000000-ABCDEF",
    "country": "Russia",
    "total_universities_evaluated": 12,
    "universities_that_fit": [
      {
        "rank": 1,
        "match_percentage": 95,
        "university": {
          "id": "66b0a1b2c3d4e5f6789a0b1d",
          "name": "Kazan Federal University",
          "slug": "kazan-federal-university",
          "city": "Kazan",
          "world_rank": 396,
          "annual_tuition_fee_usd": 5500,
          "logo": "https://example.com/logo.png"
        }
      }
    ]
  }
}
```
