# Kube Credential - Credential Verification Service

## Description
This service verifies whether a given credential JSON has been issued by the issuance microservice. It accepts credentials via its API, checks the persistence layer, and returns the verification status, including the worker ID and timestamp if valid.

Built with Node.js and TypeScript, using SQLite for data persistence. Containerized with Docker and designed for independent, scalable deployment as a Kubernetes microservice.

## Features
- Verify credentials based on JSON input
- Clear JSON API response
- Uses SQLite for storage
- Independently deployable microservice

## Setup Instructions
1. Clone the repository
2. Run `npm install`
3. Build TypeScript: `npm run build`
4. Start the API: `npm start`
5. Runs on port 3000 by default
6. Dockerfile included for containerization
7. Kubernetes manifests available in `/k8s`

## Assumptions
- Verification is stateless except for SQLite storage
- JSON
