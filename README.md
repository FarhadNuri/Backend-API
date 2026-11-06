# Daktar Kothay  — Specialist Doctor & Chamber Finder API

> **A fast RESTful backend API that helps patients in Bangladesh instantly discover the right medical specialists and visiting chambers near them based on disease symptoms and location.**

[![Node.js Version](https://img.shields.io/badge/Node.js-20%2B-brightgreen)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-Express%205-blue)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Plain%20SQL)-blue)](https://www.postgresql.org/)
[![Validation](https://img.shields.io/badge/Validation-Zod-purple)](https://zod.dev/)
[![Documentation](https://img.shields.io/badge/Docs-Swagger%20UI-green)](/api-docs)

---

## 1. Overview & Problem Solved

In Bangladesh, finding the right specialist doctor is difficult. Patients frequently do not know which medical specialty corresponds to their symptoms (e.g., whether a persistent skin rash requires a Dermatologist or an Allergist) and often travel long distances without verified information regarding doctor visiting hours, chamber addresses, or consultation fees.

**Daktar Kothay** solves this problem by connecting disease symptoms directly to verified specialists:
- A patient enters a common symptom or disease name (e.g., *"skin allergy"*, *"chest pain"*, *"migraine"*), and the API maps it to the relevant medical specialty.
- The search engine calculates distance using the Haversine formula against GPS coordinates or local area names (e.g., *"GEC Circle"*, *"Agrabad"*).
- Verified doctors manage their own chambers and consultation hours, while an admin validates doctors before they appear in public search results.

---

## 2. Live Links

- **API Base URL:** `https://<your-deployment-host>.com/api` *(replace after deployment)*
- **Interactive Swagger Docs:** `https://<your-deployment-host>.com/api-docs` *(interactive UI to test all 19 endpoints)*
- **Health Check:** `https://<your-deployment-host>.com/api/health`

---

## 3. Features by Role

### Patient (USER)
- Signup and login with JWT authentication.
- Search doctors by **disease/symptom**, **specialty**, **name**, **location/area**, **weekday**, and **maximum fee**.
- Real-time disease autocomplete suggestions matching English terms and Bengali aliases.
- View verified doctor details, qualifications, degrees, chamber locations, and visiting schedules.
- Save and update home/work GPS coordinates in user profile for one-click localized search.

### Doctor (DOCTOR)
- Register with BMDC (Bangladesh Medical and Dental Council) registration number and specialty.
- View and update professional profile (degrees, years of experience, bio).
- Full chamber management: add, update, and delete visiting chambers with weekday consultation time slots.
- Track profile completion checklist (`hasBio`, `hasDegrees`, `hasChamber`).

### System Admin (ADMIN)
- Dedicated administrative dashboard login.
- Filter doctors by verification status (`PENDING`, `VERIFIED`, `REJECTED`).
- Approve pending doctor registrations or reject unauthorized submissions.
- Directly onboard verified doctors with initial chambers and temporary passwords in a single atomic transaction.

### Supporting Features
- `GET /api/specialties` providing pre-seeded medical specialty dropdown data.
- Built-in rate limiting on authentication routes.
- Pre-seeded realistic dataset for Chattogram city (12 areas, 12 specialties, 30 diseases, and 40 sample doctors).

---

## 4. Tech Stack

| Component | Choice | Description |
|---|---|---|
| **Runtime** | Node.js (v20+) | CommonJS modules, native async/await, no build step |
| **Framework** | Express 5 | High performance, minimal routing framework |
| **Database** | PostgreSQL | Relational integrity, constraints, indexed geo coordinates |
| **Database Driver** | `pg` (node-postgres) | Hand-crafted parameterized SQL queries with zero ORM overhead |
| **Input Validation** | Zod | Strict schema validation for body, query, and path parameters |
| **Authentication** | JWT & bcrypt | Bearer token authorization with role-based access control |
| **API Documentation** | Swagger UI (`swagger-jsdoc`) | Interactive OpenAPI 3.0 documentation with pre-populated demo examples |
| **Code Quality** | ESLint | Flat config linting catching syntax errors and unused variables |

---

## 5. Architecture & Design Decisions

### Folder Structure
```text
myideabackend/
├── src/
│   ├── config/              # envConfig (Zod validated) & db.js (pg Pool, transactions)
│   ├── db/                  # schema.sql, init.js (table creation), seed.js (realistic demo data)
│   ├── middlewares/         # auth (RBAC), validateRequest (Zod), rateLimiter, notFoundHandler
│   ├── modules/
│   │   ├── auth/            # Register (patient/doctor), login, JWT issuance
│   │   ├── user/            # Profile retrieval, saved location updates
│   │   ├── doctor/          # Doctor profile view/update, public doctor view
│   │   ├── chamber/         # Chamber & schedule CRUD (mounted at /api/doctors/me/chambers)
│   │   ├── search/          # Haversine distance search, filters, pagination
│   │   ├── disease/         # Disease autocomplete & specialties listing
│   │   └── admin/           # Doctor verification, status filtering, direct doctor onboarding
│   ├── routes/              # Central router mounting all modules under /api
│   ├── utils/               # AppError, sendResponse, handleAsync, globalErrorHandler, tokens, geo
│   ├── app.js               # Express application setup and middleware order
│   └── server.js            # Database connection, HTTP listener, graceful shutdown
├── eslint.config.js
├── .env.example
└── package.json
```

### Layered Request Lifecycle
```text
HTTP Request
  └─► Router (/api/...)
        └─► validateRequest(schema)       (Zod validation rejects bad inputs with 400)
              └─► auth(...roles)          (Verifies JWT, role permissions, active status)
                    └─► Controller        (Unpacks input, calls service, wraps handleAsync)
                          └─► Service     (Business logic & parameterized SQL with pg)
                                └─► sendResponse(res, ...) (Standard success response envelope)
```

### Key Architectural Decision Notes
- **Why PostgreSQL:** Provides strict relational integrity, composite foreign key cascades, and check constraints (`role`, `status`, `fee > 0`, `day`).
- **Why Separate Services from Controllers:** Controllers only handle HTTP concerns and response formatting. Services encapsulate pure business logic and database access, making code clean, reusable, and easy to unit test.
- **Why Zod:** Rejects invalid payloads before controllers execute, ensuring database operations receive clean, type-safe data.
- **Why Plain SQL (`pg`) without an ORM:** Eliminates ORM query bloat, provides full control over complex spherical Haversine formulas, and guarantees explicit multi-table transactions via `withTransaction`.
- **PostGIS Future Upgrade:** Simple spherical Haversine distance with bounding box indexing is lightweight and zero-dependency for current scale; PostGIS is designated as a future upgrade.
- **Global Error Handling:** All runtime errors pass to `globalErrorHandler`. Database codes are mapped to clear HTTP responses: `23505` unique violation (409), `23503` foreign key (400), `22P02` invalid UUID format (400), `23514` check constraint (400).

---

## 6. Database ER Diagram

```mermaid
erDiagram
    users ||--o| user_profiles : "has (optional 1:1)"
    users ||--o| doctors : "is (if role = DOCTOR)"
    specialties ||--o{ doctors : "specializes in"
    specialties ||--o{ diseases : "treats"
    doctors ||--o{ chambers : "owns"
    chambers ||--o{ chamber_schedules : "has visiting days"
    areas }|..|{ chambers : "lookup reference"

    users {
        uuid id PK
        string name
        string email UK
        string phone UK
        string password_hash
        string role "USER, DOCTOR, ADMIN"
        boolean is_active
        timestamptz created_at
    }

    user_profiles {
        uuid id PK
        uuid user_id FK
        string city
        string area
        float lat
        float lng
    }

    specialties {
        uuid id PK
        string name UK
    }

    diseases {
        uuid id PK
        string name UK
        string_array aliases
        uuid specialty_id FK
    }

    doctors {
        uuid id PK
        uuid user_id FK
        uuid specialty_id FK
        string bmdc_number UK
        string_array degrees
        int experience_years
        string bio
        string status "PENDING, VERIFIED, REJECTED"
    }

    chambers {
        uuid id PK
        uuid doctor_id FK
        string name
        string address
        string city
        string area
        float lat
        float lng
        string phone
        int fee
        boolean is_active
    }

    chamber_schedules {
        uuid id PK
        uuid chamber_id FK
        string day "SAT..FRI"
        string start_time "HH:mm"
        string end_time "HH:mm"
    }

    areas {
        uuid id PK
        string name
        string city
        float lat
        float lng
    }
```


## 7. How Search Works

The search engine (`GET /api/search/doctors`) finds matching chambers in a multi-step pipeline:

```text
Disease Query ──► Match Name/Aliases ──► Specialty ID ──► Verified Doctors ──► Nearby Chambers ──► Haversine Distance Filter ──► Sorted Results
```

1. **Disease & Specialty Resolution:**
   - If `disease` is provided (e.g. `"skin allergy"` or alias `"itching"`), the API looks up the disease and finds its medical specialty (`Dermatologist`).
   - If an explicit `specialtyId` is passed, it takes precedence.
2. **Location Resolution Priority:**
   - **Priority 1:** `lat` and `lng` query parameters (GPS coordinates from patient's device).
   - **Priority 2:** `area` (and optional `city`) looked up in the `areas` table (e.g. `"GEC Circle"`).
   - **Priority 3:** Logged-in user's saved location profile from `user_profiles` (via `optionalAuth`).
   - *If no location can be resolved, the API returns a `400 Bad Request`.*
3. **Bounding Box Pre-Filter:**
   - A rough square bounding box is calculated using `lat ± (radius / 111)` to utilize the `idx_chambers_location` index on PostgreSQL, discarding far-away rows before trigonometric evaluation.
4. **Haversine Distance & Filters:**
   - Accurate distance is calculated in kilometers:
     $$\text{distanceKm} = 6371 \times \arccos\left(\cos(\text{lat}_1) \cos(\text{lat}_2) \cos(\text{lng}_2 - \text{lng}_1) + \sin(\text{lat}_1) \sin(\text{lat}_2)\right)$$
   - Only chambers belonging to **`VERIFIED` doctors** and marked as **`is_active = true`** within the radius (default 5 km, max 50 km) are returned.
   - Additional filters for doctor `name`, `maxFee`, and open visiting `day` are applied.
5. **Visibility Safeguard:**
   - Doctors with status `PENDING` or `REJECTED` never appear in search results or public doctor details.

---

## 8. Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or newer
- [PostgreSQL](https://www.postgresql.org/) v14 or newer (local or hosted like Neon/Supabase)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd myideabackend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Update your credentials in `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/daktar_kothay
DB_SSL=false
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
ADMIN_EMAIL=admin@daktarkothay.com
ADMIN_PASSWORD=Admin@12345
```

### 3. Initialize Schema & Seed Data
```bash
# Create all tables, constraints, and indexes
npm run db:init

# Seed realistic specialties, diseases, areas, demo accounts, and 40 sample doctors
npm run db:seed
```

### 4. Run the Application
```bash
# Development mode with auto-reload
npm run dev

# Production start
npm start
```

Visit **`http://localhost:5000/api-docs`** in your browser to inspect and interact with the Swagger documentation.



## 9. Demo Accounts

### Pre-Seeded Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **System Admin** | `admin@daktarkothay.com` | `Admin@12345` | Can list, approve, reject, or directly create doctors |
| **Verified Doctor** | `doctor@demo.com` | `Doctor@12345` | Dr. Demo Verified (Dermatologist with 2 active chambers) |
| **Pending Doctor** | `pending@demo.com` | `Doctor@12345` | Dr. Demo Pending (Waiting for admin verification) |
| **Patient (User)** | `user@demo.com` | `User@12345` | Has saved profile location at GEC Circle, Chattogram |




## 10. API Summary (19 Endpoints)

| # | Method | Path | Access | Purpose |
|---|---|---|---|---|
| 1 | `POST` | `/api/auth/register` | Public | Register a patient account |
| 2 | `POST` | `/api/auth/register/doctor` | Public | Register a doctor account (pending verification) |
| 3 | `POST` | `/api/auth/login` | Public | Authenticate user/doctor/admin and get JWT |
| 4 | `GET` | `/api/users/me` | USER | View authenticated user profile & location |
| 5 | `PATCH` | `/api/users/me/location` | USER | Save or update patient GPS location |
| 6 | `GET` | `/api/doctors/me` | DOCTOR | View own doctor profile, chambers & completion |
| 7 | `PATCH` | `/api/doctors/me` | DOCTOR | Update doctor bio, degrees, or experience |
| 8 | `GET` | `/api/doctors/me/chambers` | DOCTOR | List all owned visiting chambers & schedules |
| 9 | `POST` | `/api/doctors/me/chambers` | DOCTOR | Add a visiting chamber with consultation hours |
| 10 | `PATCH` | `/api/doctors/me/chambers/:chamberId` | DOCTOR | Update chamber address, fee, or schedules |
| 11 | `DELETE` | `/api/doctors/me/chambers/:chamberId` | DOCTOR | Delete a visiting chamber |
| 12 | `GET` | `/api/doctors/:id` | Public | View public details of a verified doctor |
| 13 | `GET` | `/api/search/doctors` | Public (opt token) | Core geo search by disease, distance, fee, day |
| 14 | `GET` | `/api/diseases` | Public | Autocomplete disease names and Bengali aliases |
| 15 | `GET` | `/api/specialties` | Public | List all medical specialties |
| 16 | `GET` | `/api/admin/doctors` | ADMIN | List doctors filtered by status (PENDING, etc.) |
| 17 | `PATCH` | `/api/admin/doctors/:id/approve` | ADMIN | Approve a pending doctor |
| 18 | `PATCH` | `/api/admin/doctors/:id/reject` | ADMIN | Reject doctor (hides from public search) |
| 19 | `POST` | `/api/admin/doctors` | ADMIN | Directly create a verified doctor with chambers |




## 12. Future Improvements

Planned future iterations outside the current scope:
- **PostGIS Geospatial Engine:** Migration from spherical Haversine SQL to native PostGIS geometry points for high-volume polygon searches.
- **Redis Caching:** In-memory caching for disease autocomplete and popular specialty search results.
- **Patient Reviews & Ratings:** Verified patient reviews and ratings for doctor chambers.
- **Direct Appointment Booking:** Real-time queue numbering and appointment booking per schedule slot.
- **Email Verification & Password Reset:** Automated OTP/token-based email verification via Nodemailer/SendGrid.
- **Reporting System:** Community reporting for outdated chamber visiting hours or altered fees.

---

