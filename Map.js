const percentile = (arr, val) => {
  let count = 0;
  arr.forEach(v => {
    if (v < val) {
      count++;
    } else if (v == val) {
      count += 0.5;
    }
  });
  return 100 * count / arr.length;
}

//Co-ordiante markers for cities
var markers = [{
  long: -67.0060,
  lat: 36.7128,
  name: "Dow Jones",
  id: "DJ"
}, // New York
{
  long: 7.1276,
  lat: 48.5072,
  name: "FTSE-100",
  id: "LN"
}, // London
{
  long: 85.2088,
  lat: 22.6139,
  name: "Nifty-50",
  id: "ND"
}, // New Delhi
{
  long: 146.650,
  lat: 31.6764,
  name: "Nikkei-225",
  id: "TY"
}, // Tokyo
{
  long: 121.0596,
  lat: 18.5429,
  name: "Shenzen Stock Exchange",
  id: "CH"
}, // Shenzen
{
  long: 12.5417,
  lat: 43.3769,
  name: "EuroStoxx 600",
  id: "ZR"
}, // Zurich
];

// Initialize tooltip
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .html("<p>This is a SVG inside a tooltip:</p><div id='tipDiv'></div>");

//MouseOver 1 Intent
let mouseOver_1 = function (d) {
  d3.selectAll(".Country")
    .transition()
    .duration(200)
    .style("opacity", .5)
  d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "black")
  tip.html(d.properties.name + " : " + d.inflation);
  tip.show();
}

//MouseLeave 1 Intent
let mouseLeave_1 = function (d) {
  d3.selectAll(".Country")
    .transition()
    .duration(200)
    .style("opacity", .8)
  d3.select(this)
    .transition()
    .duration(200)
    .style("stroke", "transparent")
  tip.hide();
}

//onClick 1 Intent
let onClick_1 = function (d) {
  var boxVal = null
  boxes.forEach(function (b) {
    if (b.checked == true) {
      boxVal = b.id
    }
  });
  if (boxVal) {
    getTwoSubCharts(d, boxVal);
  } else {
    tip.html("<svg id='subPlot'></svg>");
    tip.show();
    getSubChart(d);
  }
}

//onClick 2 Intent
let onClick_2 = function (d) {
  tip.html("<svg id='subPlot'></svg>");
  tip.show();
  getSubChart2(d);
}

var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

//Process data fetched for monthly index
function processInflationData(inf_data) {
  var xy = [];
  xy.push({ x: 1, y: inf_data.January })
  xy.push({ x: 2, y: inf_data.February })
  xy.push({ x: 3, y: inf_data.March })
  xy.push({ x: 4, y: inf_data.April })
  xy.push({ x: 5, y: inf_data.May })
  xy.push({ x: 6, y: inf_data.June })
  xy.push({ x: 7, y: inf_data.July })
  xy.push({ x: 8, y: inf_data.August })
  xy.push({ x: 9, y: inf_data.September })
  xy.push({ x: 10, y: inf_data.October })
  xy.push({ x: 11, y: inf_data.November })
  xy.push({ x: 12, y: inf_data.December })
  return xy;
}

//SubChart Function for Inflation Data
function getSubChart(d) {
  var monthlyInflation;
  d3.queue()
    .defer(d3.csv, "./data/inflation_monthly_" + year + ".csv", function (dataMonthly) {
      if (dataMonthly.code == d.id) {
        monthlyInflation = dataMonthly;
      }
    })
    .await(ready);

  function ready() {
    if (monthlyInflation) {
      var data = processInflationData(monthlyInflation);

      //The Sub SVG
      // set the dimensions and margins of the graph
      var margin = { top: 10, right: 30, bottom: 20, left: 50 }
      var width = 200,
        height = 120
      // append the svg object to the body of the page
      d3.select('#subPlot').html('');

      var subSVG = d3.select("#subPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


      // Add X axis --> it is a date format
      var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.x; }))
        .range([0, width]);
      subSVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(function (d, i) {
          return month[i];
        }));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return parseFloat(d.y); }))
        .range([height, 0]);

      subSVG.append("text")
        .attr("x", (width / 2))
        .attr("y", (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text(d.properties.name + " (" + year + ")");

      subSVG.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("fill", "#5D6971")
        .text("Inflation Index");

      // This allows to find the closest X index of the mouse:
      var bisect = d3.bisector(function (d) { return d.x; }).left;

      // Create the circle that travels along the curve of chart
      var focus = subSVG
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

      // Create the text that travels along the curve of chart
      var focusText = subSVG
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

      // Add the line
      subSVG
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function (d) { return x(d.x) })
          .y(function (d) { return y(d.y) })
        )

      // Create a rect on top of the svg area: this rectangle recovers mouse position
      subSVG
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity", 1)
      }

      function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(data, x0, 1);
        selectedData = data[i]
        focus
          .attr("cx", x(selectedData.x))
          .attr("cy", y(selectedData.y))
        focusText
          .html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
          .attr("x", x(selectedData.x) + 15)
          .attr("y", y(selectedData.y))
      }
      function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
      }
    } else {
      tip.html("<p>Monthly Data is not available.</p>");
      tip.show();
    }
  }
};

function processIndexData(indexValue) {
  var newData = indexValue.filter(function (d) {
    if (parseInt(new Date(d.Date).getFullYear()) == parseInt(year)) {
      return d;
    }
  })
  var xy = [];
  for (i = 0; i < newData.length; i++) {
    xy.push({ x: (new Date(newData[i].Date).getMonth()), y: (parseFloat(newData[i].High.replace(/,/g, '')) + parseFloat(newData[i].Low.replace(/,/g, ''))) / 2 })
  }
  return xy;
}

//SubChart Function for Index Data 
function getSubChart2(d) {
  d3.queue()
    .defer(d3.csv, "./data/" + d.id + ".csv")
    .await(ready);

  function ready(error, indexValue) {
    if (indexValue) {

      var data = processIndexData(indexValue);

      //The Sub SVG
      // set the dimensions and margins of the graph
      var margin = { top: 10, right: 30, bottom: 30, left: 60 }
      var width = 200,
        height = 120
      // append the svg object to the body of the page
      d3.select('#subPlot').html('');

      var subSVG = d3.select("#subPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      subSVG.append("text")
        .attr("x", (width / 2))
        .attr("y", (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text(d.name + " (" + year + ")");

      // Add X axis --> it is a date format
      var x = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.x; }))
        .range([0, width]);
      subSVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(function (d, i) {
          return month[i];
        }));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return parseFloat(d.y); }))
        .range([height, 0]);

      subSVG.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("fill", "#5D6971")
        .text("Index Value");

      // This allows to find the closest X index of the mouse:
      var bisect = d3.bisector(function (d) { return d.x; }).left;

      // Create the circle that travels along the curve of chart
      var focus = subSVG
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

      // Create the text that travels along the curve of chart
      var focusText = subSVG
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

      // Add the line
      subSVG
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function (d) { return x(d.x) })
          .y(function (d) { return y(d.y) })
        )

      // Create a rect on top of the svg area: this rectangle recovers mouse position
      subSVG
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity", 1)
      }

      function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(data, x0, 1);
        selectedData = data[i]
        focus
          .attr("cx", x(selectedData.x))
          .attr("cy", y(selectedData.y))
        focusText
          .html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
          .attr("x", x(selectedData.x) + 15)
          .attr("y", y(selectedData.y))
      }
      function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
      }
    } else {
      tip.html("<p>Monthly Data is not available.</p>");
      tip.show();
    }
  }
};

function getTwoSubCharts(d, boxVal) {
  var monthlyInflation
  d3.queue()
    .defer(d3.csv, "./data/" + boxVal + ".csv")
    .defer(d3.csv, "./data/inflation_monthly_" + year + ".csv", function (dataMonthly) {
      if (dataMonthly.code == d.id) {
        monthlyInflation = dataMonthly;
      }
    })
    .await(ready);

  function ready(error, indexData) {
    if (indexData) {
      var indData = processIndexData(indexData);
      if (monthlyInflation) {
        var infData = processInflationData(monthlyInflation);
        //The Sub SVG
        // set the dimensions and margins of the graph
        var margin0 = { top: 10, right: 30, bottom: 30, left: 60 }
        var width0 = 300,
          height0 = 200

        d3.select("#mixPlot1" + year).html('');
        d3.select("#mixPlot2" + year).html('');

        var subSVG0 = d3.select("#mixPlot1" + year)
          .append("svg")
          .attr("width", width0 + margin0.left + margin0.right)
          .attr("height", height0 + margin0.top + margin0.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin0.left + "," + margin0.top + ")");

        subSVG0.append("text")
          .attr("x", (width0 / 2))
          .attr("y", (margin0.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("text-decoration", "underline")
          .text(boxVal + " (" + year + ")");

        // Add X axis --> it is a date format
        var x0 = d3.scaleTime()
          .domain(d3.extent(indData, function (d) { return d.x; }))
          .range([0, width0]);
        subSVG0.append("g")
          .attr("transform", "translate(0," + height0 + ")")
          .call(d3.axisBottom(x0).tickFormat(function (d, i) {
            return month[i];
          }));

        // Add Y axis
        var y0 = d3.scaleLinear()
          .domain(d3.extent(indData, function (d) { return parseFloat(d.y); }))
          .range([height0, 0]);

        subSVG0.append("g")
          .call(d3.axisLeft(y0))
          .append("text")
          .attr("class", "axis-title")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .attr("fill", "#5D6971")
          .text("Index Value");

        // This allows to find the closest X index of the mouse:
        var bisect0 = d3.bisector(function (d) { return d.x; }).left;

        // Create the circle that travels along the curve of chart
        var focus0 = subSVG0
          .append('g')
          .append('circle')
          .style("fill", "none")
          .attr("stroke", "black")
          .attr('r', 8.5)
          .style("opacity", 0)

        // Create the text that travels along the curve of chart
        var focusText0 = subSVG0
          .append('g')
          .append('text')
          .style("opacity", 0)
          .attr("text-anchor", "left")
          .attr("alignment-baseline", "middle")

        // Add the line
        subSVG0
          .append("path")
          .datum(indData)
          .attr("fill", "none")
          .attr("stroke", "orange")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(function (d) { return x0(d.x) })
            .y(function (d) { return y0(d.y) })
          )

        // Create a rect on top of the svg area: this rectangle recovers mouse position
        subSVG0
          .append('rect')
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr('width', width0)
          .attr('height', height0)
          .on('mouseover', mouseover0)
          .on('mousemove', mousemove0)
          .on('mouseout', mouseout0);


        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover0() {
          focus0.style("opacity", 1)
          focusText0.style("opacity", 1)
        }

        function mousemove0() {
          // recover coordinate we need
          var x0dash = x0.invert(d3.mouse(this)[0]);
          var i = bisect0(indData, x0dash, 1);
          selectedData = indData[i]
          focus0
            .attr("cx", x0(selectedData.x))
            .attr("cy", y0(selectedData.y))
          focusText0
            .html(selectedData.y)
            .attr("x", x0(selectedData.x) + 15)
            .attr("y", y0(selectedData.y))
        }
        function mouseout0() {
          focus0.style("opacity", 0)
          focusText0.style("opacity", 0)
        }

        //The Sub SVG
        // set the dimensions and margins of the graph
        var margin1 = { top: 10, right: 30, bottom: 30, left: 60 }
        var width1 = 300,
          height1 = 200

        var subSVG1 = d3.select("#mixPlot2" + year)
          .append("svg")
          .attr("width", width1 + margin1.left + margin1.right)
          .attr("height", height1 + margin1.top + margin1.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin1.left + "," + margin1.top + ")");

        subSVG1.append("text")
          .attr("x", (width1 / 2))
          .attr("y", (margin1.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("text-decoration", "underline")
          .text(d.properties.name + " (" + year + ")");

        // Add X axis --> it is a date format
        var x1 = d3.scaleTime()
          .domain(d3.extent(infData, function (d) { return d.x; }))
          .range([0, width1]);
        subSVG1.append("g")
          .attr("transform", "translate(0," + height1 + ")")
          .call(d3.axisBottom(x1).tickFormat(function (d, i) {
            return month[i];
          }));

        // Add Y axis
        var y1 = d3.scaleLinear()
          .domain(d3.extent(infData, function (d) { return parseFloat(d.y); }))
          .range([height1, 0]);

        subSVG1.append("g")
          .call(d3.axisLeft(y1))
          .append("text")
          .attr("class", "axis-title")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .attr("fill", "#5D6971")
          .text("Index Value");

        // This allows to find the closest X index of the mouse:
        var bisect1 = d3.bisector(function (d) { return d.x; }).left;

        // Create the circle that travels along the curve of chart
        var focus1 = subSVG1
          .append('g')
          .append('circle')
          .style("fill", "none")
          .attr("stroke", "black")
          .attr('r', 8.5)
          .style("opacity", 0)

        // Create the text that travels along the curve of chart
        var focusText1 = subSVG1
          .append('g')
          .append('text')
          .style("opacity", 0)
          .attr("text-anchor", "left")
          .attr("alignment-baseline", "middle")

        // Add the line
        subSVG1
          .append("path")
          .datum(infData)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(function (d) { return x1(d.x) })
            .y(function (d) { return y1(d.y) })
          )

        // Create a rect on top of the svg area: this rectangle recovers mouse position
        subSVG1
          .append('rect')
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr('width', width1)
          .attr('height', height1)
          .on('mouseover', mouseover1)
          .on('mousemove', mousemove1)
          .on('mouseout', mouseout1);


        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover1() {
          focus1.style("opacity", 1)
          focusText1.style("opacity", 1)
        }

        function mousemove1() {
          // recover coordinate we need
          var x1dash = x1.invert(d3.mouse(this)[0]);
          var i = bisect1(infData, x1dash, 1);
          selectedData = infData[i]
          focus1
            .attr("cx", x1(selectedData.x))
            .attr("cy", y1(selectedData.y))
          focusText1
            .html(selectedData.y)
            .attr("x", x1(selectedData.x) + 15)
            .attr("y", y1(selectedData.y))
        }

        function mouseout1() {
          focus1.style("opacity", 0)
          focusText1.style("opacity", 0)
        }
      } else {
        tip.html("<p>Data is not available.</p>");
        tip.show();
      }
    }
  }
}

// Load external data and boot
function graph() {
  // The Main Svg
  var svg = d3.select("#mainPlot" + year),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  // Map and projection
  var path = d3.geoPath();
  var projection = d3.geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  // Data and color scale
  var data = d3.map();
  svg.call(tip);
  //Declarations
  var data_process = new Array;

  d3.queue()
    .defer(d3.json, "world.geojson")
    .defer(d3.csv, "./data/inflation_annual_" + year + ".csv", function (d) {
      if (d.rate) {
        data_process.push(parseFloat(d.rate));
      }
      data.set(d.code, d.rate);
    })
    .await(ready);

  function ready(error, topo) {

    var flag1 = false,
      flag2 = false
    var lowLimit
    var upLimit
    for (i = Math.min.apply(Math, data_process); i <= Math.max.apply(Math, data_process); i += 0.01) {
      if (flag1 == false && (percentile(data_process, i) > 15)) {
        flag1 = true
        lowLimit = i
      }
      if (flag2 == false && (percentile(data_process, i) > 80)) {
        flag2 = true
        upLimit = i
      }
    }

    var domainArray = []
    for (i = lowLimit; i <= upLimit; i += (lowLimit + upLimit) / 8) {
      domainArray.push(i);
    }
    console.log(domainArray);

    //Set ColorScale
    var colorScale = d3.scaleThreshold()
      .domain(domainArray)
      .range(d3.schemeRdBu[domainArray.length + 1]);

    console.log(colorScale(1))
    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.inflation = data.get(d.id) || 0;
        return colorScale(d.inflation);
      })
      .attr("value", function (d) {
        return data.get(d.id);
      })
      .style("stroke", "transparent")
      .attr("class", function (d) { return "Country" })
      .style("opacity", .8)
      .call(tip)
      .on("mouseover", mouseOver_1)
      .on("mouseleave", mouseLeave_1)
      .on("click", onClick_1);

    //Mark Cities
    svg.selectAll(".m")
      .data(markers)
      .enter()
      .append("circle")
      .attr('r', 4)
      .attr("transform", (d) => {
        let p = projection([d.long, d.lat]);
        return `translate(${p[0] - 10}, ${p[1] - 10})`;
      })
      .call(tip)
      .on("mouseover", function (d) { tip.html(d.name); tip.show(); })
      .on("mouseleave", function (d) { tip.hide(); })
      .on("click", onClick_2);
  }
}

//Functionality for CheckBoxes
let boxes = document.querySelectorAll("input[type=checkbox]");
boxes.forEach(b => b.addEventListener("change", tick));
function tick(e) {
  let state = e.target.checked; // save state of changed checkbox
  boxes.forEach(b => b.checked = false); // clear all checkboxes
  e.target.checked = state; // restore state of changed checkbox
  d3.select("#mixPlot1" + year).html('');
  d3.select("#mixPlot2" + year).html('');
}

function openSubTab(evt, value) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(value).style.display = "block";
  evt.currentTarget.className += " active";
  year = value
  graph();
}

function openTab(evt, value) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(value).style.display = "block";
  evt.currentTarget.className += " active";
}