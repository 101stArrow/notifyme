var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    bodyParser = require('body-parser'),
    _ = require('lodash');


var accountSid = "AC3aa42061638a212386a7024625b877d1"
var authToken = "22aedfce2e9ab5079926be95344da910"
var PORT = 80;

var client = require('twilio')(accountSid, authToken);

var users = {
    "ebmuir": {
        "number": "+447401571769",
        "name": "Eric Muir",
        "lastmsg": 10
    },
    "dpfletcher": {
        "number": "+447446873754",
        "name": "David Fletcher",
        "lastmsg": 10
    }
}

function send(number, message) {
    client.messages.create({
        body: 'Hello from the Wimbletech Notification Robot - ' + message,
        to: number,
        from: "+441301272003"
    }, function(err, message) {
        if (err) {
            console.log(err)
        }
    });
}

app.use(bodyParser.urlencoded({
    extended: false
}));
app.get('/', function(req, res) {
    res.sendfile('index.html');
});

app.post("/send", function(req, res) {
    var user = req.body.user;
    var msg = req.body.msg;
    var specificUser = _.find(users, function(usr){
      return usr;
    });

    console.log(specificUser.lastmsg)
    timenow = new Date()

    if(specificUser.lastmsg < timenow.getTime() - (600 * 1000)) {
      specificUser.lastmsg = new Date().getTime();
      send(specificUser.number, msg)
      res.redirect('/')
    } else {
      console.log("Message sent in last 10 mins")
      res.send("A message was sent in the last 10 minutes, you need to wait")
    };
});

http.listen(PORT, function() {
    console.log("Running on " + PORT);
});
