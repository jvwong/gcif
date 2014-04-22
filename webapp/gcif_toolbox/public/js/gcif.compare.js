/*
 * gcif.compare.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.compare = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<h3 class="sub-header">Comparison</h3>' +

            '<div class="row">' +

                '<ul id="myTab" class="nav nav-tabs">' +
                    '<li class="active"><a href="#graphical" data-toggle="tab">Graphical</a></li>' +
                    '<li class=""><a href="#tabular" data-toggle="tab">Tablular</a></li>' +
                '</ul>' +

                '<div id="myTabContent" class="tab-content">' +
                    '<div class="tab-pane fade active in" id="graphical">' +
                        '<div class="gcif-compare chart col-lg-12"></div>' +
                    '</div>' +
                    '<div class="tab-pane fade" id="tabular">' +
                        '<div class="gcif-compare table col-lg-12 table-responsive">' +
                            '<table class="table table-bordered table-hover table-condensed">' +
                                '<thead>' +
                                    '<tr>' +
                                        '<th>Indicator (Core)</th>' +
                                        '<th>Value</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody>' +
                                    '<tr>' +
                                    '</tr>' +
                                '</tbody>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

            '</div>'
    }
    , stateMap = {
          $container                  : undefined
          , member_cities_db          : TAFFY()
          , performance_indicators_db : TAFFY()
          , car_data : TAFFY()
    }

    , jqueryMap = {}
    , d3Map= {}
    , setJqueryMap
    , setd3Map
    , render
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container;

        jqueryMap = {
            $container  : $container
          , $compare    : $container.find(".gcif-compare.chart")
        };
    };

    setd3Map = function(){
        d3Map = {
            d3compare : d3.select(".gcif-compare.chart")
        };
    };


    // BEGIN private method /render/
    render = function(){

       var
         margin = {top: 60, right: 10, bottom: 60, left: 10}
       , minwidth = 400, minheight = 300
       , width, height
       , svg
       , x = d3.scale.ordinal()
       , y = {}
       , dragging = {}
       , line = d3.svg.line()
       , axis = d3.svg.axis().orient("left")
       , background
       , foreground
       , dimensions
       ;

        /* sets the svg dimensions based upon the current browser window */
        function setsvgdim(){
            var
              verticalScaling = 0.70
            , horizontalScaling = 0.75
            ;

            width = d3.max([$( window ).width() * horizontalScaling - margin.left - margin.right, minwidth]);
            height = d3.max([$( window ).height() * verticalScaling - margin.top - margin.bottom, minheight]);
            x.rangePoints([0, width], 1);
        }

        /* renders the containing svg element */
        function rendersvg(){
            //clear out any residual svg elements
            d3.select("svg").remove();

            //draw a new svg element
            svg = d3Map.d3compare.append("svg")
                 .attr({
                    width: width + margin.left + margin.right
                  , height: height + margin.top + margin.bottom
                })
                .append("g")
                .attr({ class: "body"
                    , transform: "translate(" + margin.left + "," + margin.top + ")" })
            ;

            // debug - d3 selection for "g.body"
            console.log(svg);

        }

        function position(d) {
            var v = dragging[d];
            return v == null ? x(d) : v;
        }

        function transition(g) {
            return g.transition().duration(500);
        }

        // Returns the path for a given data point.
        function path(d) {
            return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
            var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
            extents = actives.map(function(p) { return y[p].brush.extent(); });
            foreground.style("display", function(d) {
                return actives.every(function(p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                }) ? null : "none";
            });
        }

        /* Update graph using new width and height (code below) */
        function resize() {
            setsvgdim();
            rendersvg();
            change();
        }

        /* listener for any change to graphics */
        function change() {
            d3.transition()
            .duration(750)
            .each(redraw);
        }

        /* load data from MongoDB */
        function loadMongodb() {

            // push member city data from mongodb collection "member_cities" in TAFFY DB
            d3.json("/member_cities/list", function(member_cities_data) {
                stateMap.member_cities_db.insert(member_cities_data);

                // push performance indicator data from mongodb collection "performance_indicators" in TAFFY DB
                d3.json("/performance_indicators/list", function(performance_indicators_data) {
                    stateMap.performance_indicators_db.insert(performance_indicators_data);

                    d3.csv("cars.csv", function(cars) {
                        stateMap.car_data.insert(cars);
                        redraw();
                    });
                });
            });

        }


        function redraw() {


            var cars = stateMap.car_data().get();

                console.log(cars[0]);

                // Extract the list of dimensions and create a scale for each.
                x.domain(dimensions = d3.keys(cars[0]).filter(function(key) {

                    return key != ("name") &&
                           key != ("___id") &&
                           key != ("___s") &&
                           (y[key] = d3.scale.linear()
                                     .domain(d3.extent(cars, function(p) { return +p[key]; }))
                                     .range([height, 0])
                           );
                }));

                console.log(dimensions);


                // Add grey background lines for context.
                background = svg.append("g")
                    .attr("class", "background")
                    .selectAll("path")
                    .data(cars)
                    .enter().append("path")
                    .attr("d", path);

                // Add blue foreground lines for focus.
                foreground = svg.append("g")
                    .attr("class", "foreground")
                    .selectAll("path")
                    .data(cars)
                    .enter().append("path")
                    .attr("d", path);

                // Add a group element for each dimension.
                var g = svg.selectAll(".dimension")
                    .data(dimensions)
                    .enter().append("g")
                    .attr("class", "dimension")
                    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
                    .call(
                        d3.behavior.drag()
                        .on("dragstart", function(d) {
                            dragging[d] = this.__origin__ = x(d);
                            background.attr("visibility", "hidden");
                        })
                        .on("drag", function(d) {
                            dragging[d] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
                            foreground.attr("d", path);
                            dimensions.sort(function(a, b) { return position(a) - position(b); });
                            x.domain(dimensions);
                            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                        })
                        .on("dragend", function(d) {
                            delete this.__origin__;
                            delete dragging[d];
                            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                            transition(foreground)
                            .attr("d", path);
                            background
                            .attr("d", path)
                            .transition()
                            .delay(500)
                            .duration(0)
                            .attr("visibility", null);
                        })
                    )
                    ;

                // Add an axis and title.
                g.append("g")
                    .attr("class", "axis")
                    .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
                    .append("svg:text")
                    .attr("text-anchor", "middle")
                    .attr("y", -9)
                    .text(String);

                // Add and store a brush for each axis.
                g.append("g")
                    .attr("class", "brush")
                    .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);


        }

        /* register event listeners */
        d3.select(window).on('resize', resize);

        /* instructions for drawing */
        setsvgdim();
        rendersvg();
        loadMongodb();

    };
    // END private method /render/

    //--------------------- END DOM METHODS ----------------------


    //------------------- BEGIN EVENT HANDLERS -------------------
    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------
    //------------------- BEGIN PUBLIC METHODS -------------------

    // Begin Public method /initModule/
    // Example   : chart.dash.initModule( $('.container') );
    // Purpose   :
    //   Adds a dash board and graphics to the shell element
    // Arguments :
    //   * $container(example: $('.container')).
    //     A jQuery selection representing a single DOM container
    // Action    :
    //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    // Returns   : none
    // Throws    : none
    initModule = function ( $container ) {

        //store container in stateMap
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();
        setd3Map();
        render();
    };
    // End PUBLIC method /initModule/

    return { initModule   : initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

