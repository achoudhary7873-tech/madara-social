// server.js

const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

let users = {};

// STORAGE
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({ storage });

// SIGNUP
app.post("/signup", (req, res) => {

    const { username, password } = req.body;

    if (users[username]) {

        return res.json({
            success: false,
            msg: "User already exists"
        });

    }

    users[username] = {
        password,
        posts: []
    };

    res.json({
        success: true,
        msg: "Account created"
    });

});

// LOGIN
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (
        !users[username] ||
        users[username].password !== password
    ) {

        return res.json({
            success: false,
            msg: "Wrong login"
        });

    }

    res.json({
        success: true,
        msg: "Login success"
    });

});

// UPLOAD
app.post("/upload", upload.single("file"), (req, res) => {

    const { username, caption } = req.body;

    const filePath = "/uploads/" + req.file.filename;

    users[username].posts.push({

        file: filePath,

        type: req.file.mimetype.startsWith("video")
            ? "video"
            : "image",

        caption,

        likes: 0,

        comments: []

    });

    res.json({
        success: true,
        msg: "Uploaded"
    });

});

// LIKE
app.post("/like", (req, res) => {

    const { owner, index } = req.body;

    users[owner].posts[index].likes++;

    res.json({
        success: true
    });

});

// COMMENT
app.post("/comment", (req, res) => {

    const { owner, index, text } = req.body;

    users[owner].posts[index].comments.push(text);

    res.json({
        success: true
    });

});

// FEED
app.get("/feed", (req, res) => {

    res.json(users);

});

// START SERVER
app.listen(3000, () => {

    console.log("🔥 Server running on http://localhost:3000");

});