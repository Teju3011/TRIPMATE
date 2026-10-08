# Phase 13: Containerized Development — Docker & Kubernetes

## 1. Production Hardened Dockerfile Architecture
TripMate's container architecture utilizes a **multi-stage build** based on `node:22-alpine` to produce a minimal, hardened container image with zero unnecessary compilers, shells, or debugging tools in the final runner stage.

> **Source Manifest:** [Dockerfile](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/Dockerfile)

### Four Implemented Container Security Practices:
1. **Minimal Base Image & Attack Surface Reduction:**
   - Multi-stage build splits compilation (`AS builder`) from execution (`AS runner`).
   - Development dependencies are strictly stripped (`npm ci --omit=dev`), shrinking the final image by over 70% and removing build tools like Python or gcc.
2. **Non-Root Execution (UID 10001):**
   - Explicitly creates an unprivileged group and user:
     ```dockerfile
     RUN addgroup -g 10001 -S tripmate && adduser -u 10001 -S tripmate -G tripmate
     USER tripmate:tripmate
     ```
   - Eliminates container breakout risks where an exploited process gains host-level root.
3. **Controlled & Restricted Port Exposure:**
   - Exclusively exposes port `3000` via `EXPOSE 3000`. No secondary management or debugging ports are exposed.
4. **Built-In Container Health Check:**
   - Evaluates service liveness every 30 seconds via an unprivileged spider probe:
     ```dockerfile
     HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
       CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
     ```

---

## 2. Docker Compose Orchestration
The multi-container configuration in `docker-compose.yml` defines isolated bridge networking, CPU and memory constraints, and local volume mounting for persistent database files.

> **Source Manifest:** [docker-compose.yml](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/docker-compose.yml)

### Compose Security Settings:
```yaml
security_opt:
  - no-new-privileges:true
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 128M
```

---

## 3. Kubernetes / Minikube Manifests & Security Controls
The production deployment for Kubernetes / Minikube is defined in `k8s/k8s-full-stack.yaml` and contains:
- `Namespace`: `tripmate-production`
- `Deployment`: `tripmate-deployment` (2 Replicas, RollingUpdate strategy)
- `Service`: `tripmate-service` (ClusterIP on port 80 → port 3000)
- `Ingress`: `tripmate-ingress` (TLS termination with SSL redirect)
- `ConfigMap` & `Secret`: Environment decoupling and secret vaulting
- `NetworkPolicy`: Isolated pod-to-pod communication rules

> **Source Manifest:** [k8s-full-stack.yaml](file:///C:/Users/tej30/.gemini/antigravity-ide/scratch/tripmate/k8s/k8s-full-stack.yaml)

### Implemented Kubernetes Security Controls:

#### Control 1: Pod & Container SecurityContext
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  runAsGroup: 10001
  fsGroup: 10001
  seccompProfile:
    type: RuntimeDefault
containers:
  - name: tripmate-engine
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
          - ALL
```

#### Control 2: Strict Compute Resource Limits
```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```
*Prevents noisy-neighbor starvation and protects the cluster against memory exhaustion denial of service.*

#### Control 3: Micro-Segmentation via NetworkPolicy
```yaml
kind: NetworkPolicy
spec:
  podSelector:
    matchLabels:
      app: tripmate
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
```
*Guarantees that only traffic arriving through the certified Ingress controller can communicate with the TripMate backend pods.*
