// app.js

var express = require('express'),
  app = express(),
  request = require('request');
  
//setup static public directory
app.use(express.static(__dirname + '/public')); 

// use the jade templating engine
app.set('view engine', 'jade');


var getTemp = function(callback) {
  request({
    method: "GET",
    url: "https://reader.cloudant.com/logger/_design/fetch/_view/byDate?reduce=false&descending=true&limit=1"
  }, function (err, res, data) {
    data = JSON.parse(data);
    var temperature = data.rows[0].value;
    temperature = (parseInt(temperature*10) / 10) + "°C";
    callback(null, temperature);
  })
};

// render index page
app.get('/', function(req, res){
  getTemp(function(err,temperature) {
    res.render('index',{ temperature: temperature});
  })
});

app.use(function(req, res, next){
  res.redirect("/");
});

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);


