// app.js

var express = require('express'),
  cfenv = require('cfenv'),
  appEnv = cfenv.getAppEnv(),
  app = require('express')(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  Cloudant = require('cloudant'),
  async = require('async'),
  moment = require('moment'),
  logger = null;
  
// start server on the specified port and binding host
server.listen(appEnv.port, appEnv.bind, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});  

  
// connect to cloudant
var opts = null;
var services = process.env.VCAP_SERVICES
if (typeof services != 'undefined') {
  services = JSON.parse(services);
  opts = services.cloudantNoSQLDB[0].credentials;
  opts.account = opts.username;
}
Cloudant(opts, function(err, c) {
  cloudant = c;
  logger = cloudant.use("logger");
  
  // listen to the changes feed
  var feed = logger.follow({since: "now", include_docs:true});
  feed.on("change", function(change) {
    //console.log(change.doc);
    io.emit("post", change.doc);
  });
  feed.follow();
});
  
//setup static public directory
app.use(express.static(__dirname + '/public')); 

// use the jade templating engine
app.set('view engine', 'jade');

// fetch the temperature
var getLatestTemp = function(callback) {
  var options = {
    reduce: false,
    descending: true, 
    limit: 1,
    include_docs:true,
    stale: "ok"
  }
  logger.view('fetch','byDate', options, function(err, data) {
    var temperature = data.rows[0].value;
    temperature = (parseInt(temperature*10) / 10) + "°C";
    callback(null, { temperature: temperature, date: data.rows[0].doc.date });
  });
};

// fetch last 24 hour's hourly trend
var getLastDaysTrend = function(callback) {
  var y = moment().utc().subtract(2,'days');
  var options = {
    startkey: [y.year(), y.month()+1 , y.date(), y.hour()],
    group_level:4
  };
  logger.view('fetch','byDate', options, function(err, data) {
    callback(null, data);
  });
};

// fetch last month's daily trend
var getLastMonthsTrend = function(callback) {
  var y = moment().utc().subtract(1,'month');
  var options = {
    startkey: [y.year(), y.month()+1 , y.date()],
    group_level:3
  };
  logger.view('fetch','byDate', options, function(err, data) {
    callback(null, data);
  });
};

var getLastYearsTrend = function(callback) {
  var y = moment().utc().subtract(12,'month');
  var options = {
    startkey: [y.year(), y.month()+1 , y.date()],
    group_level:2
  };
  logger.view('fetch','byDate', options, function(err, data) {
    callback(null, data);
  });
};

// render index page
app.get('/', function(req, res){
  var tasks = [getLatestTemp,  getLastDaysTrend, getLastMonthsTrend, getLastYearsTrend];
  async.parallel(tasks, function(err, data) {
    
    // sort out the hourly trend
    var trend = [ ["Hour", "Temperature"] ];
    for(var i in data[1].rows) {
      var v = [ data[1].rows[i].key[3].toString() , data[1].rows[i].value.sum / data[1].rows[i].value.count]
      trend.push(v);
    }
    
    // sort out the monthly trend
    var trend2 = [ ["Hour", "Max","Avg", "Min"] ];
    for(var i in data[2].rows) {
      var v = [ data[2].rows[i].key[2].toString() , // label
                data[2].rows[i].value.max, // max
                data[2].rows[i].value.sum / data[2].rows[i].value.count, // average
                data[2].rows[i].value.min]; // min 

      trend2.push(v);
    }
    
    // sort out the yearly trend
    var trend3 = [ ["Month", "Max","Avg", "Min"] ];
    for(var i in data[3].rows) {
      var v = [ data[3].rows[i].key[1].toString() , // label
                data[3].rows[i].value.max, // max
                data[3].rows[i].value.sum / data[3].rows[i].value.count, // average
                data[3].rows[i].value.min]; // min 

      trend3.push(v);
    }
    
    // render the view
    var d = { latest: data[0], trend: trend, trend2: trend2, trend3: trend3};
    res.render('index', d);
  });
});





