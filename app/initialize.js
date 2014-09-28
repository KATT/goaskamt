var $body;
function App() {
  var self = this;

  $body = $(document.body);

  this._promises = {};

  this._$joke       = $('.joke');
  this._$joke.find('.question p').balanceText();


  this._seenJokes = [];
  this._$joke = $('.joke');
  this._$jokeTemplate = this._$joke.clone();

  this._loadJoke();

  $body.on('vclick', '.refresh-joke', this._refreshJoke.bind(this));

  $body.on('vclick', '.header__info', this._showPageInfo.bind(this));
  $body.on('vclick', '.page-info, .container', this._hidePageInfo.bind(this));
  this._addShareButtonListeners();


  window.onpopstate = function (event) {
    var nextPermalink    = document.location.pathname.substr(1);


    self._loadJoke(nextPermalink)
      .then(function(data) {
        self._showJoke(data);
        self._updateState(data);
        self._invalidateRandomJoke();
      })
      .fail(function() {
        alert(':(')
      });
      ;
  };

};

App.prototype._showPageInfo = function(e) {
  e.stopPropagation();
  this._pageInfoVisible = true;
  $('.page-info').velocity({
    translateY: ['0%', '-100%']
  }, {
    duration: 500,
    easing: 'easeOutQuart',
    display: 'block'
  });
  $('.container').velocity({
    translateY: $('.page-info').outerHeight()
  }, {
    duration: 500,
    easing: 'easeOutQuart'
  });
};

App.prototype._hidePageInfo = function() {
  $('.page-info').velocity({
    translateY: ['-100%', '0%']
  }, {
    duration: 500,
    easing: 'easeOutQuart',
    display: 'none'
  });
  $('.container').velocity({
    translateY: 0
  }, {
    duration: 500,
    easing: 'easeOutQuart'
  });
};

App.prototype._addShareButtonListeners = function() {
  $body.on('vclick', '.share--facebook', function(e) {
    e.preventDefault();
    FB.ui({
        method: 'share'
      , href: location.href
    });
  });

  $body.on('vclick', '.share--twitter', function(e) {
    e.preventDefault();

    var text = document.title;
    var shareUrl = location.href;

    var params = {
        via: 'Goaskamt'
      , original_referer: shareUrl
      , text: text
      , url: shareUrl
    };
    var queryString = $.param(params);


    var redirectURL = 'https://twitter.com/intent/tweet?' + queryString;
    window.twttr = window.twttr || {};
    // from https://dev.twitter.com/web/bookmarklet
    var D=550,A=450,C=screen.height,B=screen.width,H=Math.round((B/2)-(D/2)),G=0,F=document,E;if(C>A){G=Math.round((C/2)-(A/2))}window.twttr.shareWin=window.open(redirectURL,'','left='+H+',top='+G+',width='+D+',height='+A+',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
  });
};



App.prototype._loadJoke = function(permalink) {
  var self = this;
  permalink = permalink || '';

  if (!self._promises[permalink]) {
    var deferred = $.Deferred();

    $.post('/' + permalink + '.json', {not: self._seenJokes})
      .then(function(data) {
        if (data) {
          self._promises[data.permalink] = deferred.promise();
        }
        deferred.resolve(data);
      })
      .fail(function() {
        deferred.reject();
        delete self._promises[permalink];
      });
    self._promises[permalink] = deferred.promise();
  }
  return self._promises[permalink];
};

App.prototype._showJoke = function(data) {
  var $oldJoke = this._$joke;
  var $newJoke = this._$jokeTemplate.clone().css('opacity', 0);

  var url = "http://goaskamt.se/" + data.permalink;

  $newJoke.find('.question').html(data.question);
  $newJoke.find('.answer').html(data.answer);
  $newJoke.find('.share--url span').text(url);

  $newJoke.insertAfter($oldJoke).find('.question p').balanceText();

  $oldJoke.velocity({
    scale: 0.7,
    opacity: [0, 1]
  }, 500, 'easeOutQuart', function(){
    $oldJoke.remove();
  });
  $newJoke.velocity({
    scale: [1, 1.2],
    opacity: [1, 0]
  }, 500, 'easeOutQuart');

  this._$joke = $newJoke;
};

App.prototype._updateState = function(data) {
  var cleanQuestion = data.question.replace(/(<([^>]+)>)/ig,"");
  document.title = cleanQuestion + ' | Goa skämt';

  var currentUrl = document.location.pathname;
  var nextUrl = '/' + data.permalink;
  if (history && history.pushState && currentUrl !== nextUrl) {
    history.pushState(null, null, nextUrl);
  }
};

App.prototype._invalidateRandomJoke = function() {
  delete this._promises[''];
  this._loadJoke();
};

App.prototype._refreshJoke = function(e) {
  var self = this;
  if (e) {
    e.preventDefault();
  }

  this._loadJoke()
    .then(function(data) {
      console.log('then', data);
      if (!data) {
        self._seenJokes = [];
        self._invalidateRandomJoke();
        alert('Du har sett alla goa skämt!');
        self._refreshJoke();
        return;
      }
      self._showJoke(data);
      self._updateState(data);
      self._invalidateRandomJoke();
      self._seenJokes.push(data.permalink);
    })
    .fail(function() {
      alert(':(')
    });
    ;
};


$(function() {
  window.app = new App();
});
