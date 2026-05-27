const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ MongoDB connection (Docker network)
const mongoUrl =
  "mongodb://admin:password@mongodb:27017/my-db?authSource=admin";

const mongoClientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const databaseName = "my-db";

// ✅ Home route
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Profile image
app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// ✅ Update profile
app.post('/update-profile', function (req, res) {
  let userObj = req.body;

  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) {
      console.error("Mongo connection error:", err);
      return res.status(500).send("DB connection failed");
    }

    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(
      myquery,
      newvalues,
      { upsert: true },
      function (err) {
        client.close();
        if (err) {
          console.error(err);
          return res.status(500).send("Update failed");
        }

        res.send(userObj);
      }
    );
  });
});

// ✅ Get profile
app.get('/get-profile', function (req, res) {
  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) {
      console.error("Mongo connection error:", err);
      return res.status(500).send("DB connection failed");
    }

    let db = client.db(databaseName);
    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery, function (err, result) {
      client.close();

      if (err) {
        console.error(err);
        return res.status(500).send("Fetch failed");
      }

      res.send(result ? result : {});
    });
  });
});

// ✅ Start server
app.listen(3000, function () {
  console.log("App listening on port 3000!");
});
