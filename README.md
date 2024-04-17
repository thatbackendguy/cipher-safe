# CipherSafe - Password Manager

## Introduction
CipherSafe is a password management web API built using Node.js, Express.js, and Mongoose. It provides users with a secure and convenient solution for storing and managing their passwords. With CipherSafe, users can create an account, securely store their passwords, and retrieve them whenever needed. The application utilizes encryption algorithms to ensure the confidentiality of the stored passwords. It also incorporates user authentication and authorization features to protect sensitive data. CipherSafe demonstrates my proficiency in Node.js, Express.js, and Mongoose, as well as my ability to develop secure and robust web applications.

## Tech-stack
* Node.js
* Mongoose
* Express
* MongoDB
* Postman

## Routes

### User
| Sr. No. | Description                   | Request Type | Endpoint                              |
|---------|-------------------------------|--------------|---------------------------------------|
| 1       | Reset Password                | PUT          | `/api/user/reset-password/:token`    |
| 2       | Delete User                   | DELETE       | `/api/user/delete`                    |
| 3       | Generate Forgot Password Token| POST         | `/api/user/forgot-password-token`     |
| 4       | Update Password               | PUT          | `/api/user/update-password`           |
| 5       | Add Password                  | POST         | `/api/user/password/add`              |
| 6       | Get User                      | GET          | `/api/user/`                          |
| 7       | Delete Password               | DELETE       | `/api/user/password/delete/:id`       |
| 8       | Update Password               | PUT          | `/api/user/password/update/:id`       |
| 9       | Decrypt Password              | GET          | `/api/user/password/decrypt/:id`      |


### Authorization
| Sr. No. | Description     | Request Type | Endpoint              |
|---------|-----------------|--------------|-----------------------|
| 1       | Register        | POST         | `/api/auth/register`  |
| 2       | Login           | POST         | `/api/auth/login`     |
| 3       | Logout          | GET          | `/api/auth/logout`    |

## GitHub Repo
<a href="https://github.com/thatbackendguy/cipher-safe"><img src="https://opengraph.githubassets.com/42bc0c1d6fa18b25576ead8f49432f0ca77199d85e517dd6b2366d9d4e4ab955/thatbackendguy/cipher-safe" width="50%"/></a>
