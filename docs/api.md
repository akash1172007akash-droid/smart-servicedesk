# Smart ServiceDesk REST API Specification

The Smart ServiceDesk API is structured around REST principles. All requests and responses use JSON (except for file uploads and downloads which utilize multipart form-data and binary streaming).

**Base URL:** `http://localhost:8080/api`

---

## 1. Standard Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "timestamp": "2026-09-25T13:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Ticket title is required",
  "path": "/api/tickets",
  "validationErrors": {
    "title": "Title must be between 5 and 200 characters"
  }
}
```

---

## 2. Authentication Endpoints

### Register Public User
- **POST** `/auth/register`
- **Access:** Public (Defaults to role `EMPLOYEE`)
- **Request Body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "user": {
      "id": 8,
      "fullName": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "EMPLOYEE",
      "status": "ACTIVE"
    }
  }
}
```

### User Login
- **POST** `/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "user": {
      "id": 1,
      "fullName": "Alex Vance (Admin)",
      "email": "admin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

### Current User Profile
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User DTO

---

## 3. Tickets Endpoints

### List / Search Tickets
- **GET** `/tickets`
- **Access:** Authenticated (Role-scoped: Employees see own tickets, Agents/Admins see all)
- **Query Parameters:**
  - `search` (string, optional)
  - `status` (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
  - `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `categoryId` (number, optional)
  - `unassignedOnly` (boolean, optional)
  - `page` (number, default: 0)
  - `size` (number, default: 10)
  - `sort` (string, default: `createdAt,desc`)
- **Response (200 OK):** `PagedResponse<TicketResponse>`

### Get Ticket by ID
- **GET** `/tickets/{id}`
- **Access:** Authenticated (Creator, Agent, Admin)
- **Response (200 OK):** `TicketDetailResponse` (includes ticket metadata, comments array, attachments array, history audit logs)

### Create Ticket
- **POST** `/tickets`
- **Access:** Authenticated
- **Content-Type:** `multipart/form-data` or `application/json`
- **Request Parameters:**
  - `title` (string, 5-200 chars)
  - `description` (string, 10-5000 chars)
  - `categoryId` (number)
  - `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `file` (binary file, optional)
- **Response (201 Created):** Created `TicketResponse` with generated `ticketNumber`.

### Update Ticket Status
- **PATCH** `/tickets/{id}/status`
- **Access:** Authenticated (Role & state machine restrictions apply)
- **Request Body:**
```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Replaced the damaged network patch cable and validated switch port throughput."
}
```
- **Response (200 OK):** Updated `TicketResponse`

### Update Ticket Priority
- **PATCH** `/tickets/{id}/priority`
- **Access:** `SUPPORT_AGENT`, `ADMIN`
- **Request Body:**
```json
{
  "priority": "CRITICAL"
}
```

### Assign Ticket
- **PATCH** `/tickets/{id}/assign`
- **Access:** `SUPPORT_AGENT`, `ADMIN`
- **Request Body:**
```json
{
  "assignedToId": 2
}
```

### Delete Ticket
- **DELETE** `/tickets/{id}`
- **Access:** `ADMIN` only
- **Response (200 OK)**

---

## 4. Comments & Attachments Endpoints

### List Comments
- **GET** `/tickets/{ticketId}/comments`
- **Response (200 OK):** Array of comment records

### Post Comment
- **POST** `/tickets/{ticketId}/comments`
- **Request Body:**
```json
{
  "commentText": "Please verify if the monitor powers on using a different wall outlet."
}
```
- **Response (201 Created):** Created `CommentResponse`

### Upload Attachment
- **POST** `/tickets/{ticketId}/attachments`
- **Content-Type:** `multipart/form-data`
- **Form Part:** `file` (MultipartFile)
- **Response (201 Created):** `AttachmentResponse`

### Download Attachment
- **GET** `/tickets/{ticketId}/attachments/{attachmentId}/download`
- **Access:** Public / Authenticated
- **Response (200 OK):** Binary stream with `Content-Disposition: attachment; filename="..."`

---

## 5. Audit History Endpoint

### Get Ticket History
- **GET** `/tickets/{ticketId}/history`
- **Access:** Ticket Creator, Agent, Admin
- **Response (200 OK):** Chronological list of all actions, actors, and state modifications.

---

## 6. Service Categories Endpoints

### List Categories
- **GET** `/categories?all=false`
- **Access:** Authenticated (returns active categories for ticket forms, or all if `all=true` for admin management)

### Create Category
- **POST** `/categories`
- **Access:** `ADMIN`
- **Request Body:**
```json
{
  "name": "Cloud Infrastructure",
  "description": "AWS/Azure compute instances, IAM roles, and storage buckets",
  "isActive": true
}
```

### Update Category
- **PUT** `/categories/{id}`
- **Access:** `ADMIN`

---

## 7. User Management Endpoints

### List Users
- **GET** `/users`
- **Access:** `ADMIN`

### Get Support Specialists
- **GET** `/users/agents`
- **Access:** `SUPPORT_AGENT`, `ADMIN`

### Create User
- **POST** `/users`
- **Access:** `ADMIN`

### Update User
- **PUT** `/users/{id}`
- **Access:** `ADMIN`

### Toggle User Active Status
- **PATCH** `/users/{id}/status`
- **Access:** `ADMIN` (Safeguards prevent deactivating the last active Admin)

---

## 8. Dashboard Analytics Endpoints

### Admin Dashboard
- **GET** `/dashboard/admin`
- **Access:** `ADMIN`
- **Returns:** KPI counts, Status distribution, Priority breakdown, Category volume, 7-day trend array, and Recent 10 tickets.

### Agent Dashboard
- **GET** `/dashboard/agent`
- **Access:** `SUPPORT_AGENT`, `ADMIN`
- **Returns:** Assigned tickets, Unassigned tickets, Critical count, My active queue, and Available unassigned ticket pool.

### Employee Dashboard
- **GET** `/dashboard/employee`
- **Access:** Authenticated
- **Returns:** My total tickets, status counts, and My recent tickets list.
