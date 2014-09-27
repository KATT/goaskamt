process.chdir(__dirname);

var express = require('express'),
    hl = require("highlight").Highlight,
    io = require('socket.io'),
    https = require('https');


var app = express.createServer(),
    socket = io.listen(app);

socket.configure(function () {
  socket.set("transports", ["xhr-polling"]);
  socket.set("polling duration", 10);
});

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.set('view engine', 'jade');
});

// Tips
var tips;

var permalinks = {};


function updateTips (newTips) {
  tips = newTips;
  permalinks = {};

  // Make 'em sexy
  tips.forEach(function (tip, index) {
    tip.permalink = String(tip.permalink || index);
    permalinks[index] = tip;
    permalinks[tip.permalink] = tip;
  });

  // console.log('Permalinks', permalinks);
}

updateTips([]);



function generateTip (permalinkOrIndex) {
  permalinkOrIndex = permalinkOrIndex || generateRandomIndex();

  var tip = permalinks[permalinkOrIndex];
  if (!tip) {
    return null;
  }
  return tip;
}

function generateRandomIndex() {
  return Math.floor(Math.random() * tips.length);
}

var fetchNewTips = function (callback) {
  var uri = "https://docs.google.com/spreadsheet/pub?key=0AuZw38YlSWlDdDZ0Vkx4VGZucmJFVUZJS095S1E5LWc&single=true&gid=0&output=txt";

  var req = https.request(uri, function(res)
  {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
          output += chunk;
      });

      res.on('end', function() {
        var newTips = [];
        var lines = output.split('\n');
        var index = 0;
        lines.forEach(function (line) {
          line = line.split('\t');
          if (!line[1]) return;

          var obj = {};
          var permalink = line[0] || String(index);

          obj.permalink = permalink.toLowerCase().replace(/[^a-z0-9-]/g, '');
          obj.question = line[1];
          obj.answer = line[2];

          newTips.push(obj);

          index++;
        });

        updateTips(newTips);
        if (callback) {
          callback();
        }
      });
  });

  req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });

  req.end();
  setTimeout(fetchNewTips, 600*1000);
};


fetchNewTips();

// Routes
app.get('/.:format?', function (req, res) {
  var tip = generateTip();
  var format = req.params.format;

  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);

  if (format === 'json') {
    res.send(tip);
    return;
  }

  res.render('index', {
    locals: {
      tip: tip,
      location: '',
      canonical: tip.permalink
    }
  });
});


app.get('/_update', function (req, res) {
  fetchNewTips(function () {
    res.redirect('/_latest');
  });
});


app.get('/_latest', function (req, res) {
  var index = tips.length - 1;
  var tip = tips[index];

  res.redirect('/' + tip.permalink);
});

app.get('/:permalink.:format?', function (req, res) {
  var permalink = req.params.permalink;
  var format = req.params.format;

  var tip = generateTip(permalink);

  if (format === 'json') {
    res.send(tip);
    return;
  }
  if (tip) {
    if (String(permalink) !== String(tip.permalink)) {
      res.send(301, {
        location: '/' + tip.permalink
      });
      return;
    }
    res.render('index', {
      locals: {
        tip: tip,
        location: tip.permalink,
        canonical: tip.permalink
      }
    });
  } else {
    res.redirect('/');
  }
});

// WebSocket
socket.sockets.on('connection', function(client){
  client.on('message', function (action) {
    if (action === 'refresh') {
      client.send(JSON.stringify(generateTip(generateRandomIndex())));
    }
  });

  client.on('get', function (permalink) {
    var tip = generateTip(permalink);
    if (tip) {
      client.send(JSON.stringify(tip));
    }
  });
});

var port = (process.env.PORT || 3002);
app.listen(port, function() {
  console.log("Listening on " + port);
});
