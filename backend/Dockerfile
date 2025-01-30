# Use Node.js official image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies WITHOUT bcrypt first
RUN npm install --legacy-peer-deps

# Install bcrypt separately to ensure correct native binaries
RUN npm install bcryptjs --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port for Express.js
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]