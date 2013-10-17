'use strict';

; (function($){
  var updateRelatedList = function (related) {

    var $list = $("#related-topics");
    $list.find(".list-group-item:not(.active)").remove();

    var $templatedRelated = $.map(related, function(data){
      return $('<a>')
        .attr('href', data.thing)
        .attr('target', '_blank')
        .addClass('list-group-item')
        .append(
          $('<img>')
            .attr('src', data.img)
            .attr('width', 40)
            .addClass('img-thumbnail pull-left')
        )
        .append(
          $('<h4>')
            .addClass('list-group-item-heading')
            .html(data.label)
        )
        .append(
          $('<p>')
            .addClass('url')
            .html(data.thing)
        )
    });

    $list.append($templatedRelated);
  };

  $("#related-topics-btn").on("click", function (event) {
    event.preventDefault();

    $('.field-textarea').data("mentionsInput").getMentions(function (mentions) {
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