/*
 * chart.bar.js
 * histogram module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, chart, crossfilter, d3 */

chart.bar = (function () {
  'use strict';
  var barChart;

//------------------- BEGIN PUBLIC METHODS -------------------
// Begin Public method /barChart/
// Example   : chart.bar.barChart();
// Purpose   :
//   Sets up a bar graph
// Arguments : none
// Action    :
//   returns a bar chart with configurable attributes
// Returns   : chart(div)
// Throws    : none
  barChart = function(){

    if (!barChart.id){ barChart.id = 0; }

    var
    id = barChart.id++

    , panel_width = 250, panel_height = 100
    , margin = { top : 20, right : 50, bottom : 50, left : 80}
    , width = panel_width - margin.left - margin.right
    , height = panel_height - margin.top - margin.bottom

    , binWidth
    , bargap

    , xValue = function(d) { return d[0]; }
    , yValue = function(d) { return d[1]; }
    , xScale = d3.scale.linear()
    , yScale = d3.scale.linear()
    , xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")
                  .ticks(5)

    , yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .ticks(5)
    , brush = d3.svg.brush()
    , brushDirty
    , dimension
    , group
    , title
    , xlabel
    , ylabel
    ;


    function chart(selection){

      var
      numInterval = Math.floor((xScale.domain()[1] - xScale.domain()[0])/ binWidth),
      barwidth = Math.floor(width / numInterval) - bargap;

      selection.each(function(data){

        data = data.map(function(d, i) {
          return [ xValue.call({}, d, i), yValue.call({}, d, i) ];
        });

        var
          div, g, gbrush
        , div = d3.select(this)
        , g = div.select("g")
        ;

        yScale.domain( [0, d3.max(data, function(d, i){ return d[1]; })] );

        if (g.empty()){

          /* Set domain once with max of entire data set*/
          //yScale.domain( [0, group.top(1)[0].value] );

          /* Apply a title */
          if(title){
            div.append("div")
               .attr({
                  class : "chart-bar title"
                })
               .html(title);
          }

          // Apply a reset link adjacent to the title
          div//select(".chart-bar.title")
            .append("a")
            .attr({href : "javascript:chart_reset(" + id + ", 'bar')",
                   class : "chart-bar reset"
            })
            .text("Filter Reset")
            .style("display", "none");

          /* Set up the initial DOM with handle svg and g */
          g = div.append("svg")
                 .attr({
                    width : panel_width,
                    height : panel_height
                 })
                .append("g")
                .attr({ transform : "translate(" + margin.left + "," + margin.top + ")" });

          /* Add the axes */
           g.append("g")
              .attr({
                class : "chart-bar x axis",
                transform : "translate(0," + height + ")"
              })
              .call(xAxis)
              .append("text")
              .attr({
                class : "chart-bar axis-label",
                x : ( ( width + margin.left ) / 2  ),
                y : 40
              })
              .style("text-anchor", "end")
              .text(xlabel);

            g.append("g")
              .attr({
                class : "chart-bar y axis"
              })
              .call(yAxis)
              .append("text")
              .attr({
                class : "chart-bar axis-label",
                transform : "rotate(-90)",
                x : -( (height - margin.bottom ) / 2 ),
                y : - 50
              })
              .style("text-anchor", "end")
              .text(ylabel);

            /* generate clipPath element */
            g.append("clipPath")
              .attr({
                id : "clip-" + id
              })
              .append("rect")
              .attr({
                width : width,
                height : height
              });


          /* Add the bars */
          g.selectAll(".chart-bar .bar") //initially empty
                  .data(["chart-bar background", "chart-bar foreground"]) //store these in each __data__ attribute to be added
                .enter() //for each selection
                  .append("path")
                  .attr("class", function(d) { return d + " bar"; })
                  .datum(data);

          //assign the clip path to the foreground path
          g.selectAll(".chart-bar.foreground.bar")
           .attr("clip-path", "url(#clip-" + id + ")");

          /* append the brush */
          if (brush){
            gbrush = g.append("g").attr({class : "chart-bar brush"}).call(brush);
            gbrush.selectAll("rect").attr({ height : height });
            gbrush.selectAll(".resize").append("path").attr("d", resizePath);
          }
        }

        g.select(".y.axis").call(yAxis);

        g.selectAll(".chart-bar.bar")
          .datum(data)
          .attr("d", barPath);

        if (brush && brushDirty) {

          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".chart-bar.reset").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
              .attr("x", 0)
              .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
              .attr("x", xScale(extent[0]))
              .attr("width", xScale(extent[1]) - xScale(extent[0]));
          }
        }



      });

      function barPath(data_pts) {

        var path = [],
          i = -1,
          n = data_pts.length,
          d;
        while (++i < n) {
          d = data_pts[i];
//          console.log(d[1]);
          path.push("M", xScale(d[0]) - Math.floor(barwidth/2) , ",", height,
            "V", yScale(d[1]),
            "h", barwidth,
            "V", height,
            "z");
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
          x = e ? 1 : -1,
          y = height / 3;
        return "M" + (.5 * x) + "," + y
          + "A6,6 0 0 " + e + " " + (15.0 * x) + "," + (y + 6)
          + "V" + (2 * y - 6)
          + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
          + "Z"
          + "M" + (2.5 * x) + "," + (y + 8)
          + "V" + (2 * y - 8)
          + "M" + (4.5 * x) + "," + (y + 8)
          + "V" + (2 * y - 8)
          ;
      }

    }

    /* brush event binding */

    if(brush){


      brush.on("brushstart.chart", function(){
        //disable the "reset" {display : none}
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".chart-bar.reset")
          .style({
            display : null
          });
      });

      brush.on("brush.chart", function() {
        var g = d3.select(this.parentNode),
          extent; //this is <g class="brush">; parent node is <g>
          if (brush){
            extent = brush.extent();
          }else{
            extent = xScale.domain();
          }

        //This is where the crossfilter magic happens
        //reset the clip path extent
        g.select("#clip-" + id + " rect") //reselect the <rect> child of the <clipPath id="clip-n">
          .attr("x", xScale(extent[0])) //set the x val of the updated extent
          .attr("width", xScale(extent[1]) - xScale(extent[0])); // set the width of the updated extent

        dimension.filterRange(extent);//filter the data on the extent
      });

      brush.on("brushend.chart", function() {
        if (brush.empty()) {
          var div = d3.select(this.parentNode.parentNode.parentNode);
          div.select("a").style("display", "none");
          div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
          dimension.filterAll();
        }
      });

    }


    /* chart attribute setters */

    chart.xValue = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.yValue = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.xScale = function(_) {
      if (!arguments.length) return xScale;
      xScale = _;
      xAxis.scale(xScale);
      if (brush) { brush.x(xScale) };
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      yAxis.scale(yScale);
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {

      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
     brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.title = function(_) {
      if (!arguments.length) return title;
      title = _;
      return chart;
    };

    chart.panel_width = function(_) {
      if (!arguments.length) return panel_width;
      panel_width = _;
      width = panel_width - margin.left - margin.right;
      return chart;
    };

    chart.panel_height = function(_) {
      if (!arguments.length) return panel_height ;
      panel_height = _;
      height = panel_height - margin.top - margin.bottom;
      return chart;
    };

    chart.binWidth = function(_) {
      if (!arguments.length) return binWidth;
      binWidth = _;
      return chart;
    };

    chart.bargap = function(_) {
      if (!arguments.length) return bargap;
      bargap = _;
      return chart;
    };

    chart.xlabel = function(_) {
      if (!arguments.length) return xlabel;
      xlabel = _;
      return chart;
    };

    chart.ylabel = function(_) {
      if (!arguments.length) return ylabel;
      ylabel = _;
      return chart;
    };

    chart.brush = function(_) {
      if (!arguments.length) return brush;
      brush = _;
      return chart;
    };

    chart.id = function(_) {
      if (!arguments.length) return id;
      return chart;
    };

    if (brush){
      return d3.rebind(chart, brush, "on");
    }else{
      return chart;
    }


  }
//END PUBLIC method /barChart/

  return { barChart: barChart };
  //------------------- END PUBLIC METHODS ---------------------


}());

