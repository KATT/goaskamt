process.chdir(__dirname);

var express = require('express'),
    hl = require("highlight").Highlight,
    io = require('socket.io'),
    marked = require('marked'),
    https = require('https'),
    forceDomain = require('node-force-domain')
    ;


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
  app.use(forceDomain({
    hostname: 'goaskamt.se'
  }));
  app.set('view engine', 'jade');
});

// Tips
var tips = [
  {
    permalink:  null,
    question:   marked('Test'),
    answer:     marked('Test')
  },
  {
    permalink:  null,
    question:   marked('Test2'),
    answer:     marked('Test')
  }
];

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

updateTips(tips);



function generateTip (permalinkOrIndex, notArray) {
  permalinkOrIndex = permalinkOrIndex || generateRandomIndex(notArray);

  var tip = permalinks[permalinkOrIndex];
  if (!tip) {
    return null;
  }
  return tip;
}

function generateRandomIndex(notArray) {
  if (!notArray) {
    return Math.floor(Math.random() * tips.length);
  }

  // make an array of available ids
  var availableIds = [];
  for (var i = 0; i < tips.length; i++) {
    var tip = tips[i];
    if (notArray.indexOf(tip.permalink) === -1) {
      availableIds.push(i);
    }
  }

  // get a random index of the new array
  var randomIndex = Math.floor(Math.random() * availableIds.length);

  // get the original id of this
  return availableIds[randomIndex];
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
          var lineArr = line.split('\t');

          var permalink   = lineArr[0];
          var question    = lineArr[1];
          var answer      = lineArr[2];
          var isApproved  = lineArr[3];

          if (!question || !answer) {
            console.error('Row', index, line, 'does not have both Q&A');
            return;
          }
          if (String(isApproved) !== '1') {
            console.warn('Row', index, line, 'is not approved');
            return;
          }

          permalink = permalink.toLowerCase().replace(/[^a-z0-9-]/g, '');
          permalink = permalink || String(index);

          var obj = {
            permalink:  permalink,
            question:   marked(question),
            answer:     marked(answer)
          };

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

var renderTip = function(tip, res, location) {
  if (typeof(location) == 'undefined') {
    location = tip.permalink;
  }
  res.render('index', {
    locals: {
      tip: tip,
      location: location,
      canonical: tip.permalink,
      joke: tip.question.replace(/(<([^>]+)>|\n)/ig,"") + ' ' + tip.answer.replace(/(<([^>]+)>)/ig,"")
    }
  });
};

// Routes
app.all('/.:format?', function (req, res) {
  var notArray = null;
  if (req.body && typeof(req.body.not) === 'object') {
    notArray = req.body.not;
  }
  var tip = generateTip(null, notArray);
  var format = req.params.format;

  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);

  if (format === 'json') {
    res.send(tip);
    return;
  }
  renderTip(tip, res, '');
});


app.all('/:permalink.:format?', function (req, res, next) {
  var permalink = req.params.permalink;
  var format = req.params.format;

  var tip = generateTip(permalink);
  if (!tip) {
    next();
    return;
  }

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
    renderTip(tip, res);
  } else {
    res.redirect('/');
  }
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
