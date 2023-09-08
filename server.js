// server.js
require('dotenv').config();
console.log("Getting the servers ready...");

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
var router = express.Router()
const blobStream = require('blob-stream');
const { Configuration, OpenAIApi } = require("openai");


// openai API //
// const { OpenAIAPI } = require('openai');

// const configuration = new Configuration({
//     apiKey: process.env.OPEN_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL database connection settings
const db = mysql.createConnection({
    host: 'leadershipmysqldb2.mysql.database.azure.com',
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
    console.log(req.session.id);

    const email = req.query.email;
    const password = req.query.password;
    const query = 'SELECT UserFname, UserLname, UserEmail FROM tblUser WHERE UserEmail = ? AND UserPassword = ?';

    db.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('An error occurred while executing the query');
            return res.status(500).send(err);
        }

        if (result.length === 0) {
            // If no user is found with the provided email and password, return an appropriate message
            return res.status(404).send('User not found.');
        }

        // Creating session object for userEmail (eventually, we will use this instead of front end local storage)

        // req.session.userEmail2 = email;

        // req.session.save((err) => {
        //     if (err) {
        //         console.error('Error saving session:', err);
        //         return res.status(500).json({ success: false });
        //     }

        //     console.log("session Email : " + req.session.userEmail2);

            // res.cookie('userEmail', email, { maxAge: null });
        
            // Send the user data along with the cookie
        console.log(result);
        res.json(result[0]);
        //});
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
    console.log(req.session.id)

    const userEmail = req.query.UserEmail
    //req.session.save();
    console.log("User Email on server: " + userEmail);
    const query = 'SELECT Integrity, PersonalORG, Improvement, Performance, Communication, Future, `Change`, Teamwork, Collaboration, Achievement, Closing FROM tbluser U JOIN tblcomments C on U.UserID = C.UserID WHERE UserEmail = ?';

    console.log(query);

    // hello

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

app.post('/addCommentManager', (req, res) => {
    const dataForm1 = req.body; // The form data sent by the client
    console.log(dataForm1); // to check if the values I put in or being outputed


    // Insert the form data into the MySQL database
    const query = 'CALL InsertCommentFromManagerByEmailNEW2(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [dataForm1.UserEmail, dataForm1.IntegrityComment, dataForm1.PersonalOrgComment, dataForm1.ImprovementComment, dataForm1.PerformanceComment, dataForm1.CommunicationComment, dataForm1.FutureComment, dataForm1.ChangeComment, dataForm1.TeamworkComment, dataForm1.CollaborationComment, dataForm1.AchievementComment, dataForm1.ClosingComment, dataForm1.Author], (err, result) => {
      if (err) {
        console.error('Error executing the database query:', err);
        return res.status(500).json({ success: false });
      }
      console.log('Comments added successfully!');
      return res.status(200).json({ success: true });
    });
});

app.get('/getCommentManager', (req, res) => {
    console.log("Inside getComment");
    console.log(req.session.id)

    const userEmail = req.query.UserEmail
    //req.session.save();
    console.log("User Email on server: " + userEmail);
    const query = 'SELECT Integrity, PersonalORG, Improvement, Performance, Communication, Future, `Change`, Teamwork, Collaboration, Achievement, Closing, Author FROM tbluser U JOIN tblmanagercomments MC on U.UserID = MC.UserID WHERE UserEmail = ?';

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
        const commentData = result;
        console.log(commentData);
        return res.status(200).json({ success: true, commentData });
    });
});

app.post('/addCommentPeer', (req, res) => {
    const dataForm1 = req.body; // The form data sent by the client
    console.log(dataForm1); // to check if the values I put in or being outputed


    // Insert the form data into the MySQL database
    const query = 'CALL InsertCommentFromPeerByEmailNEW2(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [dataForm1.UserEmail, dataForm1.IntegrityComment, dataForm1.PersonalOrgComment, dataForm1.ImprovementComment, dataForm1.PerformanceComment, dataForm1.CommunicationComment, dataForm1.FutureComment, dataForm1.ChangeComment, dataForm1.TeamworkComment, dataForm1.CollaborationComment, dataForm1.AchievementComment, dataForm1.ClosingComment, dataForm1.Author], (err, result) => {
      if (err) {
        console.error('Error executing the database query:', err);
        return res.status(500).json({ success: false });
      }
      console.log('Comments added successfully!');
      return res.status(200).json({ success: true });
    });
});

app.get('/getCommentPeer', (req, res) => {
    console.log("Inside getCommentPeer");
    console.log(req.session.id)

    const userEmail = req.query.UserEmail
    //req.session.save();
    console.log("User Email on server: " + userEmail);
    const query = 'SELECT Integrity, PersonalORG, Improvement, Performance, Communication, Future, `Change`, Teamwork, Collaboration, Achievement, Closing, Author FROM tbluser U JOIN tblpeercomments PC on U.UserID = PC.UserID WHERE UserEmail = ?';

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
        const commentData = result;
        console.log(commentData);
        return res.status(200).json({ success: true, commentData });
    });
});

app.post('/addCommentSub', (req, res) => {
    const dataForm1 = req.body; // The form data sent by the client
    console.log(dataForm1); // to check if the values I put in or being outputed


    // Insert the form data into the MySQL database
    const query = 'CALL InsertCommentFromSubordinateByEmailNEW2(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [dataForm1.UserEmail, dataForm1.IntegrityComment, dataForm1.PersonalOrgComment, dataForm1.ImprovementComment, dataForm1.PerformanceComment, dataForm1.CommunicationComment, dataForm1.FutureComment, dataForm1.ChangeComment, dataForm1.TeamworkComment, dataForm1.CollaborationComment, dataForm1.AchievementComment, dataForm1.ClosingComment, dataForm1.Author], (err, result) => {
      if (err) {
        console.error('Error executing the database query:', err);
        return res.status(500).json({ success: false });
      }
      console.log('Comments added successfully!');
      return res.status(200).json({ success: true });
    });
});

app.get('/getCommentSub', (req, res) => {
    console.log("Inside getCommentSub");
    console.log(req.session.id)

    const userEmail = req.query.UserEmail
    //req.session.save();
    console.log("User Email on server: " + userEmail);
    const query = 'SELECT Integrity, PersonalORG, Improvement, Performance, Communication, Future, `Change`, Teamwork, Collaboration, Achievement, Closing, Author FROM tbluser U JOIN tblsubordinatecomments SC on U.UserID = SC.UserID WHERE UserEmail = ?';

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
        const commentData = result;
        console.log(commentData);
        return res.status(200).json({ success: true, commentData });
    });
});

// API route (Comment Summary)
// app.get('/getSummary', async (req, res) => {
//     try {
//         const userEmail = req.query.UserEmail;
//         let allComments = "";

//         // Fetch UserID based on UserEmail
//         const userIdQuery = 'SELECT UserID FROM tbluser WHERE UserEmail = ?';
//         const userIdResult = await dbQuery(userIdQuery, [userEmail]);
        
//         if(userIdResult.length > 0) {
//             const userId = userIdResult[0].UserID;

//             // Fetch comments for different tables
//             const queries = [
//                 'SELECT * FROM tblcomments WHERE UserID = ?',
//                 'SELECT * FROM tblmanagercomments WHERE UserID = ?',
//                 'SELECT * FROM tblpeercomments WHERE UserID = ?',
//                 'SELECT * FROM tblsubordinatecomments WHERE UserID = ?'
//             ];

//             const commentArrays = await Promise.all(queries.map(query => dbQuery(query, [userId])));

//             allComments = combineComments(...commentArrays);

//             // Generate summary using OpenAI API
//             const gpt3Response = await openai.createCompletion({
//                 prompt: allComments,
//                 max_tokens: 50
//             });

//             const summary = gpt3Response.choices[0].text.trim();
//             return res.json({ summary });

//         } else {
//             return res.status(404).json({ message: "User not found." });
//         }
//     } catch (error) {
//         console.error("An error occurred:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });

// // Utility Functions
// function dbQuery(query, params) {
//     return new Promise((resolve, reject) => {
//         db.query(query, params, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// }

// function combineComments(...commentArrays) {
//     let combined = "";
//     commentArrays.forEach(comments => {
//         for (const key in comments[0]) {
//             combined += comments[0][key] + " ";
//         }
//     });
//     return combined;
// }


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});