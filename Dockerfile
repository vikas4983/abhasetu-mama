# Dockerfile for Next.js Frontend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy-peer-deps to avoid conflict
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build Next.js application
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "run", "start"]
