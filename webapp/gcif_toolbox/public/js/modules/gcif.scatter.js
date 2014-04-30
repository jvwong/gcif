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

        var _scatter = {};

        var
          _id = 0

        ,  _container = d3container

        , _svg
        , _div
        , _points = null

        , _margin = { top: 10, right: 10, bottom: 50, left: 60 }
        , _min_height = 200
        , _width
        , _height

        , _x = d3.scale.linear()
        , _y = d3.scale.linear()

        , _xAxis = d3.svg.axis()
        , _yAxis = d3.svg.axis()

        , _xLabel = "x axis"
        , _yLabel = "y axis"
        , _title = "Title"

        , _dimension = null
        , _xValue = function(d){ return d.x; }
        , _yValue = function(d){ return d.y; }

        , _quadtree = null
        , _brush = d3.svg.brush()
        , _brushDirty = false
        , _extent = [ [0,0], [0,0] ]

        , _radius = 2

        , _color
        , _data_db = TAFFY()
        , _data = []

        , _dispatch

        ;


        /* sets the svg dimensions based upon the current browser window */
        function setsvgdim(){
            var
              verticalScaling = 0.35
            , horizontalScaling = 0.35
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

            _xAxis.scale(_x.range([0, _width])).orient("bottom");

            return _svg.append("g")
                       .attr("class", "scatter x axis")
                       .attr("transform", "translate(0, " + _height + ")")
                       .call(_xAxis);
        }

        function renderYAxis(){

            _yAxis.scale(_y.range([_height, 0])).orient("left");

            return _svg.append("g")
                .attr("class", "scatter y axis")
                .call(_yAxis);
        }

        function renderLabels(){

            _svg.select(".x.axis")
                .append("text")
                .attr({
                    class : "scatter x label",
                    x : ( ( _width + _margin.left ) / 2 ),
                    y : 40
                })
                .style("text-anchor", "end")
                .text(_xLabel)
            ;

            _svg.select(".y.axis")
                .append("text")
                .attr({
                    class : "scatter y label",
                    transform : "rotate(-90)",
                    x : -( (_height - _margin.bottom ) / 2 ),
                    y : - 50
                })
                .style("text-anchor", "end")
                .text(_yLabel)
            ;

            _div.insert("div","svg")
                .attr("class", "title")
                .append("text")
                .text(_title)
            ;
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
                      cx : function(d){ return _x(d.x); }
                    , cy : function(d){ return _y(d.y); }
                    , r : _radius
                })
            ;

            /* update */
            points
                .attr({
                      cx : function(d){ return _x(d.x); }
                    , cy : function(d){ return _y(d.y); }
                })
            ;

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
            renderLabels();
            renderData();
        };

        _scatter.data = function(_){
            if (!arguments.length) return _data;
            _data = _.map(function(d) {

                console.log(d);
                return {x: _xValue.call({}, d), y: _yValue.call({}, d) };
            });
            console.log(_data);


            _data_db.insert(_);
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

        _scatter.xDomain = function (_) {
            if (!arguments.length){ return _x.domain(); }
            _x.domain(_);
            return _scatter;
        };

        _scatter.yDomain = function (_) {
            if (!arguments.length){ return _y.domain(); }
            _y.domain(_);
            return _scatter;
        };

        return _scatter;

    };//END /Parallel/

    return { Scatter   : Scatter };
    //------------------- END PUBLIC METHODS ---------------------
})();

