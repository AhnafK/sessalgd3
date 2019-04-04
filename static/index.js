w = 3000 ;
    h = 1250 ;
    // variables for catching min and max zoom factors
    var minZoom;
    var maxZoom;

    var countries = []
    var master_data = []
    var json_data
    d3.json("https://raw.githubusercontent.com/AhnafK/sessalgd3/master/data/2017.json", function(data){
      json_data = data
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

    // =!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!

    /*
    // Create function to apply zoom to countriesGroup
    function zoomed() {
      t = d3
        .event
        .transform
      ;
      countriesGroup
        .attr("transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")")
      ;
    }

    // Define map zoom behaviour
    var zoom = d3
      .zoom()
      .on("zoom", zoomed)
    ;
    */
    function getTextBox(selection) {
      selection
        .each(function(d) {
          d.bbox = this
            .getBBox();
          })
      ;
    }

    /*
    // Function that calculates zoom/pan limits and sets zoom to default value
    function initiateZoom() {
      // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
      minZoom = Math.max($("#map-holder").width() / w, $("#map-holder").height() / h);
      // set max zoom to a suitable factor of this value
      maxZoom = 20 * minZoom;
      // set extent of zoom to chosen values
      // set translate extent so that panning can't cause map to move out of viewport
      zoom
        .scaleExtent([minZoom, maxZoom])
        .translateExtent([[0, 0], [w, h]])
      ;
      // define X and Y offset for centre of map to be shown in centre of holder
      midX = ($("#map-holder").width() - minZoom * w) / 2;
      midY = ($("#map-holder").height() - minZoom * h) / 2;
      // change zoom transform to min zoom and centre offsets
      svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
    }

    // zoom to show a bounding box, with optional additional padding as percentage of box size
    function boxZoom(box, centroid, paddingPerc) {
      minXY = box[0];
      maxXY = box[1];
      // find size of map area defined
      zoomWidth = Math.abs(minXY[0] - maxXY[0]);
      zoomHeight = Math.abs(minXY[1] - maxXY[1]);
      // find midpoint of map area defined
      zoomMidX = centroid[0];
      zoomMidY = centroid[1];
      // increase map area to include padding
      zoomWidth = zoomWidth * (1 + paddingPerc / 100);
      zoomHeight = zoomHeight * (1 + paddingPerc / 100);
      // find scale required for area to fill svg
      maxXscale = $("svg").width() / zoomWidth;
      maxYscale = $("svg").height() / zoomHeight;
      zoomScale = Math.min(maxXscale, maxYscale);
      // handle some edge cases
      // limit to max zoom (handles tiny countries)
      zoomScale = Math.min(zoomScale, maxZoom);
      // limit to min zoom (handles large countries and countries that span the date line)
      zoomScale = Math.max(zoomScale, minZoom);
      // Find screen pixel equivalent once scaled
      offsetX = zoomScale * zoomMidX;
      offsetY = zoomScale * zoomMidY;
      // Find offset to centre, making sure no gap at left or top of holder
      dleft = Math.min(0, $("svg").width() / 2 - offsetX);
      dtop = Math.min(0, $("svg").height() / 2 - offsetY);
      // Make sure no gap at bottom or right of holder
      dleft = Math.max($("svg").width() - w * zoomScale, dleft);
      dtop = Math.max($("svg").height() - h * zoomScale, dtop);
      // set zoom
      svg
        .transition()
        .duration(500)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
        );
    }
    */


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
          .attr("stroke-width", 10)
          .attr("stroke", "#ff0000")
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
    
