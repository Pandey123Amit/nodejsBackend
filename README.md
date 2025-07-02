# Todo Backend System

A robust and secure backend system for managing todo items, user authentication, and email notifications. Built with flexibility, code reusability, and clean architecture in mind.

---

## 🚀 Features

### ✅ Todo CRUD Operations
- **GET** – Fetch all todos or individual todo items.
- **POST** – Create new todo items.
- **PUT** – Update existing todo items.
- **DELETE** – Remove todo items by ID.

### 📧 Dynamic Email Notifications
- Email notifications triggered on key actions:
  - Todo creation
  - Todo completion
  - Todo updates/edits
- Emails include dynamic user-specific content (e.g., user’s name, todo title).

### 📁 Clean API Routing
- Well-organized API routes for easier maintenance and scalability.

---

## 👤 User Authentication System

### 🔐 User Login System
- Supports login with either **username** or **email**.
- Secure login session with token-based authentication (no JWT).

### 🔑 Random Password Generation
- Passwords are generated dynamically in the format: `Remote@XYZ` (e.g., `Remote@837`).

### 📝 User Signup with Email Notification
- On successful signup:
  - A random password is generated.
  - Login credentials (username & password) are emailed to the user.

### 🔄 Flexible Login Logic
- Users can log in using **username/email + password**.

### 🛡️ Custom Token-Based Authentication
- Secure, randomly generated token is created upon login and stored in the database.
- Used for managing active user sessions.
- No use of JWT for increased control and simplicity.

### 🔓 Logout Functionality
- Logout endpoint securely verifies and removes the token.

---

## 🧰 Utility Functions

### 🗃️ Dynamic Database Insert Function
- Reusable function for inserting records into any database table.
- Accepts:
  - Table name
  - List of columns
  - List of values
- Automatically constructs and executes the SQL insert query.

---

## 🧪 API Testing

- All endpoints tested thoroughly using **Postman**.
- Validated with multiple test cases and data inputs.

---

## 📂 Project Structure (Optional Example)

