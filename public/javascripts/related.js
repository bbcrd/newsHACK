'use strict';

; (function($){
  ['.field-title', '.field-tags', '.field-textarea'].forEach(function(selector){
    new Medium({
      element: document.querySelector(selector)
    });
  });


  $('.field-textarea').mentionsInput({
    triggerChar: '+',
    templates: {
      mentionInline: _.template('<span data-entity="<%= id %>" data--id="<%= __id %>" contenteditable="false"><%= value %></span>&nbsp;'),
      mentionItemHighlight: _.template('')
    },
    onDataRequest:function (mode, query, callback) {
      $.getJSON("/tags", { text: query }, function (response) {
        var data = _.map(response, function(item){
          return {
            id: item.uri,
            name: item.label,
            avatar: 'http://fillmurray.com/30/30',
            type: 'dbpedia'
          };
        });

        // parse response
        callback.call(this, data);
      });
    }
  });

  $('.field-textarea').on('input mentions.show', function(event){
    var $autocompleteList = $(this).next('.mentions-autocomplete-list:visible');

    if ($autocompleteList && $autocompleteList.length){
      var offsetPos = $(this).offset();
      var pos = getCaretPixelPos(this);
      var coords = {
        left: parseInt(pos.left, 10) - offsetPos.left - window.pageXOffset,
        top: parseInt(pos.top, 10) - offsetPos.top + window.pageYOffset
      };

      $autocompleteList.css(coords);
    }
  });

  $('.field-textarea').on('click', '[data-entity]', function(e){
    var $this = $(this);
    var string = '+' + $this.text();
    var string_length = string.length;

    for (var i = 0; i < string_length; i++){
      $(e.delegateTarget).trigger($.Event('keypress', { which: string.charCodeAt(i), ctrlKey: false }));
    }

    $this.replaceWith(document.createTextNode(string));
    $(e.delegateTarget).trigger('input');
  })

})(jQuery);

