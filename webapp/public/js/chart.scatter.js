/*
 * chart.scatter.js
 * scatter plot module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, chart, crossfilter, d3 */

var charts = (function () {
  'use strict';
  var scatterChart;

//------------------- BEGIN PUBLIC METHODS -------------------
// Begin Public method /scatterChart/
// Example   : chart.scatter.scatterChart();
// Purpose   :
//   Sets up a scatter plot
// Arguments : none
// Action    :
//   returns scatterChart with configurable attributes
// Returns   : chart(div)
// Throws    : none
scatterChart = function() {

  var _chart = {};

  var
    _width = 500, _height = 500,
    _margins = {top: 30, left: 30, right: 30, bottom: 30},
    _x, _y,
    _data = [],
    _colors = d3.scale.category10(),
    _svg,
    _bodyG,
    _symbolTypes = d3.scale.ordinal()
                    .range(["circle",
                            "cross",
                            "diamond",
                            "square",
                            "triangle-down",
                            "triangle-up"]);


  _chart.data = function (d) {
    if (!arguments.length) return _data;
    _data.push(d);
    return _chart;
  };

  _chart.width = function (w) {
    if (!arguments.length) return _width;
    _width = w;
    return _chart;
  };

  _chart.height = function (h) {
    if (!arguments.length) return _height;
    _height = h;
    return _chart;
  };

  _chart.margins = function (m) {
    if (!arguments.length) return _margins;
    _margins = m;
    return _chart;
  };

  _chart.colors = function (c) {
    if (!arguments.length) return _colors;
    _colors = c;
    return _chart;
  };

  _chart.x = function (x) {
    if (!arguments.length) return _x;
    _x = x;
    return _chart;
  };

  _chart.y = function (y) {
    if (!arguments.length) return _y;
    _y = y;
    return _chart;
  };

  return _chart;
};

//END PUBLIC method /scatterChart/

  return { scatterChart: scatterChart };
  //------------------- END PUBLIC METHODS ---------------------
})();

