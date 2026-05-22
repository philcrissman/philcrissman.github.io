$(function(){
  var rndm = function(){ return parseInt(Math.random() * 100); };

  var arr = [];
  var arrayMap = {};
  var elementCount = 16;

  var randomArray = function(ar) {
    for(var i=0;i<elementCount;i++){ ar.push(rndm()); }
  };
  var inOrderArray = function(ar) {
    for(var i=0;i<elementCount;i++){ ar.push(i+1); }
  };
  var backwardsArray = function(ar) {
    for(var i=elementCount;i>0;i--){ ar.push(i); }
  };

  var timing = 25;
  var setTime = 100;
  var paper = Raphael("container", 1340, 700);

  var palette = [
    "#bf360c","#5d4037","#ff6f00","#33691e",
    "#e65100","#3949ab","#00695c","#512da8",
    "#ad1457","#6a1b9a","#1565c0","#2e7d32",
    "#d84315","#4527a0","#00838f","#6d4c41"
  ];
  var currentColor = 0;

  var colorCycle = function(){
    var c = palette[currentColor % palette.length];
    currentColor++;
    return c;
  };

  var arrowStyle = "classic-narrow-long";
  var xCalc = function(i){ return 200 + 25*(i+1); };
  var rowH = 120;

  var drawCircle = function(x, y, label, color){
    setTimeout(function(){
      paper.circle(x,y,10).attr({"stroke":"#f5f0e8","stroke-width":4});
      paper.circle(x,y,10).attr({"stroke":color,"stroke-width":2});
      paper.text(x,y,label).attr({
        "font-family":"ETBembo, Palatino, Book Antiqua, Georgia, serif",
        "font-size":"10px","font-weight":"800","fill":color
      });
    }, setTime);
    setTime += timing;
  };

  // lineY controls the y-coordinate of the horizontal segment of the elbow path.
  // Each arrow gets a slightly different lineY so paths fan out and don't stack on top of each other.
  var drawArrow = function(x1, y1, x2, y2, color, lineY){
    var path = (Math.abs(x1-x2) < 1)
      ? "M"+x1+","+y1+"L"+x2+","+y2
      : "M"+x1+","+y1+"V"+lineY+"H"+x2+"V"+y2;
    setTimeout(function(){
      paper.path(path).attr({"stroke-width":4,"stroke":"#f5f0e8"});
      paper.path(path).attr({"stroke-width":2,"stroke":color,"arrow-end":arrowStyle});
    }, setTime);
    setTime += timing;
  };

  var rowLabel = function(y, text){
    setTimeout(function(){
      paper.text(60, y, text).attr({
        "font-family":"ETBembo, Palatino, Book Antiqua, Georgia, serif",
        "font-size":"9px","fill":"#7a7060","font-style":"italic"
      });
    }, setTime);
    setTime += timing;
  };

  var visualize = function(array){
    var work = array.slice();
    var elColors = [];
    for(var i=0;i<work.length;i++){ elColors.push(arrayMap[i].color); }

    var y = 50;
    var lineYOffset;

    rowLabel(y, "unsorted");
    for(var i=0;i<work.length;i++){
      drawCircle(xCalc(i), y, work[i], elColors[i]);
    }

    var width = 1;
    while(width < work.length){
      y += rowH;
      var prevY = y - rowH;
      var nextWork = work.slice();
      var nextElColors = elColors.slice();

      // reset the elbow offset at the start of each pass, just below the source row
      lineYOffset = prevY + 20;

      (function(yy, w){
        rowLabel(yy, "merge "+w+"s");
      })(y, width);

      for(var l=0; l<work.length; l += width*2){
        var m = Math.min(l + width - 1, work.length - 1);
        var r = Math.min(l + width*2 - 1, work.length - 1);

        if(m >= r){
          // single subarray, no merge — pass straight through
          for(var i=l; i<=r; i++){
            (function(ii, py, ny, c, v, ly){
              drawArrow(xCalc(ii), py+11, xCalc(ii), ny-11, c, ly);
              drawCircle(xCalc(ii), ny, v, c);
            })(i, prevY, y, elColors[i], work[i], lineYOffset);
            lineYOffset += 5;
          }
          continue;
        }

        var left = work.slice(l, m+1);
        var right = work.slice(m+1, r+1);
        var leftC = elColors.slice(l, m+1);
        var rightC = elColors.slice(m+1, r+1);

        var li = 0, ri = 0, k = l;

        while(li < left.length && ri < right.length){
          var srcIdx, val, col;
          if(left[li] <= right[ri]){
            srcIdx = l+li; val = left[li]; col = leftC[li]; li++;
          } else {
            srcIdx = m+1+ri; val = right[ri]; col = rightC[ri]; ri++;
          }
          (function(si, di, py, ny, c, v, ly){
            drawArrow(xCalc(si), py+11, xCalc(di), ny-11, c, ly);
            drawCircle(xCalc(di), ny, v, c);
            nextWork[di] = v;
            nextElColors[di] = c;
          })(srcIdx, k, prevY, y, col, val, lineYOffset);
          lineYOffset += 5;
          k++;
        }

        while(li < left.length){
          (function(si, di, py, ny, c, v, ly){
            drawArrow(xCalc(si), py+11, xCalc(di), ny-11, c, ly);
            drawCircle(xCalc(di), ny, v, c);
            nextWork[di] = v;
            nextElColors[di] = c;
          })(l+li, k, prevY, y, leftC[li], left[li], lineYOffset);
          lineYOffset += 5;
          li++; k++;
        }

        while(ri < right.length){
          (function(si, di, py, ny, c, v, ly){
            drawArrow(xCalc(si), py+11, xCalc(di), ny-11, c, ly);
            drawCircle(xCalc(di), ny, v, c);
            nextWork[di] = v;
            nextElColors[di] = c;
          })(m+1+ri, k, prevY, y, rightC[ri], right[ri], lineYOffset);
          lineYOffset += 5;
          ri++; k++;
        }
      }

      work = nextWork;
      elColors = nextElColors;
      width *= 2;
    }

    setTimeout(function(){
      $(".now-playing").hide();
      $("#array-links").show();
    }, setTime);
  };

  var setup = function(array){
    paper.clear();
    arrayMap = {};
    setTime = 100;
    currentColor = 0;
    array.forEach(function(el,i){
      arrayMap[i] = {};
      arrayMap[i]["color"] = colorCycle();
    });
  };

  $("a#random").click(function(){
    arr = []; randomArray(arr);
    setup(arr); visualize(arr);
    $("#array-links").hide(); $("div#lbl-random").show();
    return false;
  });
  $("a#in-order").click(function(){
    arr = []; inOrderArray(arr);
    setup(arr); visualize(arr);
    $("#array-links").hide(); $("div#lbl-in-order").show();
    return false;
  });
  $("a#reverse-sorted").click(function(){
    arr = []; backwardsArray(arr);
    setup(arr); visualize(arr);
    $("#array-links").hide(); $("div#lbl-reverse-sorted").show();
    return false;
  });

  $("a#slower").click(function(){
    timing = 40; $("a.speed").removeClass("selected"); $("a#slower").addClass("selected");
    return false;
  });
  $("a#faster").click(function(){
    timing = 10; $("a.speed").removeClass("selected"); $("a#faster").addClass("selected");
    return false;
  });
  $("a#default").click(function(){
    timing = 25; $("a.speed").removeClass("selected"); $("a#default").addClass("selected");
    return false;
  });
});
