// Create web server
// 1. Create express object
const express = require('express');
const app = express();
// 2. Create http object
const http = require('http');
const server = http.createServer(app);
// 3. Create socket.io object
const io = require('socket.io')(server);
// 4. Create mongoose object
const mongoose = require('mongoose');
// 5. Create cors object
const cors = require('cors');
// 6. Create body-parser object
const bodyParser = require('body-parser');

// Connect to mongodb database
mongoose.connect('mongodb://localhost:27017/comments', { useNewUrlParser: true, useUnifiedTopology: true });

// Create schema
const commentSchema = new mongoose.Schema({
    name: String,
    comment: String,
    time: String
});

// Create model
const Comment = mongoose.model('Comment', commentSchema);

// Use cors
app.use(cors());

// Use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use static files
app.use(express.static('public'));

// Create route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Create socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Get all comments from database
    Comment.find({}, (err, comments) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Get all comments');
            socket.emit('output', comments);
        }
    });

    // Get comment from client
    socket.on('input', (data) => {
        const name = data.name;
        const comment = data.comment;
        const time = data.time;

        // Create new comment
        const newComment = new Comment({
            name: name,
            comment: comment,
            time: time
        });

        // Save new comment to database
        newComment.save((err, comment) => {
            if (err) {
                console.log(err);
            } else {
                console.log('New comment saved');
                socket.emit('output', [comment]);
            }
        });
    });

    // Get delete comment from client
    socket.on('delete', (id) => {
        Comment.findByIdAndRemove(id, (err, comment) => {
            if (err) {
                console.log(err);
            } else {
                console
                console.log('Comment deleted');
                socket.emit('delete', id);
            }
        });
    });
});
