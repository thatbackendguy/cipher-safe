# CipherSafe - Password Manager
CipherSafe is a password management web API built using Node.js, Express.js, and Mongoose. It provides users with a secure and convenient solution for storing and managing their passwords. With CipherSafe, users can create an account, securely store their passwords, and retrieve them whenever needed. The application utilizes encryption algorithms to ensure the confidentiality of the stored passwords. It also incorporates user authentication and authorization features to protect sensitive data. CipherSafe demonstrates my proficiency in Node.js, Express.js, and Mongoose, as well as my ability to develop secure and robust web applications.
### &copy; Yash Prajapati 2023

---
ROUTES
---
### User
- PUT /api/user/reset-password/:token
- DELETE /api/user/delete
- POST /api/user/forgot-password-token
- PUT /api/user/update-password
- POST /api/user/password/add
- GET /api/user/
- DELETE /api/user/password/delete/:id
- PUT /api/user/password/update/:id
- GET /api/user/password/decrypt/:id

### Authorization
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/logout