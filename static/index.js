w = 3000 ;
h = 1250 ;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;

var countries = []

var country_names = []
var master_data = []
var compare = []

var json_data //default 2017 data
var json_data_2016
var json_data_2015

var current_data
var view_year = 2017;

var year = function(){
  var data_set
  if (view_year == 2017){
    data_set = json_data
  }
  if (view_year == 2016){
    data_set = json_data_2016
  }
  if (view_year == 2015){
    data_set = json_data_2015
  }
  return data_set
}

d3.json("https://raw.githubusercontent.com/AhnafK/sessalgd3/master/data/2017.json", function(data){
  current_data = json_data
  json_data = data
})
d3.json("https://raw.githubusercontent.com/AhnafK/sessalgd3/master/data/2016.json", function(data){
  json_data_2016 = data
})
d3.json("https://raw.githubusercontent.com/AhnafK/sessalgd3/master/data/2015.json", function(data){
  json_data_2015 = data
})

var button_2015 = document.getElementById("2015")
var button_2016 = document.getElementById("2016")
var button_2017 = document.getElementById("2017")
//console.log(button_2016)

var ranktf = false

var rank = d3.select(".rank")
             .append("svg")
             .attr("width", 1000)
             .attr("height", 70);

var findRanking = function(country_name){
  var main_data = year()
  for(var i = 0; i < main_data.length; i++){
    var current = main_data[i]["Country"]
    console.log(country_name.search(current));
    if(country_name.search(current) != -1){
       return "Rank " + main_data[i]["Happiness_Rank"]
    }
  }
  return "No Rank"
}

var fill = function(){
	console.log("fills")
	var countries = d3.select("#map-holder")
					  .select("svg")
					  .select("g")
					  .selectAll("path")
   	 				  .attr("fill", function(d,i){
		var data_set = year()
      var country_name = d.properties["admin"]
      for(var i = 0; i < data_set.length; i++){
        if(country_name.search(data_set[i]["Country"]) != -1){
          var target = data_set[i]["Happiness_Score"] - 2.6
          //console.log("Happiness Score:")
          //console.log(target)
          target = (target / 5)
          //console.log("target / 8 val:")
          //console.log(target)
          color = target * (358)
          //console.log("color : ")
          //console.log(color)
          if (color < 179){
            return "rgb(244, " + (66 + color) + ", 66)"
          }
          else{
            console.log(244 - (color - 178))
            return "rgb(" + (244 - (color - 178)) + ",244, 66)"
          }
        }
      }
      return "white"
    })
}

button_2015.addEventListener('click', function(){
  //console.log("red")
  view_year = 2015
  fill()
  getData()
  update()
  //clear()
})
button_2016.addEventListener('click', function(){
  //console.log("red")
  view_year = 2016
  fill()
  getData()
  update()
  //clear()
})
button_2017.addEventListener('click', function(){
  //console.log("red")
  view_year = 2017
  fill()
  getData()
  update()
  //clear()
})


// DEFINE FUNCTIONS/OBJECTS
// Define map projection
var projection = d3
.geoMercator()//Equirectangular()
.center([0, 60]) // set centre to further North as we are cropping more off bottom of map
.scale([w / (5 * Math.PI)]) // scale to fit group width
.translate([w/5 , h/5]) // ensure centred in group
;

// Define map path
var path = d3
.geoPath()
.projection(projection);


function getTextBox(selection) {
  selection
  .each(function(d) {
    d.bbox = this
    .getBBox();
  })
  ;
}



// on window resize
$(window).resize(function() {
  // Resize SVG
  svg
  .attr("width", $("#map-holder").width())
  .attr("height", $("#map-holder").height())
  ;
  // initiateZoom();
});

// create an SVG
var svg = d3
.select("#map-holder")
.append("svg")
// set to the same size as the "map-holder" div
.attr("width", $("#map-holder").width())
.attr("height", $("#map-holder").height())
;
// get map data
d3.json(
  "https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json",
  function(json) {
    //Bind data and create one path per GeoJSON feature
    countriesGroup = svg.append("g").attr("id", "map");
    // add a background rectangle
    countriesGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h);

    // draw a path for each feature/country
    countries = countriesGroup
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", function(d, i) {
      return "country" + d.properties.iso_a3;
    })
    .attr("class", "country")
    .attr("stroke-width", 1)
    .attr("stroke", "black")
    .attr("fill", function(d,i){
      var country_name = d.properties["admin"]
      for(var i = 0; i < json_data.length; i++){
        if(country_name.search(json_data[i]["Country"]) != -1){
          var target = json_data[i]["Happiness_Score"] - 2.6
          //console.log("Happiness Score:")
          //console.log(target)
          target = (target / 5)
          //console.log("target / 8 val:")
          //console.log(target)
          color = target * (358)
          //console.log("color : ")
          //console.log(color)
          if (color < 179){
            return "rgb(244, " + (66 + color) + ", 66)"
          }
          else{
            //console.log(244 - (color - 178))
            return "rgb(" + (244 - (color - 178)) + ",244, 66)"
          }
        }
      }
      return "white"
    })
    // add a mouseover action to show name label for feature/country
    .on("mouseover", function(d, i) {
      if (!ranktf){
        var country_name = d.properties["admin"]
        var ranking = findRanking(country_name)
        console.log(ranking);
        ///*
        rank.append("text")
            .text(country_name + ": " + ranking)
            .attr("font-size", "45px")
            .attr("fill", "black")
            .attr("x", "0")
            .attr("y", "50")
        ranktf = true
            //*/
      }
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
    })
    .on("mouseout", function(d, i) {
      rank.selectAll("text")
      .remove()
      .exit()
      ranktf = false
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
    })
    // add an onclick action to zoom into clicked country
    .on("click", function(d, i) {
      var add = true
      var country_name = d.properties["admin"]
      var i
      for (i = 0; i < country_names.length; i++){
        if(country_name.search(country_names[i]) != -1){
          add = false
          country_names.splice(i,1)
        }
      }
      if (add){
        country_names[country_names.length] = country_name
      }
      getData()
      console.log(master_data)
      update()
      update2()
      update3()
    });
    // Add a label group to each feature/country. This will contain the country name and a background rectangle
    // Use CSS to have class "countryLabel" initially hidden
    countryLabels = countriesGroup
    .selectAll("g")
    .data(json.features)
    .enter()
    .append("g")
    .attr("class", "countryLabel")
    .attr("id", function(d) {
      return "countryLabel" + d.properties.iso_a3;
    })
    .attr("transform", function(d) {
      return (
        "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
      );
    })
    // add mouseover functionality to the label
    .on("mouseover", function(d, i) {
      if (!ranktf){
        var country_name = d.properties["admin"]
        var ranking = findRanking(country_name)
        console.log(ranking);
        ///*
        rank.append("text")
            .text(d.properties["admin"] + ": " + ranking)
            .attr("font-size", "45px")
            .attr("fill", "black")
            .attr("x", "0")
            .attr("y", "50")
        ranktf = true
            //*/
      }
      d3.select(this).style("display", "block");
    })
    .on("mouseout", function(d, i) {
      rank.selectAll("text")
      .remove()
      .exit()
      ranktf = false
      d3.select(this).style("display", "none");
    })
    ///*   // add an onlcick action to zoom into clicked country
    .on("click", function(d, i) {
      var add = true
      var country_name = d.properties["admin"]
      var i
      for (i = 0; i < country_names.length; i++){
        if(country_name.search(country_names[i]) != -1){
          add = false
          country_names.splice(i,1)
        }
      }
      if (add){
        country_names[country_names.length] = country_name
      }
      getData()
      console.log(country_names)
      update()
      update2()
      update3()
    });
    // add the text to the label group showing country name
    countryLabels
    .append("text")
    .attr("class", "countryName")
    .style("text-anchor", "middle")
    .attr("dx", 0)
    .attr("dy", 0)
    .text(function(d) {
      return d.properties.name;
    })
    .call(getTextBox);
    // add a background rectangle the same size as the text
    countryLabels
    .insert("rect", "text")
    .attr("class", "countryLabelBg")
    .attr("transform", function(d) {
      return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
    })
    .attr("width", function(d) {
      return d.bbox.width + 4;
    })
    .attr("height", function(d) {
      return d.bbox.height;
    });
  }
);

var w2 = 200, h2 = 50;

    var key = d3.select(".legend")
      .append("svg")
      .attr("width", w2)
      .attr("height", h2);

    var legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f44141")
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#f4f441")
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#41f441")
      .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", w2)
      .attr("height", h2 - 30)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,10)");

    var y = d3.scaleLinear()
      .range([200, 0])
      .domain([8, 2]);

    var yAxis = d3.axisBottom()
      .scale(y)
      .ticks(6);

    key.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,30)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("axis title");

var margin = {top: 20, right: 20, bottom: 95, left: 80};
var width = 1000
var height = 300

var graph = d3.select(".chart")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xChart = d3.scaleBand()
.range([0, width]);

var yChart = d3.scaleLinear()
.range([height, 0]);

var xAxis = d3.axisBottom(xChart);
var yAxis = d3.axisLeft(yChart);

graph.append("g")
.attr("class", "y axis")
.call(yAxis)

//bottom axis
graph.append("g")
.attr("class", "xAxis")
.attr("transform", "translate(0," + height + ")")
.call(xAxis)
.selectAll("text")
.style("text-anchor", "end")
.attr("dx", "-.8em")
.attr("dy", ".15em")
.attr("transform", function(d){
  return "rotate(-65)";
});

//add labels
graph
.append("text")
.attr("transform", "translate(-35," +  (height+margin.bottom)/2 + ") rotate(-90)")
.text("Happiness Score");

graph
.append("text")
.attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom - 5) + ")")
.text("Country");

var getData = function(){
  master_data = []
  var data_set = year()
  for (var j = 0; j< country_names.length; j++){
    for(var i = 0; i < data_set.length; i++){
      if(master_data.length > 10){
        master_data.splice(0,1)
      }
      if(country_names[j].search(data_set[i]["Country"]) != -1){
        console.log(j,i)
        master_data[master_data.length] = data_set[i]
        console.log(master_data)
      }
    }
  }
}

var update = function(){
  xChart.domain(master_data.map(function(d){return d.Country}))
  yChart.domain( [0, d3.max(master_data, function(d){ return +d["Happiness_Score"] })] );

  var barWidth = width/master_data.length;
  var bars = graph.selectAll(".bar")
  .remove()
  .exit()
  .data(master_data)
  bars.enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", function(d, i){ return i * barWidth + 1 })
  .attr("y", function(d){ return yChart( d["Happiness_Score"]) })
  .attr("height", function(d){ return height - yChart(d["Happiness_Score"]) })
  .attr("width", barWidth - 1)
  .attr("fill", "rgb(251,180,174)");

  graph.select('.y')
  .call(yAxis)
  //bottom axis
  graph.select('.xAxis')
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  //.attr("dx", "-.8em")
  //.attr("dy", ".15em")
  .attr("transform", function(d){
    return "rotate(-65)";
  })
}


var w2 = 300,                        //width
h2 = 300,                            //height
r2 = 100,                            //radius
//color2 = d3.scale.category20c();     //builtin range of colors
data2 = [{"label":"one", "value":20}, 
        {"label":"two", "value":50}, 
        {"label":"three", "value":30}];

var vis = d3.select("chart2")
    .append("svg:svg")              //create the SVG element inside the <body>
    .data([data2])                   //associate our data with the document
        .attr("width", w2)           //set the width and height of our visualization (these will be attributes of the <svg> tag
        .attr("height", h2)
    .append("svg:g")                //make a group to hold our pie chart
        .attr("transform", "translate(" + r2 + "," + r2 + ")")    //move the center of the pie chart from 0, 0 to radius, radius
var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
    .outerRadius(r2);
var pie = d3.layout.pie()           //this will create arc data for us given a list of values
    .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array
var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
    .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
    .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
        .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
            .attr("class", "slice");    //allow us to style things in the slices (like text)
    arcs.append("svg:path")
  //          .attr("fill", function(d, i) { return color2(i); } ) //set the color for each slice to be chosen from the color function defined above
            .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
    arcs.append("svg:text")                                     //add a label to each slice
            .attr("transform", function(d) {                    //set the label's origin to the center of the arc
            //we have to make sure to set these before calling arc.centroid
            d.innerRadius = 0;
            d.outerRadius = r2;
            return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
        })
        .attr("text-anchor", "middle")                          //center the text on it's origin
        .text(function(d, i) { return data2[i].label; });   