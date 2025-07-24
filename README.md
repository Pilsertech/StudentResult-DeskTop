# Student Result Management System (Desktop Version)

![Status](https://img.shields.io/badge/status-in_progress-yellow)
![Platform](https://img.shields.io/badge/platform-desktop-informational)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Electron](https://img.shields.io/badge/Electron-20.x-blueviolet)

## 1. Introduction

This project is a desktop application converted from an original PHP-based web application. It provides a comprehensive system for managing student academic records, including classes, subjects, student details, and results. The back-end is powered by a Node.js server with an Express API, and the front-end is built using Electron to create a cross-platform desktop experience.

## 2. Current Project Status

The project is currently **in progress**. The core architecture has been established, and foundational features are functional.

#### What is Completed:
* **Application Architecture:** A clean separation between the Node.js `server`, the `electron-app` front-end, and `shared` assets.
* **Server & Database:** The Node.js server starts reliably, connects to the MySQL database, and includes a logging system (`server.log`).
* **User Authentication:** The admin login functionality has been fully converted and is operational.
* **Dashboard:** The main dashboard view has been converted, successfully fetching and displaying dynamic statistics from the database via an API endpoint.

#### What is Not Yet Converted:
* **CRUD Operations:** All functionality for creating, reading, updating, and deleting data (e.g., managing students, classes, subjects, results) still needs to be converted from PHP to Node.js API endpoints and Electron front-end pages.

## 3. Technology Stack

* **Back-End:** Node.js, Express.js
* **Front-End:** Electron, HTML5, CSS3, JavaScript
* **Database:** MySQL
* **Key Libraries:** `mysql` for database connection, `md5` for hashing (legacy).

## 4. Project Structure

The project is organized into three main directories to ensure a clean separation of concerns:

//Student-Result-Desktop/
├── electron-app/         # Contains all front-end code (Electron main process, windows, UI pages)
│   ├── main.js
│   ├── preload.js
│   └── renderer/
│       └── pages/
├── server/               # Contains all back-end API code (Node.js, Express)
│   ├── app.js
│   ├── server.log
│   ├── config/
│   ├── controllers/
│   └── routes/
├── shared/               # Contains all shared static assets like CSS and JS libraries
│   ├── css/
│   └── js/
└── README.md


## 5. Setup and Installation

Follow these steps to get the application running on your local machine.

#### Prerequisites:
* **Node.js:** Version 18.x or higher.
* **MySQL:** A running MySQL server (like XAMPP, WAMP, or a standalone instance).

#### Step 1: Database Setup
1.  Open your MySQL management tool (e.g., phpMyAdmin).
2.  Create a new database named `srms`.
3.  Select the `srms` database and import the `StudentResult/DB/srms.sql` file to create the necessary tables.

#### Step 2: Clone & Install Dependencies
1.  Clone this repository to your local machine.
2.  Install server dependencies:
    ```bash
    cd server
    npm install
    ```
3.  Install Electron front-end dependencies:
    ```bash
    cd ../electron-app
    npm install
    ```

#### Step 3: Run the Application
1.  To start the application, run the following command from the `electron-app` directory:
    ```bash
    npm start
    ```
This will automatically start the Node.js server and then launch the Electron desktop application.

**Default Admin Login:**
* **Username:** `admin`
* **Password:** `admin` (Note: This is from the original `READ ME.txt` and is MD5 hashed in the database).

## 6. Next Steps / To-Do List

The next phase of development will focus on converting the remaining PHP files into functional modules within the new architecture.

- [ ]  **Manage Classes:** Convert `manage-classes.php`, `create-class.php`, and `edit-class.php`.
- [ ]  **Manage Subjects:** Convert `manage-subjects.php`, `create-subject.php`, and `edit-subject.php`.
- [ ]  **Manage Students:** Convert `manage-students.php`, `add-students.php`, and `edit-student.php`.
- [ ]  **Manage Results:** Convert `manage-results.php`, `add-result.php`, and `edit-result.php`.
- [ ]  **Change Password:** Convert `change-password.php`.

## 7. License

This project is licensed under the MIT License.
