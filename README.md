# Patient Documents Portal — Design

---

## 1. Tech Stack Choices

**Q1. Frontend framework**

- **React (Vite)**

  - Reason: lightweight dev server, fast HMR, popular component model.

**Q2. Backend framework**

- **Node.js + Express**

  - Reason: simple REST APIs, excellent middleware for file uploads (multer), easy local development.

**Q3. Database**

- **SQLite (better-sqlite3)**

  - Reason: zero-config, single-file DB, perfect for local/small apps. Easy migration to Postgres if needed.

**Q4. If supporting 1,000 users — suggested changes**

- Migrate files to object storage (S3). Use Postgres with connection pooling.
- Containerize backend (Docker) and run behind a load balancer.
- Add authentication (JWT / OAuth), per-user scoping, rate-limiting, monitoring.

---

## 2. Architecture Overview

Frontend (React) <-> Backend (Express) -> SQLite (metadata) + uploads/ (file storage)

- Browser sends multipart upload to backend
- Backend stores file in `uploads/` and metadata in `db.sqlite3`
- Frontend lists metadata and can request download/delete endpoints

---

## 3. API Specification

Base: `http://localhost:4000`

### POST /documents/upload

- `multipart/form-data` field: `file`
- Success (200): `{ success: true, document: { id, filename, filesize, created_at } }`
- Errors: 400 (no file), 415 (not pdf), 413 (too large)

### GET /documents

- Returns list of documents: `{ success: true, documents: [ ... ] }`

### GET /documents/:id

- Streams the file for download. Sets `Content-Disposition` header.

### DELETE /documents/:id

- Deletes file from disk and removes metadata. Returns `{ success: true }`.

---

## 4. Data Flow Description

**Q5.File Upload/download**
**Upload flow**

1. User selects PDF in React form.
2. Client validates file type & size (<=10MB).
3. Client POSTs `multipart/form-data` to `/documents/upload`.
4. Server validates (Multer + fileFilter) and saves file `uploads/<unique>`.
5. Server writes metadata to SQLite and returns metadata.
6. Client refreshes list.

**Download flow**

1. Client GETs `/documents/:id`.
2. Server finds DB row, reads file and streams it with original filename.

---

## 5. Assumptions

- Single-user scope (no auth). File size limit 10MB. Only PDFs allowed. Files stored locally.

---

## Full Implementation — Project Files (copy these into repo)

Below are all project files for a working **React + Express + SQLite** app. Copy into a folder `patient-portal/` with `backend/` and `frontend/` as shown.

---

### repo structure

```
patient-portal/
├─ backend/
│  ├─ package.json
│  ├─ server.js
│  ├─ db.sqlite3 (created at runtime)
│  ├─ uploads/ (created at runtime)
│  └─ .gitignore
├─ frontend/
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ src/
│  │  ├─ main.jsx
│  │  ├─ App.jsx
│  │  ├─ index.css
│  │  └─ components/
│  │     ├─ UploadForm.jsx
│  │     └─ DocumentsList.jsx
│  └─ .gitignore
└─ README.md
```

---
