# 🐳 Complete Docker Guide - ABHA Setu

Welcome! If you are new to Docker, this guide will walk you through setting up and running the entire project (Next.js frontend, NestJS backend, PostgreSQL database, and Redis cache) with a single command.

---

## 🌟 What is Docker?

- **Docker** allows us to bundle an application and all its dependencies (like database, cache, libraries) into a clean package called a **Container**.
- **Docker Compose** is a tool that lets us launch multiple containers (like our frontend container and database container) together, linking them automatically.
- This ensures the project runs identically on every computer without requiring manual installations of PostgreSQL or Redis.

---

## 📋 Prerequisites

Before starting, you must install **Docker Desktop** on your computer.

1. **Download & Install**: Go to [Docker Desktop](https://www.docker.com/products/docker-desktop/) and download the installer for **Windows** (or your OS).
2. **Launch Docker**: Start the Docker Desktop application. You will see a small whale icon in your system tray indicating it is running.

---

## 🚀 How to Run the Project

Open your terminal or PowerShell at the project root (`abhasetu-mama`) and run:

```bash
docker compose up --build
```

### What does this command do?
1. `--build`: Downloads the base images and builds custom containers for our NestJS backend and Next.js frontend.
2. Creates the **PostgreSQL** database and **Redis** cache containers.
3. Automatically sets up the database schemas and seeds the tables.
4. Mounts your local files inside the containers, so **any changes you make to your code will instantly live-reload** (hot reload)!

---

## 🌐 Accessing the Services

Once the terminal logs settle, open your browser and visit:

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Client** | [http://localhost:3000](http://localhost:3000) | Citizen Dashboard & Stakeholder Onboarding. |
| **Backend REST API** | [http://localhost:3001](http://localhost:3001) | Main NestJS endpoint. |
| **API Swagger Docs** | [http://localhost:3001/api/abdm/docs](http://localhost:3001/api/abdm/docs) | Interactive API sandbox registry. |

---

## 🔍 Useful Commands

Here are the basic commands you need to manage your containers:

### 1. Stopping the Containers
To stop the services, press `Ctrl + C` in the terminal where it is running, or run this command in a new terminal:
```bash
docker compose down
```

### 2. Viewing Logs
To see real-time logs from all services or a specific container:
```bash
docker compose logs -f
# Or just for the backend:
docker compose logs -f backend
```

### 3. Resetting the Databases
If you ever want to clear all data and start with a fresh database setup:
```bash
docker compose down -v
```
*(The `-v` flag deletes the database volumes, forcing a fresh seed next time you run `docker compose up`).*

---

## 🛠️ Troubleshooting

### 1. Port is already in use (`5432` or `3000` or `3001`)
- **Reason**: You already have PostgreSQL or another app running locally on your computer using that port.
- **Fix**: Stop your local PostgreSQL service (on Windows, open `Services.msc`, find `postgresql-x64`, right-click and select `Stop`) and then run `docker compose up`.

### 2. Host key / Connection Error
- **Reason**: Docker is not running.
- **Fix**: Make sure Docker Desktop is open and showing a green status.
