# DevOps & Production Engineering

## Architecture Overview
This project is fully equipped for professional, containerized deployment with strict automated CI/CD quality gates. 

## CI/CD Pipeline
GitHub Actions (`.github/workflows/ci.yml`) enforces the following gates on every Pull Request to `main`:
1. **Type Checking**: Validates that all TypeScript boundaries (`tsc --noEmit`) are perfectly intact.
2. **Linting**: Runs ESLint to prevent messy code styling.
3. **Unit Tests**: Runs Jest.
4. **Production Build**: Executes `npm run build` to guarantee Next.js can successfully compile the static pages and standalone output.
*Any failure instantly blocks the merge.*

## Dockerization
The `Dockerfile` is a heavily optimized Multi-Stage build targeting a lightweight `alpine` linux base. 
It uses Next.js `standalone` output, ensuring the final Docker image only contains the exact dependencies needed to run the app, ignoring bulky developer tools.

A local `docker-compose.yml` is provided for seamless onboarding. Running `docker compose up` spins up the Node App, a PostgreSQL container, and a Redis container simultaneously.

## Infrastructure Health Checks
Modern load balancers and Kubernetes clusters require knowing if the app is alive. 
The `src/pages/api/health.ts` endpoint is the Liveness/Readiness probe. It actively queries the Prisma database and pings the Redis instance, returning a `503 Service Unavailable` if either backing infrastructure is down, instructing the Load Balancer to kill the pod or route traffic elsewhere.

## Deployment Trade-Offs
- **Vercel**: Best for instant preview environments and zero-config Next.js deployments. Note: Vercel serverless functions have cold starts, which can delay long-running AI operations.
- **Docker Host (Railway/Render)**: Using our newly created `Dockerfile` on a PaaS like Railway guarantees a warm server. This is optimal for the heavy quantitative engines and background Redis cron jobs that shouldn't be executed in a 10-second Serverless timeout environment.
