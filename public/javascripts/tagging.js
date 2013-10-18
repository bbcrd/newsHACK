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
    '/extract/story': function(response){
      return $.map(response, function(data){
        var stories = $.map(data.stories, getResponseTemplate.__story);
        stories.unshift(getResponseTemplate.__reference(data.refId))

        return stories;
      });
    },
    '/extract/topic': function(response){
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
      $list.find(".list-group-item").not('.active, .selected').remove();
      var $templatedRelated = getResponseTemplate[$list.data('extractFrom')](response);

      $list.append($templatedRelated);
    }
  };

  var updateRelatedContents = function (event) {
    event.preventDefault();

    var ids = $('.field-textarea [data-entity]').map(function (index, tag) {
      return tag.getAttribute('data-entity');
    }).toArray();

    $('[data-extract-from]').each(function(i, el){
      var $el = $(el);

      $el.attr('data-state', 'loading');
      $.post($el.data('extractFrom'), { ids: ids })
        .done(updateRelatedList(el))
        .always(function(){
          console.log('loaded')
          $el.attr('data-state', 'loaded')
        });
    });
  };

  $('.field-textarea').on('mentions.change', updateRelatedContents);
  $('#update-related').on('click', updateRelatedContents);

  $('[data-extract-from]').on('click', '.list-group-item:not(.active)', function(e){
    e.preventDefault();

    $(this).toggleClass('selected');
  });

  $.ajaxSetup({
    timeout: 4000
  });

  $(document).ajaxStart(function(){
    $('#update-related').attr('data-state', 'loading').attr('disabled', true);
  });
  $(document).ajaxStop(function(){
    $('#update-related').attr('data-state', '').removeAttr('disabled');
  });
})(jQuery);