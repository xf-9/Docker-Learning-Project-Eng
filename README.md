# Docker Learning Project
---
## 这是一个 Docker Learning Project
该项目的目的是学习Docker的基本知识、如何使用Docker容器来运行MongoDB及其管理界面MongoDB Express、以及如何使用Docker Compose来管理多容器应用。 详细教程请查看 Docker Learning Project.mb

---

### Contents:
1. [Install WSL and Docker Desktop](#1-install-docker-desktop-and-wsl)
2. [Potential Issues in This Project](#2-potential-issues-in-this-tutorial)
3. [Amazon Web Services（AWS）](#3-amazon-web-services-aws)
4. [Docker Commands](#4-docker-commands)
5. [Create MongoDB and MongoDB Express Containers](#5-create-mongodb-and-mongodb-express-containers)
6. [Docker Compose](#6-docker-compose)
7. [Dockerfile](#7-dockerfile)
8. [Using Docker Compose to Start the Demo Application, MongoDB, and MongoDB Express Simultaneously](#8-using-docker-compose-to-start-demo-application-mongodb-and-mongodb-express-simultaneously)


---
## 1. Install **Docker Desktop** and **WSL**

- Docker installation guide (please read the **system requirements** carefully): https://docs.docker.com/desktop/install/windows-install/  
- Docker Desktop installation: https://www.docker.com/products/docker-desktop/  
- WSL installation: https://learn.microsoft.com/en-us/windows/wsl/install  
---
## 2. Potential Issues in This Tutorial

### Docker Issues
- **Issue Example Image 1**
![Image Description](./picture/IMG_3078.png){:width="500px" height="300px"} 
- **Issue Example Image 2**
![Image Description](./picture/IMG_3079.png){:width="500px" height="300px"} 
- **If you encounter the errors in Issue Example Image 1 and Issue Example Image 2, please reinstall WSL** 
  <br>

### MongoDB Issues
- **Issue Example Image 3**
![Image Description](./picture/IMG_3080.png){:width="500px" height="300px"} 
- **Issue Example Image 4**
![Image Description](./picture/IMG_3081.png){:width="300px" height="200px"} 
**When the MongoDB container is named mongodb and the environment variable ME_CONFIG_MONGODB_SERVER for Mongo Express is also set to mongodb, the Mongo Express logs will show the error "mongo: Name does not resolve."**
<br>

### Demo Application

If the Demo application does not set environment variables (to identify whether it is running locally or in a container), it will not be able to connect to MongoDB correctly after containerization. The reasons are as follows:

1. When running locally, localhost:3000 points to port 3000 on the host machine, allowing the application to access the local MongoDB service directly.

2. When running in a container, localhost:3000 points to port 3000 of the container itself, not to the host or other containers. Therefore, applications running in Docker containers cannot connect to the MongoDB container via localhost.

3. To enable the application to access the MongoDB container within the container, the MongoDB connection string in the application code needs to be set dynamically based on the environment. When running in a container, the service name of the MongoDB container (e.g., mongo) should be used instead of localhost.
   
<br>

**Code Example：**
**Correct Code (Automatically Detect Environment):**

<details>
  <summary>Click to expand and view the correct Demo application code</summary>
  <pre><code>
 // In the Demo application, choose the MongoDB connection string based on the environment
let mongoUrl = process.env.NODE_ENV === 'production' ? 
  "mongodb://admin:password@mongo:27017" : // Production environment: connect to MongoDB in Docker
  "mongodb://admin:password@localhost:27017"; // Local development environment: connect to local MongoDB
  
</code></pre>
</details>

**Dockerfile Configuration:**
<details>
  <summary>Click to expand and view the Dockerfile code</summary>
  <pre><code>
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \
    NODE_ENV=production 
By setting NODE_ENV=production in the Dockerfile, the application will choose mongoUrlDocker in the Docker environment, allowing it to connect to the MongoDB container using the service name mongo.
  
</code></pre>
</details>

<br>

**Incorrect Code (Environment Not Detected):**
**If the connection string is not dynamically selected based on the environment, the application will always use mongoUrlLocal:**

<details>
  <summary>Click to expand and view the incorrect Demo application code</summary>
  <pre><code>
 // Always use the local MongoDB connection string
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";
<br>
# Since NODE_ENV or similar variables are not set in the Dockerfile, the containerized application cannot recognize that it is running in a Docker environment, and thus it will still attempt to connect to the database using localhost, failing to connect to the MongoDB container.

</code></pre>
</details>



---
## 3. Amazon Web Services (AWS)

- ### Verify AWS Credentials in WSL
  - <https://www.youtube.com/watch?v=vZXpmgAs91s&t=321s>


---
- ### Push an Image to AWS Elastic Container Registry
  - AWS: Push a Docker image <https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html>
1. Enter `Docker Login` in WSL to log in to Docker Hub.
2. Verify AWS Credentials.
3. Log in to the AWS website, then search for Elastic Container Registry in the search box at the top right and go to the repository page. If you have not created a repository before, click **Create Repository** on the right to create one and name it my-app (the repository name usually uses the program's name).
4. Go to the my-app repository, click **View Push Command** at the top right, and copy the first line of the authentication code to WSL.
5. After successful authentication, create the desired image to upload using the Docker Build command.
6. Copy the code from **View Push Command** in step 3 to tag the newly created image. It should look like this: `docker tag <ImageName>:<version1> 878787878787.dkr.ecr.us-east-1.amazonaws.com/my-app:<version2>`. Here, `<ImageName>` and `<version1>` are the image name and tag in Docker, while `<version2>` is the image tag in the AWS repository.
7. Once the image is tagged, you can use the command from step 4 in **View Push Command** to push the image to the AWS repository. It should look like: `docker push 878787878787.dkr.ecr.us-east-1.amazonaws.com/my-app:<version>`.
- The **image** will be **pushed** to the specific region's **repository** based on the current region set in **AWS**. For example, it will be **pushed** to the **us-east** region, and the image will not be visible in repositories in other regions.

---

## 4. Docker Commands

Here are the Docker commands that will be used next. In all the code below, the items in `[ ]` are optional parameters, and only a part of the options for each command will be listed here. In Linux, you can terminate the current process running in the terminal by pressing CTRL + C.

- **Pull an Image**: `Docker pull <imageName>[:<version>]`  
  Docker pull will fetch a Docker image from Docker Hub or other specified repositories. The tag is optional; by default, it pulls the latest version. For example, `docker run redis:7.4.1` specifies pulling the redis version 7.4.1.

- **Create a Container**: `Docker run [--name] [-d] [-e] [--net] [-p] <imageName/imageID>`.  
  `--name` is used to assign a name to the container. The `-d` option runs the container in the background. `-e` sets environment variables. `-p` binds the host port to the container port. `--net` binds the container to a specified network.

- **Start a Container**: `Docker start <ContainerID/Name>`

- **Stop a Container**: `Docker stop [-f] <ContainerID/Name>`  
  The `-f` option can forcibly terminate one or more Docker containers.

- **Remove a Container**: `Docker rm [-f] <ContainerID/Name>`  
  The `-f` option can forcibly terminate one or more Docker containers.

- **Remove an Image**: `Docker rmi <imageName/imageID>`

- **List All Networks on the Current Docker Host**: `Docker network ls`

- **Create a Network**: `Docker network create <networkName>`

- **Remove a Network**: `Docker network rm <networkName>`

- **View Detailed Information About a Specified Network** (attributes and associated containers): `Docker inspect <networkName>`

- **View Currently Running Containers**: `Docker ps [-a]`  
  The `-a` option allows you to view currently stopped containers.

- **View Existing Images**: `Docker images`

- **View Container Logs**: `Docker logs <ContainerID/Name>`

- **View Container Information**: `Docker inspect <ContainerName/ID>`

- **Execute a Command Inside a Running Container**: `Docker exec [-it] <ContainerID/Name>`  
  `-it` enables interactive mode; used with `/bin/bash` to start an interactive terminal, for example, `docker exec -it <containerID or name> /bin/bash`. If bash is not available, use `docker exec -it <containerID or name> /bin/sh`.

- **Start Docker Compose**: `Docker-compose -f <DockerComposeFile> up -d`  
  The `-f` option specifies the path or name of a Compose file.

- **Create an Image**: `Docker build -t <ImageName>:<version> .`  
  The `-t` option specifies the name and tag of the image. The `.` represents the current directory, meaning this Docker build command will create the image based on the Dockerfile in the current directory.
<br>

---
## 5. Create MongoDB and MongoDB Express Containers
- **Good to know about how to Run MongoDB in Docker** <https://www.youtube.com/watch?v=gFjpv-nZO0U&t=1s>
1. **Get the Images**: Run `docker pull mongo` and `docker pull mongo-express` in the WSL terminal to get the latest Mongo and Mongo Express images. (Use `docker pull mongo-express:<version>` for a specific version.)
2. **Create a Network**: `docker network create mongo-network`
3. **Note that the default communication port for Mongo is 27017, and for Mongo Express, it is 8081.**
4. **Create the Mongo Container**  
   Code: 
   - (\ can be used as a line continuation character in the command line.)
   &emsp;&emsp;&emsp; `docker run -d \ `
   - Map the container's port to local, Local:Container
   &emsp;&emsp;&emsp; `-p27017:27017 \ `
   - Mongo environment variable Root username is admin; use a more secure username in practice.
   &emsp;&emsp;&emsp; `-e MONGO_INITDB_ROOT_USERNAME=admin \ `
   - Mongo environment variable Root password; "password" is just an example. Use a more secure password in practice.
   &emsp;&emsp;&emsp; `-e MONGO_INITDB_ROOT_PASSWORD=password \ `
   - Specify the container name
   &emsp;&emsp;&emsp; `--name mongo \ `
   - Specify which network to use
   &emsp;&emsp;&emsp; `--net mongo-network \ `
   - Use the mongo image
   &emsp;&emsp;&emsp;` mongo `

5. **Create Mongo Express**
  Code:
&emsp;&emsp;&emsp;`docker run -d \`
&emsp;&emsp;&emsp;`-p 8081:8081 \`
- Username to connect to MongoDB. Ensure this user exists in MongoDB and has sufficient permissions.
&emsp;&emsp;&emsp; `-e ME_CONFIG_MongoDB_ADMINUSERNAME=admin \ `
- Typically, ME_CONFIG_MongoDB_ADMINUSERNAME and its PASSWORD should match MONGO_INITDB_ROOT_USERNAME in the Mongo container to ensure Mongo Express can access MongoDB as an administrator.
&emsp;&emsp;&emsp;`-e ME_CONFIG_MongoDB_ADMINPASSWORD=password \ `
This variable name should match the Mongo container name
&emsp;&emsp;&emsp;`-e ME_CONFIG_MongoDB_SERVER=mongo \ `
- Set basic auth user to access the database at Localhost:8081
&emsp;&emsp;&emsp;`-e ME_CONFIG_BASICAUTH_USERNAME=test \ `
- Basic auth user adds a layer of security, ensuring only authorized users can access MongoDB
&emsp;&emsp;&emsp;`-e ME_CONFIG_BASICAUTH_PASSWORD=1234 \ `
&emsp;&emsp;&emsp;`--net mongo-network \ `
&emsp;&emsp;&emsp;`--name mongo-express \ `
&emsp;&emsp;&emsp;`mongo-express`
6. **Verify if MongoDB Express has started correctly:** Access `localhost:8081` (the port for Express) in your browser to check if MongoDB Express is running. If it is, you will be prompted for a username and password; just enter the basic auth user and password.

**By default, the data in Docker containers is temporary. Thus, data will be cleared when the container stops or is removed, unless a volume is used for data persistence.**
<br>


---
## 6. Docker Compose
- Docker Compose is a tool to define and manage multi-container Docker applications. It uses a YAML file (`docker-compose.yml`) to define services, networks, and volumes for an application, allowing users to start, stop, and manage these multi-container applications with a single command.

### Starting MongoDB and MongoDB Express with Docker Compose
1. **Create a YAML/YML file**: In the current or specified directory, create an empty folder and, using VS Code, create a file in this folder with `.yaml` or `.yml` as the extension. Here, the file is named `docker-compose.yaml`.
2. **Write the Docker Compose configuration**:
<details>
  <summary>Click to view the Docker Compose code</summary>
  <pre><code>

# Note: Indentation is crucial in Compose files as it represents hierarchy.
<br>
 # Define the Compose file version (typically use the latest version).
version: '3'
 # Define all services in the application, each running in its own container.
services:
<br>
  # Container name
  mongo:
    # Use the official MongoDB image
    image: mongo
    # Set ports
    ports:
      # Map the host's port 27017 to the container's port 27017
      - 27017:27017
    # Set environment variables
    environment:
      # MongoDB root username
      - MONGO_INITDB_ROOT_USERNAME=admin
      # MongoDB root password
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      # Persist MongoDB data
      - mongo-data:/data/db
       <br>
 # Mongo Express container
  mongo-express:
    image: mongo-express
    restart: always # Prevents MongoNetworkError if MongoDB Express starts before MongoDB
    ports:
      - 8080:8081
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password
      - ME_CONFIG_MONGODB_SERVER=mongo
      - ME_CONFIG_BASICAUTH_USERNAME=mick
      - ME_CONFIG_BASICAUTH_PASSWORD=1234
 # Define volume for data persistence
volumes:
  mongo-data:
    driver: local # Use local driver for data persistence

  </code></pre>
</details>

&emsp;&emsp;3. **Run the Docker Compose file**: In WSL, enter `docker-compose -f docker-compose.yaml up`
&emsp;&emsp;4. **Verify MongoDB Express is running**: Open a browser and go to `localhost:8080` to check if the containers are running properly.
&emsp;&emsp;5. **Stop containers**: In WSL, enter `docker-compose -f docker-compose.yaml down` to stop all containers defined in the file at once.
<br>


---

## 7. Dockerfile
- A Dockerfile is a text file that defines how to build a Docker image. It allows developers to specify the software to install, environment variables, files to copy, and commands to run, creating a portable application environment with all dependencies and configurations included.

**Creating a Dockerfile**: Open VS Code and create a new file named `Dockerfile`. Once created, it will show a small blue whale icon next to the file in VS Code's explorer (if not, install the Docker extension in VS Code).

### Use Dockerfile to Create an Image for the Demo Application
1. **Create the Dockerfile**
2. **Write Dockerfile Code**:
<details>
  <summary>Click to expand and view the Dockerfile code</summary>
  <pre><code>
 # Specify the base image; since the demo application is written in JavaScript, we use the Node.js image
FROM node:13-alpine
  <br>
 # Set environment variables
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \
    NODE_ENV=production
 # Optional: set the app to run in production mode
   <br>
 # Create the application directory
RUN mkdir -p /home/app
  <br>
 # Copy the application code into the container
COPY ./app /home/app
  <br>
 # Set the working directory to /home/app; if not set, you'll need to specify /home/app in the CMD command before server.js.
WORKDIR /home/app
  <br>
 # Install application dependencies (only production dependencies, optionally)
RUN npm install --production
  <br>
 # Specify the command to run when the container starts
CMD ["node", "server.js"]

  </code></pre>
</details>  

 &emsp;&emsp;3. **Build the Image**: Ensure the Dockerfile is in the current directory in WSL. If not, navigate to the directory containing the Dockerfile using `cd`. Once you're in the correct directory, create the image by entering: `docker build -t my-app:1.0 .`
  <br>

### Demo Application + MongoDB + MongoDB Express
1. **Start MongoDB and MongoDB Express Containers:** In WSL, use the `docker-compose` command to start the Compose file containing MongoDB and MongoDB Express. This will create a network during startup, which the containers will use.
2. **Create a Database:** Access MongoDB Express in the browser via `localhost:8080`, and create a database named `my-db` with a `users` collection inside it.
3. **Create the Demo Application Container:** Use the following command to start the demo application container, binding the required port and network (ensure it’s the same network as MongoDB): `docker run -d -p 3000:3000 --net <network_created_by_compose> --name app my-app:1.0`
4. **Access the Demo Application:** In the browser, go to `localhost:3000` to access the demo application. The `"Edit Profile"` button allows you to update `Name`, `Email`, and `Interests`. You can verify these updates in MongoDB Express at `localhost:8080`.
  <br>


---
 
## 8. Using Docker Compose to Start Demo Application, MongoDB, and MongoDB Express Simultaneously

<details>
  <summary>Click to expand code</summary>
   <pre><code> 
version: '3'
services:
   <br>
  my-app:
   <br>
    # Node.js application image
    image: my-app:1.2 
     <br>
    # Map host port 3000 to container port 3000
    ports:
      - 3000:3000 
     <br>
    # Ensures 'mongo' container starts before 'my-app'
    depends_on:
      - mongo 
     <br>
    # Set environment variable
    environment:
      - NODE_ENV=production
   <br> 
  mongo:
     <br>
    # Use official MongoDB image
    image: mongo 
     <br>
    ports:
      - 27017:27017 # Map host port 27017 to container port 27017
     <br>
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin # MongoDB root username
      - MONGO_INITDB_ROOT_PASSWORD=password # MongoDB root password
     <br>
    volumes:
      - mongo-data:/data/db # Persist MongoDB data
  <br>
  mongo-express:
     <br>
    # Use official Mongo Express image
    image: mongo-express 
     <br>
    # Ensure Mongo Express always restarts
    restart: always 
     <br>
    # Map host port 8080 to container port 8081
    ports:
      - 8080:8081 
     <br>
    depends_on:
      - mongo    
     <br>
    environment:
      # Mongo Express admin username for MongoDB connection
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin 
      # Mongo Express admin password for MongoDB connection
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password
      # MongoDB container name 
      - ME_CONFIG_MONGODB_SERVER=mongo
      # Basic auth username for Mongo Express  
      - ME_CONFIG_BASICAUTH_USERNAME=test 
      # Basic auth password for Mongo Express
      - ME_CONFIG_BASICAUTH_PASSWORD=1234 
 <br>
volumes:
  mongo-data:
    # Use local driver to persist data
    driver: local 

</code></pre>
</details>  








