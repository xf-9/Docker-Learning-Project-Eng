// Import the express framework for building web applications
let express = require('express');

// Import the path module to handle file and directory paths
let path = require('path');

// Import the fs (file system) module to interact with the file system
let fs = require('fs');

// Import MongoClient from the mongodb package for connecting to MongoDB
let MongoClient = require('mongodb').MongoClient;

// Import body-parser middleware for parsing incoming request bodies in a middleware
let bodyParser = require('body-parser');

// Create an instance of an Express application
let app = express();


// Configure the app to use body-parser for handling JSON and URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the main HTML file for the root URL
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve a profile picture image from the server
app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// Determine MongoDB connection string based on environment
let mongoUrl = process.env.NODE_ENV === 'production' ? 
  "mongodb://admin:password@mongo:27017" : // Use container MongoDB in production
  "mongodb://admin:password@localhost:27017"; // Use local MongoDB in development

// Set MongoDB client options and database name
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
let databaseName = "my-db";

// Handle user profile updates: receives JSON data and upserts into MongoDB
app.post('/update-profile', function (req, res) {
  let userObj = req.body;

  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) {
      console.error("Failed to connect to MongoDB", err);
      return res.status(500).send({ error: "Database connection failed" });
    }

    let db = client.db(databaseName);
    userObj['userid'] = 1; // Set a fixed userid for user identification

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    // Insert or update the user profile with `userid` 1
    db.collection("users").updateOne(myquery, newvalues, { upsert: true }, function(err, result) {
      if (err) {
        console.error("Error updating profile", err);
        client.close();
        return res.status(500).send({ error: "Update failed" });
      }
      client.close();
      res.send(userObj);
    });
  });
});

// Retrieve user profile data from MongoDB and send it as JSON response
app.get('/get-profile', function (req, res) {
  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) {
      console.error("Failed to connect to MongoDB", err);
      return res.status(500).send({ error: "Database connection failed" });
    }

    let db = client.db(databaseName);
    let myquery = { userid: 1 };

    // Fetch user profile data with `userid` 1
    db.collection("users").findOne(myquery, function (err, result) {
      if (err) {
        console.error("Error fetching profile", err);
        client.close();
        return res.status(500).send({ error: "Fetch failed" });
      }
      client.close();
      res.send(result ? result : {}); // Send user profile data or empty object if not found
    });
  });
});

// Start the server and listen on port 3000
app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
