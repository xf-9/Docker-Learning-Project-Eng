
# Specify the base image
FROM node:13-alpine

# Set environment variables
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \
    NODE_ENV=production 
# Optional, set the application environment to production

# Create application directory
RUN mkdir -p /home/app

# Copy application code into the container
COPY ./app /home/app

# Set the working directory to /home/app
WORKDIR /home/app

# Install application dependencies
RUN npm install --production # Only install production dependencies (optional)

# Specify the command to execute when the container starts
CMD ["node", "server.js"]
