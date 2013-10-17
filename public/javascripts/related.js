'use strict';

; (function($){
  ['.field-title', '.field-tags', '.field-textarea'].forEach(function(selector){
    new Medium({
      element: document.querySelector(selector)
    });
  });


  $('.field-textarea').mentionsInput({
    triggerChar: '+',
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

})(jQuery);

