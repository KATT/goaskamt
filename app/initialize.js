var $body;
function App() {
  var self = this;

  $body = $(document.body);

  this._promises = {};

  this._$question   = $('.question');
  this._$answer     = $('.answer');
  this._$permalink  = $('.permalink');

  this._loadJoke();


  $body.on('vclick', '.joke__sharelink', function(){
    $(this).find('input').select();
  });

  $body.on('vclick', '.refresh-joke', this._refreshJoke.bind(this));


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


App.prototype._loadJoke = function(permalink) {
  var self = this;
  permalink = permalink || '';

  if (!self._promises[permalink]) {
    var deferred = $.Deferred();
    $.getJSON('/' + permalink + '.json')
      .then(function(data) {
        self._promises[data.permalink] = deferred.promise();
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
  this._$question.html(data.question).children().balanceText();
  this._$answer.html(data.answer).children().balanceText();

  var url = "http://goaskamt.se/" + data.permalink;
  this._$permalink.val(url);
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
      self._showJoke(data);
      self._updateState(data);
      self._invalidateRandomJoke();
    })
    .fail(function() {
      alert(':(')
    });
    ;
};


$(function() {
  window.app = new App();
});
