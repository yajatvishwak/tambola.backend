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

var l = 0;

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
var winnersobj = { test: "lo" };
var r1 = false;
var r2 = false;
var r3 = false;
var fh = false;

// * Core- result engine
app.post("/", (req, res) => {
  console.log(req.body);
  var fr = [];
  var sr = [];
  var tr = [];

  //distribute and make players current ticket
  for (var i = 0; i < req.body.ticket.length; i++) {
    var tt = req.body.ticket[i];
    if (tt.row == "FR") {
      fr.push(tt.value);
    } else if (tt.row == "SR") {
      sr.push(tt.value);
    } else {
      tr.push(tt.value);
    }
  }
  console.log("Current Ticket");
  console.log([fr, sr, tr]);

  const isWinner = (arr, category, name) => {
    if (
      (arr.length < 5 && category == "FR") ||
      (arr.length < 5 && category == "SR") ||
      (arr.length < 5 && category == "TR")
    ) {
      return {
        win: false,
        category: "Not All Numbers are called. Please check ",
        type: category,
      };
    } else if (arr.length < 15 && category == "FH") {
      console.log(arr);
      return {
        win: false,
        category: "Not All Numbers are called. Please check ",
        type: category,
      };
    } else {
      var win1 = true;
      console.log(arr);
      var notdone = [];
      for (var i = 0; i < arr.length; i++) {
        if (done.indexOf(arr[i]) == -1) {
          win1 = false;
          notdone.push(arr[i]);
        }
      }
      console.log(done);
      console.log(win1);
      if (win1 == false) {
        return {
          win: win1,
          type: category,
          category:
            "Awh no few numbers from your row are still not called. Play on!" +
            notdone,
        };
      } else {
        return {
          win: win1,
          type: category,
          category: category + " won by: " + name,
        };
      }
    }
  };

  var win = { win: false, category: "" };
  var chk = false;
  var name = req.body.name;
  if (req.body.type == "FR" && r1 == false) {
    win = isWinner(fr, "FR", name);
  } else if (req.body.type == "SR" && r2 == false) {
    win = isWinner(sr, "SR", name);
  } else if (req.body.type == "TR" && r3 == false) {
    win = isWinner(tr, "TR", name);
  } else if (req.body.type == "FH" && fh == false) {
    var a = [].concat.apply([], [fr, sr, tr]);
    win = isWinner(a, "FH", name);
  } else {
    chk = true;
    res.send("Some one else already won this category! ");
  }
  if (chk == false) {
    if (win.win == true) {
      if (win.type == "FR") {
        r1 = true;
        winnersobj.fr = req.body.name;
      } else if (win.type == "SR") {
        r2 = true;
        winnersobj.sr = req.body.name;
      } else if (win.type == "TR") {
        r3 = true;
        winnersobj.tr = req.body.name;
      } else if (win.type == "FH") {
        fh = true;
        winnersobj.fh = req.body.name;
        if (r1 == false) {
          winnersobj.fr = req.body.name;
        }
        if (r2 == false) {
          winnersobj.sr = req.body.name;
        }
        if (r3 == false) {
          winnersobj.tr = req.body.name;
        }
      } else {
      }
      wss.broadcast(
        JSON.stringify({
          channel: "win",
          message: win.category,
          gameOver: (r1 && r2 && r3 && fh) || fh ? true : false,
        })
      );
    } else {
      if (win.type == "FR") {
        res.send(win.category + " First Row");
      } else if (win.type == "SR") {
        res.send(win.category + " Second Row");
      } else if (win.type == "TR") {
        res.send(win.category + " Third Row");
      } else {
        res.send(win.category);
      }
    }
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
app.get("/winnersobj", (req, res) => {
  res.send(winnersobj);
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
