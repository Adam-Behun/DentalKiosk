FROM node:18-alpine

# Install tzdata for timezone support
RUN apk add --no-cache tzdata

# Set the timezone to Eastern Time
ENV TZ=America/New_York

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 4000

# Set the entrypoint script
CMD ["sh", "-c", "node utils/populateDatabase.js && npm start"]
