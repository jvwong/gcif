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

        , _margin = { top: 10, right: 80, bottom: 50, left: 60 }
        , _min_height = 200
        , _width
        , _height

        , _x = d3.scale.linear()
        , _y = d3.scale.linear()
        , _r = d3.scale.log()

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
        , _rscaling = 0.0000015
        , _fradmax = 0.05
        , _point_radius = 2
        , _radius = function(d){
                return _point_radius;
//                return _radiusKey === "" || _radiusKey === undefined ? _point_radius: (d[_radiusKey]) * _rscaling;
            }

        , _color
        , _data_db = TAFFY()
        , _data = []

        , _dispatch

        ;


        //filter out cities that don't have the correct
        function set_data(){
            _data = _data_db().get();
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
                  .orient("bottom");

            return _svg.append("g")
                       .attr("class", "scatter x axis")
                       .attr("transform", "translate(0, " + _height + ")")
                       .call(_xAxis);
        }

        function renderYAxis(){

            _yAxis.scale(
                        _y.domain(
                            [0, Math.max(d3.max(_data, function(d){ return (d[_yValue]) * 1.2; }), _minYAxisVal)]
                        ).range([_height, 0])
                    )
                  .orient("left");

            return _svg.append("g")
                .attr("class", "scatter y axis")
                .call(_yAxis);
        }

        function setRadius(){

            console.log(_xValue);
            console.log( d3.max(_data, function(d){ console.log(d[_xValue]); return d[_xValue]; } ) );

//            console.log(_yValue);
//            console.log( d3.max(_data, function(d){ return d[_yValue]; } ) );
//
//            console.log(_data.length);

            //sets the domain upper limit to the max of the data points in the x and y direction
            _r.domain([0,
                           Math.max(
                                 d3.max(_data, function(d){ return d[_xValue]; } )
                               , d3.max(_data, function(d){ return d[_yValue]; } )
                           )
                      ]
            )
            .range([0, _width * _fradmax]);
        }

        function renderLabels(){

            _svg.select(".x.axis")
                .append("text")
                .attr({
                    class : "scatter x label",
                    x : ( ( _width + _margin.left ) / 1 ),
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
                    x : -( (_height - _margin.bottom ) / 2.5 ),
                    y : - 50
                })
                .style("text-anchor", "end")
                .text(_yValue)
            ;

            _div.insert("div","svg")
                .attr("class", "title")
                .append("text")
                .text(_title + ": " + _data.length + " data points")
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
            , points;

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
                          return d[_xValue] === "" || d[_xValue] === undefined ? 0 : _x(d[_xValue])
                      }
                    , cy : function(d){
                          return d[_yValue] === "" || d[_yValue] === undefined ? 0 : _y(d[_yValue])
                    }
                    , r : _radius
                })
            ;

            /* update */
            points
                .attr({
                      cx : function(d){ return d[_xValue] === "" || d[_xValue] === undefined ? 0 : _x(d[_xValue]) }
                    , cy : function(d){ return d[_yValue] === "" || d[_yValue] === undefined ? 0 : _y(d[_yValue]) }
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
            renderData();
        };

        _scatter.radiusKey = function(_){
            if (!arguments.length) return _radiusKey;
            _radiusKey = _;
            return _scatter;
        };

        _scatter.data = function(_){
            if (!arguments.length) return _data;
            _data_db.insert(_);
            set_data();
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

