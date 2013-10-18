
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    request = require('request'),
    natural = require('natural');

var GUARDIAN_API_KEY = "NewsLabs2013"; // api-key
var NEWSHACK_API_KEY = "tu5q78bw3hc8erqgxrwgbhjc";

var app = express();

// all environments
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({
    src: __dirname + '/public',
    paths: [
      __dirname + '/bower_components/bootstrap/less',
      __dirname + '/public'
    ]
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/components', express.static(path.join(__dirname, 'bower_components')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/tags', function (req, res) {
  var query = req.query.text;
  var lc_query = query.toLowerCase();
  var stemmed_terms = query.split(' (')[0].split(', ')[0].split(' ').map(function (word) {
    return natural.PorterStemmer.stem(word);
  });
  var search_query = stemmed_terms.join(' ');
  var post_data = {
  "query": {
    "bool": {
      "should": [
        {
          "prefix": {
            "lower_label": lc_query
          }
        },
        {
          "prefix": {
            "label": query
          }
        },
        {
          "match": {
            "label": query
          }
        },
        {
          "match": {
            "lower_label": lc_query
          }
        },
        {
          "prefix": {
            "search_label": search_query
          }
        }
      ],
      "minimum_should_match": 1,
      "must_not": {
        "query_string": {
          "query": "disambiguation"
        }
      }
    }
  }};


  var post_data_string = JSON.stringify(post_data);

  // Tripplestore API
  var options = {
    hostname : 'ec2-54-229-238-114.eu-west-1.compute.amazonaws.com',
    path: '/label-index/_search',
    port : 80,
    method : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': post_data_string.length
    }
  };

  var request = http.request(options, function(response){
    var body = "";
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function() {
      if (response.statusCode == 200) {
        body = JSON.parse(body);
        var response_hits = body.hits.hits.map(function (hit) {
          return hit["_source"];
        });
        res.send(response_hits);
      }
    });
  });

  request.on('error', function(e) {
    res.send('Problem with request: ' + e.message);
  });

  request.write(post_data_string);
  request.end();
});

app.get('/tag_image', function (req, res) {
  // http://en.wikipedia.org/w/api.php?action=query&prop=images&format=json&titles=David_Cameron

  var get_wiki_file_image = function (filename, callback) {
    // http://en.wikipedia.org/w/api.php?format=json&action=query&titles=Image:CameronNewcastle.jpg&prop=imageinfo&iiprop=url
    // Wiki image from file
    var options = {
      hostname : 'en.wikipedia.org',
      path: '/w/api.php?format=json&action=query&prop=imageinfo&iiprop=url&titles='+filename,
      port : 80,
      method : 'GET'
    };
    var request = http.request(options, function(response){
      var body = "";
      response.on('data', function(data) {
        body += data;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          var data = JSON.parse(body).query.pages;
          var url;
          for (var key in data) {
            url = data[key].imageinfo[0].url;
          }
          callback(url);
        }
      });
    });
    request.on('error', function(e) {
      res.send('Problem with request: ' + e.message);
    });
    request.end();
  };

  // Wiki file
  var options = {
    hostname : 'en.wikipedia.org',
    path: '/w/api.php?format=json&action=query&prop=pageimages&titles='+req.query.uri,
    port : 80,
    method : 'GET'
  };

  var request = http.request(options, function(response){
    var body = "";
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function() {
      if (response.statusCode == 200) {
        var data = JSON.parse(body).query.pages;
        var imgs = [];
        for (var key in data) {
          imgs.push(data[key]);
        }
        get_wiki_file_image("File:"+imgs[0].pageimage, function (result) {
          res.send(result);
        });
      }
    });
  });

  request.on('error', function(e) {
    res.send('Problem with request: ' + e.message);
  });

  request.end();

});

app.get('/livetopics', function (req, res) {
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

app.post('/index-content', function (req, res) {
  var options = {
    url: 'http://ec2-54-229-238-114.eu-west-1.compute.amazonaws.com/topic-finder/find/story',
    form: { text: req.body.text }
  };

  request.post(options, function(err, response, body){
    if (err){
      return res.send(500, { error: 'Something blew up'});
    }

    res.send(204);
  }).form(options.form);
});

app.post("/extract/:context", function (req, res) {
  if (req.body.ids === undefined){
    return res.json([]);
  }

  var ids_string = "?id=" + req.body.ids.reduce(function (a, b) {
    return a + "&id=" + b;
  });

  var options = {
    uri: 'http://ec2-54-229-238-114.eu-west-1.compute.amazonaws.com/topic-finder/find/'+req.params.context+ids_string,
    json: true
  };

  request.get(options, function(err, response, body){
    if (err){
      res.send(500, 'Problem with request: ' + err.message);
    }

    res.json(body);
  });
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
