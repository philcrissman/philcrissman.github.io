$(function(){
  var rndm = function(){ return parseInt(Math.random() * 100) }

  var arr = [];
  var arrayMap = {};
  var elementCount = 20;

  var randomArray = function(ar) {
    for(var i=0;i<elementCount;i++){ ar.push(rndm()) }
  }

  var inOrderArray = function(ar) {
    for(var i=0;i<elementCount;i++){ ar.push(i) }
  }

  var backwardsArray = function(ar) {
    for(var i=elementCount;i>0;i--){ ar.push(i) }
  }

  var timing = 25;
  var setTime = 100;

  var yOffset = 50;
  var lineYOffset = 50;
  var paper = Raphael("container", 1340, 6000);
  
  var colors = [
    "#bf360c",
    "#5d4037",
    "#ff6f00",
    "#33691e",
    "#e65100",
    "#3949ab",
    "#00695c",
    "#512da8",
    "#ad1457",
    "#6a1b9a"
  ];
  var currentColor = 0;

  var colorCycle = function(){
    if (currentColor == 9) {
      currentColor = 0;
    } else {
      currentColor++;
    }
    return colors[currentColor];

  }

  arr.forEach(function(el,i){
    // give each element its own color
    arrayMap[i] = {};
    arrayMap[i]["color"] = colorCycle();
  });

  var glowWidth = 1;


  var drawCircle = function(x,y,label,color){
    if (x > 40 && drawn((x-225)/25,y)) {
      return;
    }
    if (color === undefined) {
      var color = "#222";
    }
    setTimeout(function() {
      paper.circle(x,y,10).attr({"stroke":"#f5f0e8","stroke-width":4});
      paper.circle(x,y,10).attr({"stroke":color,"stroke-width":2});
      paper.text(x,y,label).attr({"font-family":"ETBembo, Palatino, Book Antiqua, Georgia, serif","font-size":"10px","font-weight":"800","fill":color});
    }, setTime);
    setTime = setTime + timing;
  }

  var arrowStyle = "classic-narrow-long";

  var drawLine = function(x,y,xx,yy,ly,color){
    if (color === undefined) {
      color = "#222";
    }
    // var color = colorCycle();
    setTimeout(function() {
      if (x === xx) {
        paper.path("M"+x+","+y+"L"+xx+","+yy).attr({"stroke-width":4,"stroke":"#f5f0e8"});
        paper.path("M"+x+","+y+"L"+xx+","+yy).attr({"stroke-width":2,"arrow-end":arrowStyle,"stroke":color});
      } else {
        paper.path("M"+x+","+y+"V"+ly+"H"+xx+"V"+yy).attr({"stroke-width":4,"stroke":"#f5f0e8"});
        paper.path("M"+x+","+y+"V"+ly+"H"+xx+"V"+yy).attr({"stroke-width":2,"arrow-end":arrowStyle,"stroke":color});
      }
    }, setTime);
    setTime = setTime + timing;
  }

  var drawPivotLine = function(x,y,ly,color){
    if (color === undefined) {
      var color = "#222";
    }
    setTimeout(function(){
      paper.path("M"+50+","+y+"H75V"+ly+"H"+x+"V"+(y-10)).attr({"stroke-width":4,"stroke":"#f5f0e8"});
      paper.path("M"+50+","+y+"H75V"+ly+"H"+x+"V"+(y-10)).attr({"stroke-width":2,"stroke":color,"arrow-end":arrowStyle});
    }, setTime);
    setTime = setTime + timing;
  }

  var incrementLYOffset = function(){
    lineYOffset = lineYOffset + 5;
  }

  var xCalc = function(x){
    return 200+25*(x+1);
  }

  var drawn = function(index,y){
    return arrayMap[index]['lastY'] >= y;
  }


  arrayMap['pivot'] = {};

  var plainQs = function(list,start,finish){

    if (start >= finish) {
      return list;
    } 

    var pivot = list[start];

    var lo = start;
    var hi = finish;

    var moved = []
    while (true) {

      while (list[hi] >= pivot) {
       hi--;
        if (hi <= lo) {
          break;
        }
      }
      if (hi <= lo) {
        list[lo] = pivot;
        break;
      }

      list[lo] = list[hi];
      lo++;

      while (list[lo] < pivot) {
        lo++;
        if (lo >= hi) {
          break;
        }
      }
      if (lo >= hi) {
        lo = hi;
        list[hi] = pivot;
        break;
      }
      list[hi] = list[lo];
    }

    var currentYOffset = yOffset;

    qs(list,start,lo-1,currentYOffset);
    
    // draw the throughline for the pivot
    var c = arrayMap[lo]['color'];
    drawLine(xCalc(lo),currentYOffset+10,xCalc(lo),yOffset+90,lineYOffset,c);
    drawCircle(xCalc(lo),yOffset+100,list[lo],c);
    arrayMap[lo]['lastY'] = yOffset+100;


    qs(list,lo+1,finish,currentYOffset);
    
    return list;
  }

  var choosePivotIndex = function(list,a,b){
    return a;
  }

  var qs = function(list,start,finish,lastYOffset){
    lineYOffset = yOffset + 15;
    yOffset = yOffset + 100;

    if (start >= finish) {
      yOffset = yOffset - 100;
      return list;
    } 

    // var pivot = list[start];
    var pivotIndex = choosePivotIndex(list, start,finish);
    var pivot = list[pivotIndex];
    var c = arrayMap[start]['color'];
    arrayMap['pivot']['color'] = c;
    drawCircle(xCalc(start),lastYOffset,list[start],c);
    arrayMap[start]['lastY'] = lastYOffset;
    drawLine(xCalc(start),lastYOffset+10,40,yOffset-10,lineYOffset,c);
    incrementLYOffset();
    drawCircle(40,yOffset,pivot,c);

    var lo = start;
    var hi = finish;

    var moved = []
    while (true) {

      while (list[hi] >= pivot) {
        if (moved.indexOf(hi) < 0) {
          var c = arrayMap[hi]['color'];
          drawCircle(xCalc(hi),lastYOffset,list[hi],c);
          drawLine(xCalc(hi),lastYOffset+10,xCalc(hi),yOffset-10,lineYOffset,c);
          drawCircle(xCalc(hi),yOffset,list[hi],c);
          arrayMap[hi]['lastY'] = yOffset;
        }
        hi--;
        if (hi <= lo) {
          break;
        }
      }
      if (hi <= lo) {
        list[lo] = pivot;
        var c = arrayMap['pivot']['color'];
        arrayMap[lo]['color'] = c;
        drawPivotLine(xCalc(lo),yOffset,lineYOffset,c);
        incrementLYOffset();
        drawCircle(xCalc(lo),yOffset,pivot,c);
        arrayMap[lo]['lastY'] = yOffset;
        break;
      }

      var c = arrayMap[hi]['color'];
      arrayMap[lo]['color'] = c;
      drawCircle(xCalc(hi),lastYOffset,list[hi],c);
      drawLine(xCalc(hi),lastYOffset+10,xCalc(lo),yOffset-10,lineYOffset,c);
      incrementLYOffset();
      drawCircle(xCalc(lo),yOffset,list[hi],c);
      arrayMap[lo]['lastY'] = yOffset;
      moved.push(hi);
      list[lo] = list[hi];
      lo++;

      while (list[lo] < pivot) {
        if (moved.indexOf(lo) < 0) {
          x = xCalc(lo);
          var c = arrayMap[lo]['color'];
          drawCircle(x,lastYOffset,list[lo],c);
          drawLine(x,lastYOffset+10,x,yOffset-10,lineYOffset,c);
          drawCircle(x,yOffset,list[lo],c);
          arrayMap[lo]['lastY'] = yOffset;
        }
        lo++;
        if (lo >= hi) {
          break;
        }
      }
      if (lo >= hi) {
        lo = hi;
        list[hi] = pivot;
        var c = arrayMap['pivot']['color'];
        arrayMap[hi]['color'] = c;
        drawPivotLine(xCalc(hi),yOffset,lineYOffset,c);
        incrementLYOffset();
        drawCircle(xCalc(hi),yOffset,pivot,c);
        arrayMap[hi]['lastY'] = yOffset;
        break;
      }
      var c = arrayMap[lo]['color'];
      arrayMap[hi]['color'] = c;
      drawCircle(xCalc(lo),lastYOffset,list[lo],c);
      drawLine(xCalc(lo),lastYOffset+10,xCalc(hi),yOffset-10,lineYOffset,c);
      incrementLYOffset();
      drawCircle(xCalc(hi),yOffset,list[lo],c);
      arrayMap[hi]['lastY'] = yOffset;
      moved.push(lo);
      list[hi] = list[lo];
    }

    var currentYOffset = yOffset;

    qs(list,start,lo-1,currentYOffset);
    
    // draw the throughline for the pivot
    var c = arrayMap[lo]['color'];
    drawLine(xCalc(lo),currentYOffset+10,xCalc(lo),yOffset+90,lineYOffset,c);
    drawCircle(xCalc(lo),yOffset+100,list[lo],c);
    arrayMap[lo]['lastY'] = yOffset+100;


    qs(list,lo+1,finish,currentYOffset);
    
    return list;
  }

  var visualize = function(array){
    // drawLine(40,50,40,85,0,"#222");
    array.forEach(function(el,i){
      var c = arrayMap[i]['color'];
      drawCircle(xCalc(i),yOffset,el,c);
      arrayMap[i]['lastY'] = yOffset;
    });

    paper.text(45,33,"PIVOT").attr({"font-family":"ETBembo, Palatino, Book Antiqua, Georgia, serif","font-size":"10px","font-weight":"800","fill":"#222"});
    qs(array,0,array.length-1,50,30,yOffset);
    array.forEach(function(el,i){
      // if arrayMap value is less than yOffset, draw a line
      if (arrayMap[i]['lastY'] < yOffset+100) {
        var c = arrayMap[i]['color'];
        drawLine(xCalc(i),arrayMap[i]['lastY']+10,xCalc(i),yOffset+90,lineYOffset,c);
        drawCircle(xCalc(i),yOffset+100,el,c);
      }
    });
    setTimeout(function(){
      $(".now-playing").hide();
      $("#array-links").show();
    }, setTime);
  }

  var setup = function(array){
    paper.clear();
    arrayMap = {};
    setTime = 100;
    yOffset = 50;
    lineYOffset = 50;
    currentColor = 0;
    array.forEach(function(el,i){
      // give each element its own color
      arrayMap[i] = {};
      arrayMap[i]["color"] = colorCycle();
    });
    arrayMap['pivot'] = {};
    moved = [];
  }
  
  
  $("a#random").click(function(){
    arr = [];
    randomArray(arr);
    setup(arr);
    visualize(arr);
    $("#array-links").hide();
    $("div#lbl-random").show();
    return false;
  });

  $("a#in-order").click(function(){
    arr = [];
    inOrderArray(arr);
    setup(arr);
    visualize(arr);
    $("#array-links").hide();
    $("div#lbl-in-order").show();
    return false;
  });

  $("a#reverse-sorted").click(function(){
    arr = [];
    backwardsArray(arr);
    setup(arr);
    visualize(arr);
    $("#array-links").hide();
    $("div#lbl-reverse-sorted").show();
    return false;
  });

  $("a#slower").click(function(){
    timing = 40;
    $("a.speed").removeClass("selected");
    $("a#slower").addClass("selected");
    return false;
  });

  $("a#faster").click(function(){
    timing = 10;
    $("a.speed").removeClass("selected");
    $("a#faster").addClass("selected");
    return false;
  });

  $("a#default").click(function(){
    timing = 25;
    $("a.speed").removeClass("selected");
    $("a#default").addClass("selected");
    return false;
  });

  $("a#toggle").click(function(){
    if ($("a#toggle").html() === "Dark") {
      $("body").css({"color":"#eee","background-color":"#100"});
      $("a#toggle").html("Light");
    } else {
      $("body").css({"color":"#222","background-color":"#fee"});
      $("a#toggle").html("Dark");
    }
    return false;
  });

});
