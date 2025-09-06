# Use Node 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json / pnpm-lock.yaml / yarn.lock
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose the Next.js dev port
EXPOSE 3000

# Set environment variable for development
ENV NODE_ENV=development

# Run development server
CMD ["npm", "run", "dev"]
