# 🚀 Cloud-Native Microservices Web Application & CI/CD Pipeline

A modern, enterprise-grade cloud-native microservices application built with **Node.js/Express** and **PostgreSQL**, containerized with **Docker**, orchestrated locally via **Docker Compose**, deployed on **Kubernetes** using **Helm**, monitored with **Prometheus & Grafana**, and automated end-to-end with **GitHub Actions CI/CD** publishing to **GitHub Container Registry (GHCR)**.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Public Access (Port 80 / 8080)"]
        Browser["🌐 Web Browser"]
    end

    subgraph Kubernetes["Kubernetes Cluster / Local Orchestration"]
        Ingress["🚦 NGINX Reverse Proxy & Ingress\n(http://localhost:8080)"]

        subgraph FrontendGroup["Frontend Tier"]
            Frontend["🎨 Storefront Dashboard\n(HTML5 / CSS3 / Vanilla JS - Port 80)"]
        end

        subgraph BackendGroup["Backend Microservices Tier"]
            UserService["👤 User Service\n(Node.js / Express - Port 3000)"]
            ProductService["📦 Product Service\n(Node.js / Express - Port 3001)"]
        end

        subgraph DatabaseGroup["Persistence Tier"]
            Postgres["🐘 PostgreSQL Database\n(users_db / products_db - Port 5432)"]
        end

        subgraph MonitoringGroup["Observability & Metrics Tier"]
            Prometheus["📊 Prometheus Server\n(Scrapes :3000/metrics & :3001/metrics - Port 9090)"]
            Grafana["📈 Grafana Dashboard\n(Port 3002)"]
        end
    end

    Browser -->|HTTP Requests| Ingress
    Ingress -->|Path: / | Frontend
    Ingress -->|Path: /api/v1/auth & /api/v1/users| UserService
    Ingress -->|Path: /api/v1/products| ProductService

    Frontend -.->|Client API Calls| Ingress

    UserService -->|Bcrypt Hashed Users| Postgres
    Prometheus -->|Scrapes Metrics| UserService
    Prometheus -->|Scrapes Metrics| ProductService
    Grafana -->|Queries Metrics| Prometheus
```

---

## 📦 Microservices & Components

| Component | Technology | Internal Port | External Route / Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JS, NGINX Alpine | `80` | `http://localhost:8080` | Warm minimalist storefront with real-time search, filters, & cart |
| **User Service** | Node.js, Express, bcryptjs, JWT | `3000` | `http://localhost:3000` | Manages authentication, registration, and user data |
| **Product Service** | Node.js, Express, Fetch API | `3001` | `http://localhost:3001` | Streams 100+ live multi-department marketplace catalog with caching |
| **PostgreSQL** | PostgreSQL 16 Alpine | `5432` | `localhost:5432` | Relational database with persistent storage volume (`postgres_data`) |
| **Prometheus** | Prometheus v2.51.0 | `9090` | `http://localhost:9090` | Cloud-native metric scraper collecting runtime performance data |
| **Grafana** | Grafana 10.4.0 | `3000` | `http://localhost:3002` | Real-time visualization dashboard (Login: `admin` / `admin`) |

---



## 🚀 Quickstart Options

### Option 1: Run with Docker Compose (Local Development)

Start the entire 6-container microservices stack in one command:

```bash
docker compose up -d --build
```

#### Access Endpoints:
* **Storefront Dashboard:** [http://localhost:8080](http://localhost:8080)
* **User Service API:** [http://localhost:3000/api/v1/users](http://localhost:3000/api/v1/users)
* **Product Service API:** [http://localhost:3001/api/v1/products](http://localhost:3001/api/v1/products)
* **Prometheus Targets:** [http://localhost:9090/targets](http://localhost:9090/targets)
* **Grafana Dashboards:** [http://localhost:3002](http://localhost:3002) *(Login: `admin` / `admin`)*

To stop all containers:
```bash
docker compose down
```

---

### Option 2: Deploy with Helm (Kubernetes)

Package and deploy all microservices and Ingress using Helm:

```bash
# Deploy or upgrade the Helm chart in the microservices-app namespace
helm upgrade --install microservices-app ./helm/microservices-app \
  --namespace microservices-app \
  --create-namespace
```

Inspect deployed resources:
```bash
kubectl get all,ingress -n microservices-app
```

To uninstall:
```bash
helm uninstall microservices-app -n microservices-app
```

---

### Option 3: Deploy with Raw Kubernetes Manifests

```bash
# 1. Create Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy Services, Deployments, PVCs, and Ingress
kubectl apply -f k8s/
```

Access the application via NGINX Ingress at:
* **Dashboard:** [http://localhost/](http://localhost/)
* **Users API:** [http://localhost/api/v1/users](http://localhost/api/v1/users)
* **Products API:** [http://localhost/api/v1/products](http://localhost/api/v1/products)

---

## 🔒 Secret Management & DevOps Hygiene

This project enforces strict cloud-native secret handling standards:

* **No Hardcoded Secrets:** `.env` and credential files are strictly excluded via `.gitignore`.
* **Sanitized Template (`.env.example`):** The repository provides a clean `.env.example` documenting all configuration keys without exposing real values.
* **CI/CD Injection:** GitHub Actions workflows dynamically inject secrets at build/test time using `${{ secrets.VARIABLE_NAME }}`.
* **Kubernetes Secrets:** In Kubernetes, credentials are decoupled from application pods and mounted securely via `Secret` and `ConfigMap` resources.

---

## 🔄 CI/CD Pipeline Architecture

This repository uses automated **GitHub Actions** workflows:

1. **Continuous Integration (`.github/workflows/ci.yml`):**
   * Automatically triggered on pull requests and pushes to `main`.
   * Sets up Node.js 20 on Ubuntu runners.
   * Runs clean dependency installation (`npm ci`).
   * Executes unit and integration test suites via Jest & Supertest across all backend services in parallel.

2. **Continuous Delivery (`.github/workflows/cd.yml`):**
   * Automatically triggered on pull requests (test build) and pushes to `main` (build & push).
   * Authenticates with **GitHub Container Registry (GHCR)** using `${{ secrets.GITHUB_TOKEN }}`.
   * Compiles multi-stage, non-root Alpine Docker images for `user-service`, `product-service`, and `frontend`.
   * Publishes images tagged with `:latest` and `:sha-<commit>` directly to GitHub Packages.

---

## 🛡️ Security Best Practices Implemented

* **Unprivileged Non-Root Containers:** All Node microservices run under `USER node` and NGINX runs on Alpine to minimize attack surfaces.
* **Kubernetes Resource Governance:** Every pod has strict CPU and Memory `requests` and `limits` to prevent noisy-neighbor starvation.
* **Zero-Downtime Rolling Releases:** Combined `readinessProbe` and `livenessProbe` with `maxUnavailable: 0` ensures zero-downtime updates.
* **Path-Based Reverse Proxying:** NGINX handles clientside API requests internally, eliminating browser CORS vulnerabilities.

---

## 👨‍💻 Author
**Deemantha Gunasekara**  
*Cloud & DevOps Engineering Project*
