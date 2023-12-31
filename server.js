// server.js

console.log("Hello World");

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
var router = express.Router()
const blobStream = require('blob-stream');
// Removed the incorrect line here.



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL database connection settings
const db = mysql.createConnection({
    host: 'leadershipmysql.mysql.database.azure.com',
    user: 'leadershipmysqladmin',
    password: 'R3dD#ad24398L',
    database: 'leadershipmysqldb',
    port: '3306'
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database!');
});

app.use(session({
    secret: 'meow', // Replace 'secret' with a real secret in your production app
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if you are using https
}));

// Route to handle the form data from the client
app.post('/addUser', (req, res) => {
    const formData = req.body; // The form data sent by the client

    // Insert the form data into the MySQL database
    const query = 'INSERT INTO tblUser (UserFname, UserLname, UserEmail, UserPassword) VALUES (?, ?, ?, ?)';
    db.query(query, [formData.FirstName, formData.LastName, formData.Email, formData.Password], (err, result) => {
      if (err) {
        console.error('Error executing the database query:', err);
        return res.status(500).json({ success: false });
      }
      console.log('Account created successfully!');
      return res.status(200).json({ success: true });
    });
});


app.get('/getUser', (req, res) => {
    console.log("Inside getUser");

    const email = req.query.email;
    const query = 'SELECT UserFname, UserLname FROM tblUser WHERE UserEmail = ?';

    db.query(query, email, (err, result) => {
        if (err) {
            console.error('An error occurred while executing the query');
            return res.status(500).send(err);
        }
        res.send(result[0]);
    });
});

app.post('/login', (req, res) => {
    console.log('Received login request', req.body);
    const loginData = req.body; // The login data sent by the client

    // Fetch the user from the mysql database
    const query = 'SELECT UserPassword FROM tblUser WHERE UserEmail = ?';
    db.query(query, [loginData.Email], (err, result) => {
        if (err) {
            console.error('Error executing the database query: ', err);
            return res.status(500).json({ success: false });
        }        
        
        if (result.length === 0) {
            return res.json({ success: false });
        }
        // if provided password unmatch the databse password on the user
        if (result[0].UserPassword !== loginData.Password) {
            return res.json({ success: false });
        }

        //user authenticated successfully
        console.log('User logged in successfully!');
        req.session.email = loginData.Email;
        return res.status(200).json({ success: true });
    });

});

app.post('/addComment', (req, res) => {
    const dataForm1 = req.body; // The form data sent by the client
    console.log(dataForm1); // to check if the values I put in or being outputed

    // Insert the form data into the MySQL database
    const query = 'CALL InsertCommentForuserByEmailNEW2(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [dataForm1.UserEmail, dataForm1.IntegrityComment, dataForm1.PersonalOrgComment, dataForm1.ImprovementComment, dataForm1.PerformanceComment, dataForm1.CommunicationComment, dataForm1.FutureComment, dataForm1.ChangeComment, dataForm1.TeamworkComment, dataForm1.CollaborationComment, dataForm1.AchievementComment, dataForm1.ClosingComment], (err, result) => {
      if (err) {
        console.error('Error executing the database query:', err);
        return res.status(500).json({ success: false });
      }
      console.log('Comments added successfully!');
      return res.status(200).json({ success: true });
    });
});

app.get('/getComment', (req, res) => {
    console.log("Inside getComment");

    const userEmail = req.query.UserEmail;
    const query = 'SELECT Integrity, PersonalORG, Improvement, Performance, Communication, Future, `Change`, Teamwork, Collaboration, Achievement, Closing FROM tbluser U JOIN tblcomments C on U.UserID = C.UserID WHERE UserEmail = ?';

    console.log(query);

    db.query(query, [userEmail], (err, result) => {
        if (err) {
            console.error('An error occurred while executing the query');
            return res.status(500).send(err);
        }
        
        if (result.length === 0) {
            console.log('No comments found for the user');
            return res.status(404).json({ message: 'No comments found for the user.' });
        }

        console.log('Successful comment search');
        // Assuming that the query returns a single row for the provided UserEmail
        const commentData = result[0];
        console.log(commentData);
        return res.status(200).json({ success: true, commentData });
    });
});


// Setup the express-session middleware


app.get('/helloworld', function(req,res){
    res.send('hello world 2')
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

