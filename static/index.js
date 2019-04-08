w = 3000 ;
h = 1250 ;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;

var countries = []
var master_data = []
var json_data //default 2017 data
var json_data_2016
var json_data_2015

var view_year = 2017;

d3.json("https://raw.githubusercontent.com/AhnafK/sessalgd3/master/data/2017.json", function(data){
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

var fill = function(){
	console.log("fills")
	var countries = d3.select("#map-holder")
					  .select("svg")
					  .select("g")
					  .selectAll("path")
   	 				  .attr("fill", function(d,i){
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
  clear()
})
button_2016.addEventListener('click', function(){
  //console.log("red")
  view_year = 2016
  fill()
  clear()
})
button_2017.addEventListener('click', function(){
  //console.log("red")
  view_year = 2017
  fill()
  clear()
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
// add zoom functionality
//.call(zoom)
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
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
    })
    .on("mouseout", function(d, i) {
      d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
    })
    // add an onclick action to zoom into clicked country
    .on("click", function(d, i) {
      var add = true
      var country_name = d.properties["admin"]
      var i
      for (i = 0; i < master_data.length; i++){
        if(country_name.search(master_data[i]["Country"]) != -1){
          add = false
          master_data.splice(i,1)
        }
      }
      if (add){
        getData(country_name)
      }
      update()
      //d3.selectAll(".country").classed("country-on", false);
      //d3.select(this).classed("country-on", true);
      //boxZoom(path.bounds(d), path.centroid(d), 20);
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
      d3.select(this).style("display", "block");
    })
    .on("mouseout", function(d, i) {
      d3.select(this).style("display", "none");
    })
    ///*   // add an onlcick action to zoom into clicked country
    .on("click", function(d, i) {
      var add = true
      var country_name = d.properties["admin"]
      var i
      for (i = 0; i < master_data.length; i++){
        if(country_name.search(master_data[i]["Country"]) != -1){
          //if (master_data[i]["Country"] == country_name){
          add = false
          master_data.splice(i,1)
          console.log("false")
        }
      }
      if (add){
        getData(country_name)
      }
      update()
      update2()
      //d3.selectAll(".country").classed("country-on", false);
      //d3.select("#country" + d.properties.iso_a3).classed("country-on", true);
      //boxZoom(path.bounds(d), path.centroid(d), 20);
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
    //initiateZoom();
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
      .domain([7, 0]);

    var yAxis = d3.axisBottom()
      .scale(y)
      .ticks(5);

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
var width = 500
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

var getData = function(name){
  for(var i = 0; i < json_data.length; i++){
    if(master_data.length > 5){
      master_data.splice(0,1)
    }
    if(name.search(json_data[i]["Country"]) != -1){
      master_data[master_data.length] = json_data[i]
      console.log(master_data)
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

var clear = function(){
  if(master_data.length > 1){
    master_data.splice(0, master_data.length)
  }
  update()
}
