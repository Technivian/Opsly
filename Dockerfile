# Opsly — production image for Northflank (and any container host).
#
# Single stage on purpose: the build externalizes most dependencies
# (esbuild only bundles an allowlist in script/build.ts), and the server
# runs `npx drizzle-kit push` on startup, so node_modules — including
# devDependencies like drizzle-kit — must remain present at runtime.
FROM node:22.12.0-slim

WORKDIR /app

# Install all dependencies (incl. devDependencies) using the lockfile.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build client + server.
COPY . .
RUN npm run build

# Runtime configuration. PORT can be overridden by the platform.
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

EXPOSE 8080

# Health check target is /api/health (returns 200 when the DB is reachable).
CMD ["npm", "run", "start"]
