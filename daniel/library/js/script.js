$(function(){
  $current = $('.joke').first(); 
  $('.joke p').balanceText();
  $(document).keydown(function (e) {
    if (e.keyCode == 32) {
      e.preventDefault();
      moreJoke(); 
    }
  });
  function moreJoke(){
    $current.velocity({
      translateY: '-25%',
      scale: [0.85, 1],
      opacity: 0
    }, 750, 'easeOutCubic');
    $current = $current.next(); 
    if($current.length == 0)
      $current = $('.joke:first');
    $current.addClass('joke--current').velocity({
      translateY: ['0%', '25%'],
      scale: [1, 0.85],
      opacity: [1, 0]
    }, 750, 'easeOutCubic');
  }
});