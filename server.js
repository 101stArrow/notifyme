var express = require('express'),
    subdomain = require('express-subdomain'),
    app = express(),
    http = require('http').Server(app),
    bodyParser = require('body-parser'),
    _ = require('lodash'),
    jsonfile = require('jsonfile'),
    hbs = require('hbs');

var accountSid = "AC3aa42061638a212386a7024625b877d1",
    authToken = "22aedfce2e9ab5079926be95344da910";
var PORT = 80;

var client = require('twilio')(accountSid, authToken);
var sites;
var file = 'storage/sites.json'
jsonfile.readFile(file, function(err, obj) {
    sites = obj;
    console.log("Loaded sites")
})

function send(number, message) {
    client.messages.create({
        body: message,
        to: number,
        from: "+441301272003"
    }, function(err, message) {
        if (err) {
            console.log(err)
        }
    });
}
app.set('view engine', 'hbs');
app.set('view options', {
    layout: 'layouts/main.hbs'
});
app.use(require('express-subdomain-handler')({
    baseUrl: 'localhost',
    prefix: 'sub'
}));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.get('/', function(req, res) {
    res.render('notifier', {
        title: 'Welcome to the Notifier',
        path: req.path
    });
});

app.get('/sub/:subdomain/', function(req, res, next) {
    if(sites[req.params.subdomain]) {
        var site = sites[req.params.subdomain]
        res.render('notifier', {
            title: 'Welcome to the ' + site.name + ' notifier',
            path: req.path,
            site: site
        });
    } else {
        res.render('register', {
            title: 'This subdomain is availible',
            path: req.path,
            domain: req.params.subdomain
        })
    }
});

app.post("/send", function(req, res) {
    var user = req.body.user;
    var msg = req.body.msg;
    var specificUser = _.find(sites, function(usr) {
        return usr;
    });

    console.log(specificUser.lastmsg)
    timenow = new Date()

    if (specificUser.lastmsg < timenow.getTime() - (600 * 1000)) {
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
