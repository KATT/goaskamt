var $body;
function App() {
  $body = $(document.body);
  this._bootstrapPage($body);
  oldUglyShit();

  $body.on('click', '.joke__sharelink', function(){
    $(this).find('input').select();
  })
};

App.prototype._bootstrapPage = function($el) {
  console.log('hejhej');
};


function updateDOM(data, pushState) {
  var $question = $('.question');
  var $answer = $('.answer');
  var url = '/' + data.permalink;

  $question.html(data.question).children().balanceText();
  $answer.html(data.answer).children().balanceText();

  document.getElementById('permalink').href = url;

  var cleanQuestion = data.question.replace(/(<([^>]+)>)/ig,"");
  document.title = cleanQuestion + ' | Goa skämt';
  if (!pushState || !history.pushState) {
    return;
  }
  if (document.location.pathname == url) {
    return;
  }

  history.pushState(null, null, url);
}
function fetch(url, pushState) {
  url = url || '';
  url = '/' + url + '.json';

  var oReq = new XMLHttpRequest();
  oReq.onload = function () {
    data = JSON.parse(oReq.responseText);
    updateDOM(data, pushState);
  };
  oReq.open("get", url, true);
  oReq.send();
};

function oldUglyShit() {

  if (!JSON) {
    return;
  }

  var $refresh = document.getElementById('refresh');


  $refresh.onmousedown = function (e) {
    fetch(null, true);
    e.preventDefault();
  };
  $refresh.onclick = function (e) {
    e.preventDefault();
  };
};

window.onpopstate = function (event) {
  var current = document.getElementById('permalink').getAttribute('href');
  var next = document.location.pathname;

  if (current === next || next === '/') {
    return;
  }

  fetch(next.substr(1), false);
};


$(function() {
  window.app = new App();
});