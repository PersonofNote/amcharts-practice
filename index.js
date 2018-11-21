/**
  *TODO:
  *Implement draggable slider that uses the frame data to increment.
    *Should also be able to drag the slider to a value, and affect the frame value.
  *Import and parse JSON data
  *Format the data so that it works for your needs.
    *This means:
      Figuring out how to break the CSV into rows based on year. Probably using array.match?
  *Consider setting a "zoom" value so that it doesn't zoom out every time you press play. Would be cool for observing contentious areas through a diplomatic lens.
    *Also if you do this, disable pan at zoom level 1.
    *If you don't do this, disable both pan and zoom, it's currently very distracting.
 Notes on plugging in the correct data: "firstYear should be mapdata[0][0].year." This will allow it to be modified in either direction by the loaded data.
 Also remember that you'll have to change a few things. It's likely that you won't be using the country codes, for example, and you'll have to account for the
 events being strings instead of 0/0.5/1. That should be relatively easy to account for.

*/


var rawData;
var year = 1776;
var mapData = [];
var currentYear = 2018;

function init(callback) {
AmCharts.loadFile( "./embassy-data-sorted-1.csv", {}, function( response ) {
   var data = AmCharts.parseCSV( response, {
    "useColumnNames": true,
  } );
  rawData = data;
  runMap();
});
}

init();


//This is incredibly inelegant, but it works.
function runMap() {
  //console.log("Length is " + mapData.length);

var el = document.getElementById("play-button");
el.addEventListener("click", togglePlay, false);

/**
 * Create the map
 */

function groupData(){
  //So. If the array created here is longer than 1, push to ANOTHER array, right? Array of arrays.
  for (var i = 0; i < rawData.length; i++) {
    var array = [];
    //console.log(rawData[i].year);
    var e = (i+year);
    //console.log(e);
    for (var j = 0; j < rawData.length; j++) {
    if (rawData[j].year == e) {
      array.push(rawData[j]);
      //console.log(rawData[j]);
    }
  }
    //console.log(array);
      //var matches = mapData.filter(data => (data.year === e));
      //console.log(matches);
      if (e < currentYear){
        mapData.push(array);   
      }
  }
 console.log(mapData.length);
}
groupData();

var map = AmCharts.makeChart( "mapdiv", {
  "type": "map",
  "theme": "black",

/* IMPORTANT: This would attempt to push all the data at once to the map. Which is useful, but not here.
  /*
  "dataLoader": {
    "url": mapData
  },
  */
  
  "dataProvider": {
    "map": "worldLow",
    "images": []
  },

  "zoomControl": {
    "zoomControlEnabled": false,
    "panControlEnabled": false
  }
} );


function fadeIn() {
   if (alpha < 1*value) {
        alpha++;
    }
}

function drawBubbles() {
  //Update this for loop to reflect the matches found.
  for (var i = 0; i < mapData[frame].length; i++) {
    var dataItem = mapData[frame][i];
    //console.log("frame is "+ frame)
    console.log("Length of frame:" + mapData[frame].length);
    //console.log("i is " + i);
    console.log("Data item = " + dataItem + i);
    var img = map.dataProvider.images
    //console.log(img[0]);
    //Need to change this so it reflects 0 for closed, 1 for embassy, and 0.5 for legation.
    var value;
    if (dataItem.event == "establish legation"){
      value = 0.5;
    }else if (dataItem.event == "elevate to embassy" || dataItem.event === "establish embassy"){
      value = 1;
    }else if (dataItem.event == 'closure') value = 0;
    var year = dataItem.year;
    var lat = dataItem.lat;
    var long = dataItem.lon;
    var title = dataItem.country;
    var match = img.filter(image => (image.title === title));
    console.log(match.length + " matches found for " + title);
    //console.log("Found at " + img.indexOf(match[0]));
    console.log("Value of " + title + " = " + value);
    //console.log("Lat = " + lat + "Long = " + long);
    var type;
    var r = 65*value;
    var g = 65*value;
    var b = 237*value;
    var alpha=1*value; //Update this to make a fadein.
    //First time, push to array.
    //Will this actually just work for the whole thing?
    //It almost does. The thing is that you need to reset all the values at restart.

    if ( match.length < 1) {

      img.push({
            type: "circle",
            width: 10,
            height: 10,
            color: `rgba(51, 102, 255, ${alpha})`,
            longitude: long,
            latitude:  lat,
            title: title,
            value: value
        });
      //console.log(img[i]);
    } else {
        //If already in array, update the visibility based on whether there is an embassy, a legation, or nothing.
        //How to find??
        console.log(dataItem.country);
        var index = img.findIndex(item => item.title === dataItem.country);
        console.log("index = " + index); 
          if(value > 0) {
            //Consider comparing the current value to the previous value, and playing an animation on change, to draw attention to it.
              img[index].type="circle";
              img[index].color = `rgba(51, 102, 255, ${alpha})`
          }else if (value == 0) {
          //var exists = img.filter(image => (image.title === title))
            //if (exists.length>0){
            img[index].type="";
            img[index].color = `rgba(51, 102, 255, ${alpha})`;
            }
          }
      //console.log(img[frame]);    
  }
}

/**
 * Animation code
 */

 function makeTimeline() {
  var timeline = document.getElementById('timeline');
  for (var i=0;i<mapData.length;i++){
    tick = document.createElement("div");
    tick.className = "tick"; 
    tick.id = i+startYear;
    tick.innerHTML=i+startYear;
    tick.onclick = setYear;
    timeline.appendChild(tick);
  }
 }

 function setYear() {
  //Right now giving it a static value works,
  //but passing it this.id causes it to add the id onto
  //the end of the year and start over for some reason.
 togglePlay();
  frame = this.id - startYear;
  //updateFramedisplay();
 // console.log(this.id);
  //console.log("frame = " + frame);
 }

 function updateFramedisplay() {
  document.getElementById( 'frame' ).innerHTML = frame + startYear;
 }


// initilize variables
var frame = 0;
var startYear = 1776;
var interval;
var speed = 200; // time between frames in milliseconds
var playing=false;
//What does this do...
var lastFrame = mapData[frame-1];

// function to start stop
function togglePlay() {
  if ( playing==true ) {
    playing=false;
    // stop playing (clear interval)
    clearInterval( interval );
  }
  else if (playing == false) {
    //Currently the "toggle" part of this isn't really working, but why?
    // start playing
    interval = setInterval(function () {
      frame++;
      //console.log("Current frame = " + frame);
      //This puts a focus on the year's timeline. How to update it?
      //document.getElementsByClassName('tick')[frame].focus()
      
      // check if maybe we need to wrap to frame 0
      //if ( frame >= mapData.length ) {
         //Need to clear all the data values here so you can start over nicely.
      if(frame >= mapData.length){
        //resetValues();
        
        frame = 0;
       map.dataProvider.images = [];
      }
     
     //This should allow and maintain zoom values. Right now, it maintains zoom level but not latlong
     /*
    map.dataProvider.zoomLevel = map.zoomLevel();
    map.dataProvider.zoomLatitude = map.zoomLatitude();
    map.dataProvider.zoomLongitude = map.zoomLongitude();
    */
      
      // set data to the chart for the current frame
     drawBubbles();
     map.validateData();
      // set frame indicator
      updateFramedisplay();
      
    }, speed);
    playing=true;
  }
//console.log(playing);
}

//makeTimeline();
}
