# MicroServices-WebApp

A cloud-native microservices application containerized with Docker, orchestrated with Kubernetes, and deployed via an automated CI/CD pipeline.

## Architecture Overview
- **User Service:** Node.js / Express REST API with health probes and Prometheus metrics.
- **Product Service:** Node.js / Express REST API for catalog items.
- **Containerization:** Multi-stage Docker builds for minimal attack surface.
- **Orchestration:** Kubernetes (Deployments, ClusterIP Services, Ingress, Rolling Updates).
- **CI/CD:** Automated testing, container build, and deployment with GitHub Actions.
- **Observability:** Prometheus metrics scraping and Grafana dashboards.

## Project Structure
```text
MicroServices-WebApp/
├── services/
│   ├── user-service/
│   └── product-service/
├── k8s/
├── monitoring/
└── .github/
    └── workflows/
```
