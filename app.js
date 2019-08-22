const production = process.env.NODE_ENV === 'Production';
let io;
if(!production){
    let app = require("express")();
    let http = require("http").Server(app);
    io = require("socket.io")(http);
    // Initialize our websocket server on port 5000
    http.listen(5000, () => {
        console.log("started on port 5000");
    });
}
else{
    const fs = require('fs');
    const app = require('express')();
    const https = require('https');
    const server = https.createServer({
        key: fs.readFileSync('/etc/letsencrypt/live/chocoloco.tk/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/chocoloco.tk/fullchain.pem')
    }, app);
    server.listen(5000);

    io = require('socket.io').listen(server);
}

let currentWatchingVideoUrl = 'https://chocoloco.tk/big_buck_bunny.mp4';

io.on("connection", socket => {
    let username;
    let id;
    // Log whenever a user connects
    console.log("user connected", socket.id);

    // Send the new client the current url.
    io.to(socket.id).emit("message", { type: "SET_VIDEO_URL", text: '{"type":5,"text":"'+currentWatchingVideoUrl+'"}'});

    socket.on("JOIN_ROOM", message => {
        console.log("JOIN_ROOM Received: " + message);
        username = JSON.parse(message)['user'];
        id = JSON.parse(message)['id'];
        io.emit("message", { type: "JOIN_ROOM", text: message });
    });


    // Log whenever a client disconnects from our websocket server
    socket.on("disconnect", function(reason) {
        console.log("user disconnected " + username + " " + reason);
        io.emit("message", { type: "LEAVE_ROOM", text: '{"type":7,"text":"Test message","id":"'+id+'","user":"'+username+'"}'});
    });


    // When we receive a 'message' event from our client, print out
    // the contents of that message and then echo it back to our client
    // using `io.emit()`
    socket.on("SEND_CHAT_MESSAGE", message => {
        console.log("SEND_CHAT_MESSAGE Received: " + message);
        io.emit("message", { type: "SEND_CHAT_MESSAGE", text: message });
    });

    socket.on("SEND_VIDEO_TIME", message => {
        console.log("SEND_VIDEO_TIME Received: " + message);
        io.emit("message", { type: "SEND_VIDEO_TIME", text: message });
    });

    socket.on("PLAY_VIDEO", message => {
        console.log("PLAY_VIDEO Received: " + message);
        io.emit("message", { type: "PLAY_VIDEO", text: message });
    });

    socket.on("PAUSE_VIDEO", message => {
        console.log("PAUSE_VIDEO Received: " + message);
        io.emit("message", { type: "PAUSE_VIDEO", text: message});
    });

    socket.on("STARTED_TYPING", message => {
        console.log("STARTED_TYPING Received: " + message);
        io.emit("message", { type: "STARTED_TYPING", text: message});
    });

    socket.on("STOPPED_TYPING", message => {
        console.log("STOPPED_TYPING Received: " + message);
        io.emit("message", { type: "STOPPED_TYPING", text: message});
    });

    socket.on("CHANGED_USERNAME", message => {
        console.log("CHANGED_USERNAME Received: " + message);
        io.emit("message", { type: "CHANGED_USERNAME", text: message});
    });

    socket.on("CURRENT_TIME", message => {
        // console.log("CURRENT_TIME Received: " + message);
        io.emit("message", { type: "CURRENT_TIME", text: message});
    });

    socket.on("SET_VIDEO_URL", message => {
        console.log("SET_VIDEO_URL Received: " + message);
        currentWatchingVideoUrl = JSON.parse(message)['text'];
        io.emit("message", { type: "SET_VIDEO_URL", text: message});
    });

});
