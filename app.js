
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var GUARDIAN_API_KEY = "NewsLabs2013"; // api-key
var NEWSHACK_API_KEY = "tu5q78bw3hc8erqgxrwgbhjc";

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/tags', function (req, res) {
  console.log(req.query.text);
  res.send({
    tags: [{
      tagName: "name",
      tagText: req.query.text
    },
    {
      tagName: "name",
      tagText: req.query.text
    },
    {
      tagName: "name",
      tagText: req.query.text
    },
    {
      tagName: "name",
      tagText: req.query.text
    }]
  });
});

app.get('/livetopics', function (req, res) {
  console.log(req.query);
  var options = { // http://bbc.api.mashery.com/livetopics/topics?service=bbcone&from=2013-01-15T12%3A00%3A00Z&to=2013-01-15T12%3A05%3A00Z&api_key=fd6urvpzbc498vmx6dsa5evg
    hostname : 'bbc.api.mashery.com',
    path : '/livetopics/topics?service=bbcone&from=2013-01-15T12%3A00%3A00Z&to=2013-01-15T12%3A05%3A00Z&api_key='+NEWSHACK_API_KEY,
    port : 80,
    method : 'GET'
  };

  var request = http.request(options, function(response){
    console.log(options.host+options.path);
    var body = "";
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function() {
      if (response.statusCode == 200) {
        res.send(JSON.parse(body));
      }
    });
  });

  request.on('error', function(e) {
    res.send('Problem with request: ' + e.message);
  });

  request.end();

});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
