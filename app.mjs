import {} from "dotenv/config";
import { dirname } from "path"
import { fileURLToPath } from "url";
import express from "express"
import fs from "fs"
import http from "http";
import { createSession } from "./services/sessionService.mjs";
import { Server } from "socket.io";
import routerPosts from "./routes/posts.mjs";
import routerUsers from "./routes/users.mjs";
import routerChats from "./routes/chats.mjs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(createSession());
app.use(routerUsers);
app.use(routerPosts);
app.use(routerChats);

function title(titleName) {
    return `<title> ${titleName} </title>`
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssTamplate = fs.readFileSync(__dirname + "/public/templates/cssTamplates/cssTamplate.html", "utf-8");
let nav = fs.readFileSync(__dirname + "/public/templates/navbar/navbar.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/public/templates/footer/footer.html", "utf-8");
const feed = fs.readFileSync(__dirname + "/public/components/feed/feed.html", "utf-8");
const login = fs.readFileSync(__dirname + "/public/components/login/login.html", "utf-8");
const signup = fs.readFileSync(__dirname + "/public/components/signup/signup.html", "utf-8");
const createPost = fs.readFileSync(__dirname + "/public/components/post/createPost.html", "utf-8");
const chat = fs.readFileSync(__dirname + "/public/components/chat/chat.html", "utf-8");
const viewPost = fs.readFileSync(__dirname + "/public/components/post/viewPost.html","utf-8");
const chatList =fs.readFileSync(__dirname + "/public/components/chatList/chatList.html","utf-8");
app.get("/*", (req, res, next) => {
    if (req.session.userId) {
        nav = fs.readFileSync(__dirname + "/public/templates/navbar/profileNavbar/profileNavbar.html", "utf-8");
    }
    else{
        nav = fs.readFileSync(__dirname + "/public/templates/navbar/navbar.html", "utf-8");
    }
    next();
})

app.get("/", (req, res) => {
    res.send(cssTamplate + title("H2H") +  nav + feed + footer);
});

app.get("/requested", (req, res) => {
    res.send(cssTamplate + title("H2H") +  nav + feed + footer);
});

app.get("/provided", (req, res) => {
    res.send(cssTamplate + title("H2H") +  nav + feed + footer);
});


app.get("/search", (req, res) => {
    res.send(cssTamplate + title("H2H") +  nav + feed + footer);
});




app.get("/login", (req, res)  => {
    if (req.session.userId){
        res.redirect("/")
    }
    res.send(cssTamplate + title("H2H - Login") + nav + login + footer);
});

app.get("/signup", (req, res) => {
    if (req.session.userId){
        res.redirect("/")
    }
    res.send(cssTamplate + title("H2H - Signup") + nav + signup + footer);
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})

app.get("/posts/:id", (req, res)=> {
    if(req.session.userId){
        res.send(cssTamplate + title("H2H + Post") + nav + viewPost + footer);
    }
    else{
        res.redirect("/login");
    }
});

app.get("/createPost", (req, res) => {
    if(req.session.userId){
        res.send(cssTamplate + title("H2H - New Post") + nav + createPost + footer);
    }
    else{
        res.redirect("/login");
    }
});

app.get("/chats" , (req, res) => {
    if(req.session.userId){
        res.send(cssTamplate + title("H2H + Messages") + nav + chatList + footer);
    }
    else{
        res.redirect("/login");
    }    
});

app.get("/chats/:id", (req, res) => {
    if(req.session.userId){
        res.send(cssTamplate + nav + chat+ footer);
    }
    else{
        res.redirect("/login");
    }
})

//get for all the other pages
app.get("/*", (req,res) => {
    res.send(cssTamplate + title("Page not found")+ nav + "<h1> That page does not exist 404</h1>" + footer);
})







const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("user connected");
    //Maybe don't send the entire room, since it sends the entire chatlog as well
    socket.on("sendMessage", (room, message, receiverId) => {
        //console.log("room: ", room, " message: ", message, " receieverId: ", receiverId);    
        //Send a message to the correct chatroom
        socket.to(room._id).emit("messageReceived", message);
        //Inform user that their message has been sent
        socket.emit("messageSent", message);

        //Send the roomId to notify the recipient user
        socket.to(receiverId).emit("newNotification", room._id);
    });

    socket.on('joinRoom', room => {
        //console.log("Connected to room object: ", room);
        socket.join(room._id);
    });
    
    //Event should be called something else
    socket.on("triggerNotifications", user => {
        console.log("triggerNotif: ", user);
        socket.join(user._Id);
    });

});






const PORT = process.env.PORT || 8080

server.listen(PORT, err => {
    err? console.log(err) : console.log('App runs on port: ', Number(PORT))
});

