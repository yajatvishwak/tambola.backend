var Pusher = require("pusher");

var pusher = new Pusher({
  appId: "989796",
  key: "fdb75fe73c74aba30121",
  secret: "1eb53033cd20452da9f6",
  cluster: "ap2",
  encrypted: true,
});
const uniqueRandomRange = require("unique-random-range");
let rand = uniqueRandomRange(1, 99);
let seq = [];
let done = [];
for (var i = 1; i <= 99; i++) {
  seq.push(rand());
}

let l = 0;

// pusher.trigger("my-channel", "my-event", {
//   message: Math.floor(Math.random() * 100),
// });
//pusher.disconnect();

// * express
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/user");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

//* Session variables
var winner = [];
var r1 = false;
var r2 = false;
var r3 = false;
var fh = false;

// * Core- result engine
app.post("/", (req, res) => {
  console.log(req.body);
  var win = true;
  var arr = req.body.ticket;
  //console.log(done);
  //done = [69, 23, 98, 89, 13, 66, 59, 87, 37, 86, 93, 96, 19, 88, 74];
  for (var i = 0; i < arr.length; i++) {
    if (done.indexOf(arr[i]) == -1) {
      win = false;
    }
  }
  if (win == false || arr.length == 0) {
    console.log("BRUHHH... He did not win");
  } else {
    var me;
    if (req.body.type == "FR") {
      me = "First row won by :" + req.body.name;
      r1 = true;
    } else if (req.body.type == "SR") {
      me = "Second row won by :" + req.body.name;
      r2 = true;
    } else if (req.body.type == "TR") {
      me = "Third row won by :" + req.body.name;
      r3 = true;
    } else {
      me = "Full House won by :" + req.body.name;
      fh = true;
    }
    winner.push(me);
    pusher.trigger("my-channel", "win", {
      message: me,
      gameOver: (r1 && r2 && r3 && fh) || fh ? true : false,
    });
    console.log("He won... how am i supposed to tell everyone?? ");
  }
});

//* Push new number to all connected devices
app.post("/next", (req, res) => {
  console.log(req.body.pass);
  if (req.body.pass == "lemmein") {
    pusher.trigger("my-channel", "my-event", {
      message: seq[l],
    });

    done.push(seq[l]);
    l++;
    console.log(done);
    res.send("Done: ");
  }
});

// * login credentials
app.post("/login", (req, res) => {});

//return winner
app.get("/winner", (req, res) => {
  res.send(winner);
});

app.post("/auth", (req, res) => {
  const username = req.body.userID;
  const password = req.body.password;
  console.log(username);
  const query = {
    userID: username,
    password: password,
  };
  User.findOne(query, (err, doc) => {
    if (doc) {
      console.log(doc);
      res.json(true);
    } else {
      res.json(false);
    }
  });
});

//* database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/tambola", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("yoyoyo its connected");
    app.listen(port, () => console.log(`listening on port : ${port}`));
  })
  .catch(() => console.log("Nononono Couldnt connect to server"));
