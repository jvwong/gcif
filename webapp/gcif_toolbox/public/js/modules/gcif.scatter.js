/*
 * gcif.scatter.js
 * parallel chart
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif*/

gcif.scatter = (function () {

    // Begin Public method /Scatter/
    // Example : chart.scatter.Scatter();
    // Purpose : Sets up a scatter plot
    // Arguments :
    //      * d3container - a d3 selection to insert a Scatter object
    //
    // Returns : Scatter chart object with configurable attributes
    // Throws : none

    var
    Scatter = function( d3container ) {

        var _configMap = {

            main_html : String() +

                '<div class="title"></div>' +
                '<form class="form" role="form">' +
                    '<div class="form-group gcif-correlate graphical menu">' +
                        '<label for="xVal-dropdown" class="col-sm-1 control-label">X Axis</label>' +
                        '<div class="col-sm-11">' +
                            '<select id="xVal-dropdown" class="form-control"></select>' +
                        '</div>' +
                        '<label for="yVal-dropdown" class="col-sm-1 control-label">Y Axis</label>' +
                        '<div class="col-sm-11">' +
                            '<select id="yVal-dropdown" class="form-control"></select>' +
                        '</div>' +
                    '</div>' +
                '</form>'

        };

        var _scatter = {};

        var
          _id = 0

        ,  _container = d3container

        , _svg
        , _div
        , _tooltip

        , _margin = { top: 10, right: 20, bottom: 50, left: 100 }
        , _min_height = 200
        , _width
        , _height

        , _x = d3.scale.linear()
        , _y = d3.scale.linear()
        , _r = d3.scale.linear()

        , _xValue = ""
        , _yValue = ""
        , _minXAxisVal = 50
        , _minYAxisVal = 50

        , _xAxis = d3.svg.axis()
        , _yAxis = d3.svg.axis()

        , _title = "Title"

        , _dimension = null
        , _quadtree = null
        , _brush = d3.svg.brush()
        , _brushDirty = false
        , _extent = [ [0,0], [0,0] ]


        , _radiusKey = ""
        , _fradmax = 8e-4
        , _point_radius = 4
        , _radius

        , _color
        , _datadb = TAFFY()
        , _data = []

        , _highlight = null
        , _hcolor = d3.scale.ordinal().domain("").range("steelblue")
        , _colors10 = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
            "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]

        , _dispatch

        ;


        function renderTooltip(){

            d3.select(".scatter.tooltip").remove();

            _tooltip = d3.select("body")
                .append("div")
                .attr("class", "scatter tooltip")
                .style("opacity", 0)
            ;

        }


        //filter out cities that don't have the correct
        function set_data(data){
            return data.filter(function(d){
                return d[_xValue] !== "" && d[_xValue] !== undefined && d[_yValue] !== "" && d[_yValue] !== undefined
            });
        }


        /* sets the svg dimensions based upon the current browser window */
        function setsvgdim(){
            var
              verticalScaling = 0.50
            , horizontalScaling = 0.50
            ;

            _height = d3.max([$( window ).height() * verticalScaling - _margin.top - _margin.bottom, _min_height]);
            _width  = d3.max([$( window ).height() * horizontalScaling - _margin.top - _margin.bottom, _min_height]);
        }


        /* renders the containing svg element */
        function rendersvg(container){

            //clear out any residual svg elements
            d3.select("svg").remove();
            d3.select(".title").remove();

            //draw a new svg element
            _svg = container.append("svg")
                             .attr({
                                width: _width + _margin.left + _margin.right
                              , height: _height + _margin.top + _margin.bottom
                            })
                            .append("g")
                            .attr({ class: "body"
                                  , transform: "translate(" + _margin.left + "," + _margin.top + ")" })
            ;

            _div = d3.select(_svg.node().parentNode.parentNode);
        }

        function renderXAxis(){

            _xAxis.scale(
                        _x.domain(
                            [0, Math.max(d3.max(_data, function(d){ return (d[_xValue]) * 1.1; }), _minXAxisVal)]
                          )
                          .range([0, _width])
                  )
                  .orient("bottom")
                  .ticks(5)
            ;

            return _svg.append("g")
                       .attr("class", "scatter x axis")
                       .attr("transform", "translate(0, " + _height + ")")
                       .call(_xAxis);
        }

        function renderYAxis(){

            _yAxis.scale(
                        _y.domain(
                            [0, Math.max(d3.max(_data, function(d){ return (d[_yValue]) * 1.1; }), _minYAxisVal)]
                        ).range([_height, 0])
                    )
                  .orient("left")
                  .ticks(5)
            ;

            return _svg.append("g")
                .attr("class", "scatter y axis")
                .call(_yAxis);
        }

        function setRadius(){

            //sets the domain upper limit to the max of the data points in the x and y direction
            _r.domain([1,
                       Math.max(d3.max(_data, function(d){ return (d[_xValue]) * 1.1; }),
                                d3.max(_data, function(d){ return (d[_yValue]) * 1.1; }))
                      ]
            )
            .range([_point_radius, _width / 30]);

            // This is log scale, if the key is "" or undefined don't even show them
            // also filter out the missing points
            _radius = function(d){

                // if the key isn't defined, don't even show them
                if(_radiusKey === "" || _radiusKey === undefined || d[_radiusKey] === "" || +d[_radiusKey] === 0 ){
                    return 1e-12;
                // Since this is log scale, if the value is "" or 0, then key isn't defined, don't even show them
                }
                return _point_radius;
//                return Math.max(_r(d[_radiusKey]) * _fradmax, _point_radius);
            }
        }

        function renderLabels(){

            _svg.select(".x.axis")
                .append("text")
                .attr({
                    class : "scatter x label",
                    x : ( _width  - 5 ),
                    y : 40
                })
                .style("text-anchor", "end")
                .text(_xValue)
            ;

            _svg.select(".y.axis")
                .append("text")
                .attr({
                    class : "scatter y label",
                    transform : "rotate(-90)",
                    x : -( _height - _margin.bottom ) / 2.5,
                    y : - 65
                })
                .style("text-anchor", "end")
                .text(_yValue)
            ;



            //try to wrap the labels
            //d3.selectAll("g.axis > text").call(gcif.util.wrap, 300);
        }


        function defineBodyClip() {
            _svg.append("clipPath")
                .attr("id", "clip-" + _id)
                .append("rect")
                .attr("width", _width)
                .attr("height", _height);
        }

        function renderData(){
            var
              g_data
            , points
            ;

            g_data = _svg.selectAll(".layer")
                .data(["background", "foreground"])
               .enter()
                .append("g")
                .attr("class", function(d) { return d + " scatter"; })
            ;

            //apply the clipPath as an attribute of the foreground
            _svg.selectAll(".foreground.scatter")
                .attr("clip-path", "url(#clip-" + _id + ")")
            ;

            points = g_data.selectAll(".point")
                .data(_data)
            ;

            /* Enter */
            points.enter()
                .append("circle")
                .attr("class", "scatter point")
                .attr({
                      //we're setting empty string values to 0
                      cx : function(d){
                          return _x(d[_xValue])
                      }
                    , cy : function(d){
                          return _y(d[_yValue])
                    }
                    , r : _radius
                    , fill: setColor
                })
            ;

            /* update */
            points
                .attr({
                      cx : function(d){ return _x(d[_xValue]) }
                    , cy : function(d){ return _y(d[_yValue]) }
                })
            ;

            //get rid of the empty or undefined data points
            points.filter(function(d){
                return d[_yValue] === "" ||
                    d[_yValue] === undefined ||
                    d[_xValue] === "" ||
                    d[_xValue] === undefined
            })
            .remove();


            /* update */
            points.exit().remove()
            ;

            _div.insert("div","svg")
                .attr("class", "title")
                .append("text")
                .text(_title + ": " + _data.length + " data points")
            ;

            // register listener for mouseover, mouseout, and click
            points.on("mouseover", function(d){
                    _tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    _tooltip.html(d["CityName"])
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                })
                .on("mouseout", function(d){
                    // get rid of the tooltip when mousing away
                    _tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
            })
            ;
            console.log();
        }


        function setColor(d){

            if (_highlight){
                if (typeof d === "number") {
                    return _hcolor(+d[_highlight]);
                }
                else
                {
                    return _hcolor(d[_highlight]);
                }
            } else {
                return "steelblue";
            }

        }


        /* set the highlight colour domain and range */
        function setHighColors(type){

            var h, t;
            switch (type)
            {
                case "Region":
                    t = _datadb({Region:{isUndefined:false}}).distinct("Region");
                    h = d3.scale.ordinal().domain( t ).range( _colors10.slice(0,t.length) );
                    break;

                case "Total city population":
                    t = [1e5, 5e5, 1e6, 2.5e6, 5e6];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                case "Land Area (Square Kilometers)":
                    t = [100, 300, 600, 1e3];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                case "Gross capital budget (USD)":
                    t = [1e6, 1e7, 1e8, 1e9];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                case "Country's GDP per capita (USD)":
                    t = [2.5e3, 5e3, 1e4, 2.5e4, 5e4];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                default:
                    t = [];
                    h = d3.scale.ordinal().domain(t).range("steelblue");
            }
            return h;
        }


        /* Expose configuration methods */
        _scatter.render = function() {
            setsvgdim();
            rendersvg(_container);
            defineBodyClip();
            renderXAxis();
            renderYAxis();
            setRadius();
            renderLabels();
            renderTooltip();
            renderData();
        };

        _scatter.radiusKey = function(_){
            if (!arguments.length) return _radiusKey;
            _radiusKey = _;
            return _scatter;
        };

        _scatter.data = function(_){
            if (!arguments.length) return _data;
            _datadb.insert(_);
            _data = set_data(_);
            return _scatter;
        };

        _scatter.xValue = function(_){
            if (!arguments.length) return _xValue;
            _xValue = _;
            return _scatter;
        };

        _scatter.yValue = function(_){
            if (!arguments.length) return _yValue;
            _yValue = _;
            return _scatter;
        };

        _scatter.dispatch = function(_){
            if (!arguments.length) return _dispatch;
            _dispatch = _;

            //register the dispatch listeners.
            _dispatch.on("highlight", function(data){
                _highlight = data;
                _hcolor = setHighColors(data);
                _dispatch.legend_change(_highlight, _hcolor);
            });
            return _scatter;
        };

        _scatter.color = function(_){
            if (!arguments.length) return _color;
            _color = _;
            return _scatter;
        };

        _scatter.title = function(_){
            if (!arguments.length) return _title;
            _title = _;
            return _scatter;
        };

        return _scatter;

    };//END /Parallel/

    return { Scatter   : Scatter };
    //------------------- END PUBLIC METHODS ---------------------
})();

