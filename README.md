# School Management System

## Introduction

This app allows users to perform basic CRUD operations on three main entities: School, Classroom, and Student. The application should provide APIs that enable the management of these entities. Superadmins will have the ability to add schools, while school admins can manage classrooms and students within their respective schools.

## Installation

To run the project, execute the following command:

### using docker
```
docker-compose up
```
### without docker
```
npm i
```

## Pre run

Make sure to create `.env` file configured with the following variables:

- `MONGO_URI`: MongoDB connection URI
- `REDIS_URI`: Redis connection URI
- `LONG_TOKEN_SECRET`: Secret for generating long-lived JWT tokens
- `SHORT_TOKEN_SECRET`: Secret for generating short-lived JWT tokens
- `NACL_SECRET`: Secret for cryptographic operations

## Run
```
<!-- run in development mode -->
npm run dev

<!-- run in production mode -->
npm run prod

<!-- run tests -->
npm run unit-tests
```
## Database Schemas

### User

- `isActive`
- `username`
- `email`
- `password`
- `role`

### School

- `name`
- `address`
- `id`
- `website`
- `schoolManager`
- `classRooms`
- `totalStudents`
- `totalClassrooms`

### Classroom

- `name`
- `school`
- `id`
- `students`
- `totalStudents`

### Counter

Used to generate unique IDs incrementally.

- `model`
- `seq`

## Endpoints

### Users

#### /user/createAdmin

- **Payload:** `username`, `password`, `email`

#### /user/createUser

- **Payload:** `username`, `password`, `email`, `role` (default is "student")

#### /user/login

- **Payload:** `email`, `password`
- **Token in header**

### School

#### /api/school/getAll

- **HTTP Method:** GET
- **Requires token in header**

#### /api/school/get/:id

- **HTTP Method:** GET
- **Requires token in header**

#### /api/school/update/:id

- **HTTP Method:** PUT
- **Note:** Accessible only by superAdmin
- **Requires token in header**

#### /api/school/delete/:id

- **HTTP Method:** DELETE
- **Note:** Accessible only by superAdmin
- **Requires token in header**

### Classroom

#### /api/classroom/getAll

- **HTTP Method:** GET
- **Requires token in header**

#### /api/classroom/get/:id

- **HTTP Method:** GET
- **Requires token in header**

#### /api/classroom/update/:id

- **HTTP Method:** PUT
- **Note:** Accessible by manager or superAdmin
- **Requires token in header**

#### /api/classroom/delete/:id

- **HTTP Method:** DELETE
- **Note:** Accessible by manager or superAdmin
- **Requires token in header**

