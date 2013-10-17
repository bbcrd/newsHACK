'use strict';

; (function($){
  var getResponseTemplate = {
    '__story': function(story){
      return $('<a>')
        .attr('href', story.uri)
        .attr('target', '_blank')
        .addClass('list-group-item')
        .append(
          $('<h4>')
            .addClass('list-group-item-heading')
            .html(story.title)
        )
        .append(
          $('<p>')
            .addClass('url')
            .html(moment(story.date).fromNow())
        )
    },
    '__reference': function(refIds){
      var names = refIds.map(function(url){
        return url.split('/').pop().replace(/_/g, ' ');
      });

      return $('<a>')
        .attr('href', refIds)
        .attr('target', '_blank')
        .addClass('list-group-item group')
        .append(
          $('<h4>')
            .addClass('list-group-item-heading')
            .html(names)
        )
        .append(
          $('<p>')
            .addClass('url')
            .html(refIds.join(', '))
        )
    },
    '#related-stories': function(response){
      return $.map(response, function(data){
        var stories = $.map(data.stories, getResponseTemplate.__story);
        stories.unshift(getResponseTemplate.__reference(data.refId))

        return stories;
      });
    },
    '#related-topics': function(response){
      return $.map(response, function(data){
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
    }
  };

  var updateRelatedList = function (targetElement) {

    return function(response){
      var $list = $(targetElement);
      $list.find(".list-group-item:not(.active)").remove();

      var $templatedRelated = getResponseTemplate[targetElement](response);

      $list.append($templatedRelated);
    }
  };

  $('a[href^="/extract"]').on("click", function (event) {
    event.preventDefault();

    $('.field-textarea').data("mentionsInput").getMentions(function (mentions) {
      var ids = [];
      $.each(mentions, function (index, tag) {
        ids.push(tag.id);
      })

      var clickedLink = event.target;
      var targetContainer = '#' + clickedLink.id.replace(/-btn$/, '');
      $.post(clickedLink.getAttribute('href'), { ids: ids }, updateRelatedList(targetContainer));
    });

  });
})(jQuery);