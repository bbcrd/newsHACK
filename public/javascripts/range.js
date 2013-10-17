'use strict';

//@ see http://jsfiddle.net/gliheng/vbucs/12/
function getCaretPixelPos($node, offsetx, offsety){
  offsetx = offsetx || 0;
  offsety = offsety || 0;

  var nodeLeft = 0,
    nodeTop = 0;
  if ($node){
    nodeLeft = $node.offsetLeft;
    nodeTop = $node.offsetTop;
  }

  var pos = {left: 0, top: 0};

  if (document.selection){
    var range = document.selection.createRange();
    pos.left = range.offsetLeft + offsetx - nodeLeft + 'px';
    pos.top = range.offsetTop + offsety - nodeTop + 'px';
  }else if (window.getSelection){
    var sel = window.getSelection();
    var range = sel.getRangeAt(0).cloneRange();
    try{
      range.setStart(range.startContainer, range.startOffset-1);
    }catch(e){}
    var rect = range.getBoundingClientRect();
    if (range.endOffset == 0 || range.toString() === ''){
      // first char of line
      if (range.startContainer == $node){
        // empty div
        if (range.endOffset == 0){
          pos.top = '0px';
          pos.left = '0px';
        }else{
          // firefox need this
          var range2 = range.cloneRange();
          range2.setStart(range2.startContainer, 0);
          var rect2 = range2.getBoundingClientRect();
          pos.left = rect2.left + offsetx - nodeLeft + 'px';
          pos.top = rect2.top + rect2.height + offsety - nodeTop + 'px';
        }
      }else{
        pos.top = range.startContainer.offsetTop+'px';
        pos.left = range.startContainer.offsetLeft+'px';
      }
    }else{
      pos.left = rect.left + rect.width + offsetx - nodeLeft + 'px';
      pos.top = rect.top + offsety - nodeTop + 'px';
    }
  }
  return pos;
};