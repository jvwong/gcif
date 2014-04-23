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
          , indicators                : undefined
          , cities                    : undefined
          , member_cities_db          : TAFFY()
          , performance_indicators_db : TAFFY()
          , abundant_themes_db        : TAFFY()
          , car_data                  : TAFFY()
//          , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE",
//                                         "BELO HORIZONTE","BUENOS AIRES","GOIANIA","PEORIA","SAANICH","SANTA ANA",
//                                         "DALLAS","LVIV","SASKATOON","TUGUEGARAO","CALI","HAMILTON","ILE-DE-FRANCE",
//                                         "HAIPHONG","LISBON","MILAN","OLONGAPO","CANCUN","DURBAN","MOMBASA","TRUJILLO",
//                                         "OSHAWA","SAO BERNARDO DO CAMPO","SURREY","KRYVYI RIH","PUERTO PRINCESA",
//                                         "MAKATI","PORT OF SPAIN","KABANKALAN","MUNOZ","RIGA","SAO PAULO","TACURONG",
//                                         "ZAMBOANGA","BALANGA","BEIT SAHOUR","ISTANBUL","CLARINGTON","MEDICINE HAT",
//                                         "VAUGHAN","LAOAG","GUELPH","KING COUNTY","SANA'A","BOGOR"]
          , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE",
                                         "BELO HORIZONTE","BUENOS AIRES","GOIANIA","PEORIA","SAANICH","SANTA ANA",]
          , top5Themes                : ["education","finance","health","safety","urban planning"]
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
         margin = {top: 25, right: 5, bottom: 150, left: 5}
       , minwidth = 1000, minheight = 300
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
       , tooltip
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

        function wrap(text, width) {
            text.each(function() {
                var text = d3.select(this)
                , words = text.text().split(/\s+/).reverse()
                , word
                , line = []
                , lineNumber = 0
                , lineHeight = 1.1 // ems
                , y = text.attr("y")
                , dy = parseFloat(text.attr("dy"))
                , tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
                ;

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }

            });
        }

        /* load data from MongoDB */
        function loadMongodb() {

            // push member city data from mongodb collection "member_cities" in TAFFY DB
            d3.json("/member_cities/list", function(member_cities_data) {
                stateMap.member_cities_db.insert(member_cities_data);

                //console.log(stateMap.member_cities_db({"Percentage of female school-aged population enrolled in schools": {">": 100}}).get());
                //cache the cities in the stateMap
                stateMap.cities = stateMap.member_cities_db(function(){
                    //only include the top 50 cities by indicator count
                    return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
                }).get();

                // push performance indicator data from mongodb collection "performance_indicators" in TAFFY DB
                d3.json("/performance_indicators/list", function(performance_indicators_data) {
                    stateMap.performance_indicators_db.insert(performance_indicators_data);

                    //cache the performance indicators in the stateMap
                    stateMap.indicators = stateMap.performance_indicators_db(function(){
                        //only include indicators in top 5 themes
                        return stateMap.top5Themes.indexOf(this["theme"]) >= 0;
                    }).get();

                    d3.json("assets/data/abundant_themes.json", function(abundant_themes) {
                        stateMap.abundant_themes_db.insert(abundant_themes);
                        redraw();
                    });

                });
            });

        }




        function redraw() {

            //load the cached data -- this can be interactive so leave be
            var ilist = stateMap.indicators.map(function(idoc){
                    return idoc["indicator"]
            })

            , cities = stateMap.cities
            ;

            // Extract the list of dimensions and create a scale for each.
            x.domain(dimensions = d3.keys(cities[0]).filter(function(header) {

                return header !== ("_id") &&

                       // filter the headers here based on ilist defined above
                       (ilist.indexOf(header) >=0)  &&

                       // initialize the y scale (y)
                       // y is a global dictionary {} of y-scales for each column (header)
                       (y[header] = d3.scale.linear()
                                 .domain(d3.extent(cities, function(document) {
                                                                            return +document[header];
                                                                       })
                                 )
                                 .range([height, 0])
                       );
            }));


            // Add grey background lines for context.
            background = svg.append("g")
                .attr("class", "background")
                .selectAll("path")
                .data(cities)
                .enter().append("path")
                .attr("d", path);

            // Add blue foreground lines for focus.
            foreground = svg.append("g")
                .attr("class", "foreground")
                .selectAll("path")
                .data(cities)
                .enter().append("path")
                .attr("d", path);

            // Add a group element for each dimension.
            var g = svg.selectAll(".dimension")
                .data(dimensions)
               .enter()
                .append("g")
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

                        transition(foreground).attr("d", path);

                        background.attr("d", path)
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
                .append("text")
                .attr("text-anchor", "middle")
                .attr("y", height)
                .attr("dy", "2em")
                .text(String)
            ;

            //try to wrap the labels
            d3.selectAll("g.axis > text").call(wrap, 0.80 * (x.range()[1] - x.range()[0]));

            // Add and store a brush for each axis.
            g.append("g")
                .attr("class", "brush")
                .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
                .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);

            // register listener for mouseover
            d3.selectAll(".foreground > path")
                .on("mouseover", function(d){

                })
                .on("click", function(d){
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(d["CityName"])
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                    foreground.attr("visibility", "hidden");
                    d3.select(this).attr("visibility", "");
                })
                .on("mouseout", function(d){
                    foreground.attr("visibility", "");
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })

                ;

        }

        /* register event listeners */
        d3.select(window).on('resize', resize);

        tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

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

