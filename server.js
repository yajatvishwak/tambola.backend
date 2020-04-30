// var Pusher = require("pusher");

// var pusher = new Pusher({
//   appId: "989796",
//   key: "fdb75fe73c74aba30121",
//   secret: "1eb53033cd20452da9f6",
//   cluster: "ap2",
//   encrypted: true,
// });

//Websocket Implementation
const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 2222 });
const uniqueRandomRange = require("unique-random-range");

//broadcasting message
wss.broadcast = function broadcast(msg) {
  console.log(msg);
  wss.clients.forEach(function each(client) {
    client.send(msg);
  });
};

// Socket initiliazation
wss.on("connection", (ws) => {
  console.info("websocket connection open");

  if (ws.readyState === ws.OPEN) {
    ws.send(
      JSON.stringify({
        message: "0",
      })
    );
  }
});

let rand = uniqueRandomRange(1, 89);
let seq = [];
let done = [];
for (var i = 1; i <= 89; i++) {
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
var winnersobj = { test: "lol" };
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
  var notdone = [];
  for (var i = 0; i < arr.length; i++) {
    if (done.indexOf(arr[i]) == -1) {
      notdone.push(arr[i]);
      win = false;
    }
  }
  if (win == false || arr.length == 0) {
    console.log("BRUHHH... He did not win");
    res.send(
      "Awhhh No! These numbers are still not called :( Play on! The Numbers: " +
        notdone
    );
  } else {
    var me;
    if (req.body.type == "FR" && r1 == false) {
      me = "First row won by :" + req.body.name + " \n";
      r1 = true;
      winnersobj.fr = req.body.name;
    } else if (req.body.type == "SR" && r2 == false) {
      me = "Second row won by :" + req.body.name + " \n";
      r2 = true;
      winnersobj.sr = req.body.name;
    } else if (req.body.type == "TR" && r3 == false) {
      me = "Third row won by :" + req.body.name + " \n";
      r3 = true;
      winnersobj.tr = req.body.name;
    } else if (req.body.type == "FH" && fh == false) {
      me = "Full House won by :" + req.body.name + " \n";
      fh = true;
      winnersobj.fh = req.body.name;
      if (r1 == false) {
        winnersobj.fh = req.body.name;
      } else if (r2 == false) {
        winnersobj.sr = req.body.name;
      } else if (r3 == false) {
        winnersobj.tr = req.body.name;
      } else {
      }
    } else {
      me = "Someone already won this or Invalid request \n";
    }
    winner.push(me);

    // pusher.trigger("my-channel", "win", {
    //   message: me,
    //   gameOver: (r1 && r2 && r3 && fh) || fh ? true : false,
    // });

    wss.broadcast(
      JSON.stringify({
        channel: "win",
        message: me,
        gameOver: (r1 && r2 && r3 && fh) || fh ? true : false,
      })
    );
    console.log("He won... how am i supposed to tell everyone?? ");
  }
});
// *to return a ticket
app.post("/getTicket", (req, res) => {
  var userID = req.body.userID;
  User.findOne({ userID: userID }, (err, doc) => {
    if (doc) {
      res.send(doc.ticket);
    } else {
      res.send("error");
    }
  });
});

//* Push new number to all connected devices
app.post("/next", (req, res) => {
  console.log(req.body.pass);
  if (l >= 89) {
    res.send("All numbers done!");
  }
  if (req.body.pass == "lemmein") {
    wss.broadcast(JSON.stringify({ channel: "number", number: seq[l] }));
    done.push(seq[l]);
    l++;
    console.log(done);
    res.send({ Number: seq[l], totalNumbersDone: l, allNumbersDone: done });
  }
});

// * return winner
app.get("/winner", (req, res) => {
  if (winner.length == 0) {
    res.send("No Winner yet, Play on! :)");
  } else {
    res.send(winner);
  }
});
app.get("/winnersobj", (req, res) => {
  if (winner.length == 0) {
    res.send(null);
  } else {
    //console.log(winnersobj);
    res.send(winnersobj);
  }
});

app.get("/done", (req, res) => {
  res.send(done);
});

// * login credentials
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

      let rand1 = uniqueRandomRange(1, 89);
      let ticketArr1 = [];
      let ticketArr2 = [];
      let ticketArr3 = [];
      for (var i = 0; i < 5; i++) {
        ticketArr1.push(rand1());
        ticketArr2.push(rand1());
        ticketArr3.push(rand1());
      }
      ticketArr1 = ticketArr1.sort();
      ticketArr2 = ticketArr2.sort();
      ticketArr3 = ticketArr3.sort();

      var ticketArr = [ticketArr1.sort(), ticketArr2.sort(), ticketArr3.sort()];
      console.log(ticketArr);

      var up = { ticket: ticketArr };
      if (doc.ticket.length == 0) {
        User.update({ userID: doc.userID }, up)
          .then(console.log("updated"))
          .catch((e) => {
            console.log(e);
          });
      }
      res.json({
        isauth: true,
        tick: doc.ticket.length == 0 ? ticketArr : doc.ticket,
      });
    } else {
      res.json({ isauth: false, tick: null });
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
    app.listen(port, () =>
      console.log(`listening on port : ${port} WS on port: 2222`)
    );
  })
  .catch(() => console.log("Nononono Couldnt connect to server"));
