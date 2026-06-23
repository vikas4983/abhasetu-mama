# Dockerfile for NestJS Backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the NestJS project
RUN npm run build

# Expose NestJS default port
EXPOSE 3001

# Start NestJS in production mode
CMD ["npm", "run", "start:prod"]
