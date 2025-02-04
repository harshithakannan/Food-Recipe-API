const express = require("express");
// install mongodb in terminal using the following command: npm install mongodb
// install mongodb module
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 1111;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const mongoUrl = "mongodb://localhost:27017";
const dbName = "user";
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Serve the signup page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Route for inserting data
app.post("/insert", async (req, res) => {
    const { username, password, confirmpassword } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); // Check if db is initialized
        return;
    }
    try {
        await db.collection("items").insertOne({ username, password, confirmpassword });
        res.redirect("/");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});

// Endpoint to retrieve and display a simple report
app.get("/report", async (req, res) => {
    try {
        const items = await db.collection("items").find().toArray();
        // Create the table headers
        let tableContent = "<h1>Report</h1><table style='color:red' border='1'><tr><th>Name</th><th>Password</th><th>Confirm Password</th></tr>";

        // Populate the table with data from the database
        tableContent += items.map(item => `<tr><td>${item.username}</td><td>${item.password}</td><td>${item.confirmpassword}</td></tr>`).join("");

        // Closing the table and adding a link back to the form
        tableContent += "</table><a href='/'>Back to form</a>";

        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});

// Serve the login page
app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Handle login functionality
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        const user = await db.collection("items").findOne({ username, password });
        if (user) {
            res.redirect('http://localhost:3000/');
        } else {
            res.send(`<h1>Login Failed</h1><p>Invalid username or password</p><a href="/login.html">Try again</a>`);
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Login failed");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
