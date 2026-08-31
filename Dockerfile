# Production Multi-Stage Dockerfile for Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

# Build Widget & Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
COPY widget/dist/widget.js ./frontend/public/widget.js
RUN cd frontend && npm run build

# Production Server Container
FROM node:20-alpine AS runner
WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY widget/dist/widget.js ./widget/dist/widget.js

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "backend/src/server.js"]
