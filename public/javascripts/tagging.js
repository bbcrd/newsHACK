'use strict';

; (function($){
  var updateRelatedList = function (related) {

    var $list = $("#related").find("ul").empty();

    for (var i = 0; i < related.length; i++) {
      var r = related[i];
      console.log(r);
      var $li = $("<li />");
      var $img = $("<img src='"+r.img+"' width='40' />");
      var $a = $("<a href='"+r.thing+"'>"+r.label+"<a/>");
      $list.append($li.append($img, $a));
    };
  };

  $("#mainForm").on("submit", function (event) {
    event.preventDefault();

    $('textarea').data("mentionsInput").getMentions(function (mentions) {
      var ids = [];
      $.each(mentions, function (index, tag) {
        ids.push(tag.id);
      });
      $.post("/extract", { ids: ids }, function (response) {
        updateRelatedList(response);
      });
    });

  });
})(jQuery);