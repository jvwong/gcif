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
                        '<form class="form" role="form">' +
                            '<div class="form-group gcif-compare menu">' +
                                '<label for="category-dropdown" class="col-sm-2 control-label">Theme</label>' +
                                '<div class="col-sm-10">' +
                                    '<select id="theme-dropdown" class="form-control"></select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<div class="btn-group gcif-compare reset col-sm-offset-2 col-sm-10">' +
                                    '<button type="button" class="btn btn-default" id="clear-highlights">' +
                                        '<span class="glyphicon glyphicon-pencil"></span> Clear Highlights' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="clear-brushes">' +
                                        '<span class="glyphicon glyphicon-pencil"></span> Clear Brushes' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="isolate-brushed">' +
                                        '<span class="glyphicon glyphicon-pencil"></span> Isolate Brushed' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="refresh">' +
                                        '<span class="glyphicon glyphicon-refresh"></span> Refresh' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div class="gcif-compare chart col-lg-12"></div>' +
                    '</div>' +
                    '<div class="tab-pane fade" id="tabular">' +
                        '<div class="gcif-compare table col-lg-12">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
    }
    , stateMap = {
            $container                : undefined

          , cities                    : undefined
          , indicators                : undefined
          , theme                     : undefined

          , member_cities_db          : TAFFY()
          , performance_indicators_db : TAFFY()
          , abundant_themes_db        : TAFFY()
          , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE",
                                         "BELO HORIZONTE","BUENOS AIRES","GOIANIA","PEORIA","SAANICH","SANTA ANA",
                                         "DALLAS","LVIV","SASKATOON","TUGUEGARAO","CALI","HAMILTON","ILE-DE-FRANCE",
                                         "HAIPHONG","LISBON","MILAN","OLONGAPO","CANCUN","DURBAN","MOMBASA","TRUJILLO",
                                         "OSHAWA","SAO BERNARDO DO CAMPO","SURREY","KRYVYI RIH","PUERTO PRINCESA",
                                         "MAKATI","PORT OF SPAIN","KABANKALAN","MUNOZ","RIGA","SAO PAULO","TACURONG",
                                         "ZAMBOANGA","BALANGA","BEIT SAHOUR","ISTANBUL","CLARINGTON","MEDICINE HAT",
                                         "VAUGHAN","LAOAG","GUELPH","KING COUNTY","SANA'A","BOGOR"]
//          , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE"]
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
              d3compare           : d3.select(".gcif-compare.chart")

            , d3clear_highlights  : d3.select(".gcif-compare.reset button#clear-highlights")
            , d3clear_brushes     : d3.select(".gcif-compare.reset button#clear-brushes")
            , d3isolate_brushed   : d3.select(".gcif-compare.reset button#isolate-brushed")
            , d3refresh           : d3.select(".gcif-compare.reset button#refresh")

            , d3theme_dropdown    : d3.select(".gcif-compare.menu select#theme-dropdown")
            , d3table             : d3.select(".gcif-compare.table")
        };
    };


    // BEGIN private method /render/
    render = function(){

        var
        parallelChart
        , list
        ;

        /************************************ TABLE OBJECT ************************************************************/

        function List( d3container ) {

            var _list = {};

            var   _data = []
                , _metadata = []

                , _container = d3container
                , _table
                , _thead
                , _tbody
                ;


            function renderHead(table) {

                _thead = table.append("thead").append("tr");
                _thead.append("th")
                     .attr("class", "header")
                     .text("City")
                ;

                _thead.selectAll(".field")
                     .data(_metadata)
                    .enter()
                     .append("th")
                     .attr("class", "header")
                     .text(function(d){
                        return d;
                    })
                ;
            }

            function renderBody(table) {

                var row
                , rowEnter
                ;

                _tbody = table.append("tbody");


                //append a <tr class="city") for each city
                row = _tbody.selectAll(".datarow")
                            .data(_data, function(d) {
                                    return d["CityUniqueID"];
                            })
                            ;

                rowEnter = row.enter()
                              .append("tr")
                              .attr("class", "datarow")
                ;

                rowEnter.append("td")
                         .attr("class", "indicator")
                         .text(function(d){ return d["CityName"]})
                ;

                _metadata.forEach(function(p){
                    rowEnter.append("td")
                            .attr("class", "indicator")
                            .text(function(d){
                                return d[p]
                            })
                    ;
                });

                row.exit().remove();

            }

            // PUBLIC methods
             _list.render = function () {
                if (!_table) {
                    _table = _container.append("table")
                                       .attr("class", "table table-hover table-striped")
                    ;
                } else {
                    _table.html("");
                }
                renderHead(_table);
                renderBody(_table);
            };

            _list.data = function(_) {
                if (!arguments.length) return _data;
                _data = _;
                return _list;
            };

            _list.metadata = function(_) {
                if (!arguments.length) return _metadata;
                _metadata = _;
                return _list;
            };

            return _list;
        }


        /************************************ PARALLEL OBJECT ***********************************************************/

        function Parallel( d3container ) {

            var _parallel = {};

            var
              _container = d3container
            , _svg

            , _margin = { top: 25, right: 5, bottom: 150, left: 5 }
            , _min_width = 300
            , _min_height = 200
            , _width
            , _height
            , _x = d3.scale.ordinal()
            , _y = {}

            , _metadata = []
            , _data = []

            , _dragging = {}
            , _line = d3.svg.line()
            , _axis = d3.svg.axis().orient("left")
            , _background
            , _foreground
            , _point

            , _tooltip = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0)
            ;


            /* sets the svg dimensions based upon the current browser window */
            function setsvgdim(){
                var
                  verticalScaling = 0.70
                , horizontalScaling = 0.75
                ;

                _width = d3.max([$( window ).width() * horizontalScaling - _margin.left - _margin.right, _min_width]);
                _height = d3.max([$( window ).height() * verticalScaling - _margin.top - _margin.bottom, _min_height]);
                _x.rangePoints([0, _width], 1);
            }

            /* renders the containing svg element */
            function rendersvg(container){

                //clear out any residual svg elements
                d3.select("svg").remove();

                //draw a new svg element
                return container.append("svg")
                                 .attr({
                                    width: _width + _margin.left + _margin.right
                                  , height: _height + _margin.top + _margin.bottom
                                })
                                .append("g")
                                .attr({ class: "body"
                                    , transform: "translate(" + _margin.left + "," + _margin.top + ")" })
                ;
            }

            function renderAxes(){
                _x.domain( _metadata );
               // y is a global dictionary {} of y-scales for each column (header)
               _metadata.forEach( function(header){
                   _y[header] = d3.scale.linear()
                                        .domain([0, d3.max(_data, function(document) { return +document[header];})])
                                        .range([_height, 0])
                   ;
               });
            }

            function position(d) {
                var v = _dragging[d];
                return v == null ? _x(d) : v;
            }


            function transition(g) {
                return g.transition().duration(500);
            }

            // Returns the path for a given data point.
            function path(d) {
                return _line(_metadata.map(function(p) {
                        return [position(p), _y[p](d[p])]; })
                );
            }

            // Handles a brush event, toggling the display of foreground lines.
            function brush() {
                 //actives is the set. possibly empty, of indicators/axes that are currently being brushed
                var
                  actives = _metadata.filter( function(indicator) {
                      return !_y[indicator].brush.empty();
                  })
                , extents = actives.map(function(indicator) { return _y[indicator].brush.extent(); });

                //*********** hack alert -- return list of cities for listeners (table)
                stateMap.cities.length = 0;

                //loop through each city's path and set the path visibility to null OR none
                _foreground.style("display", function(data) {

                    //loop over each brushed indicator
                    var isValid = actives.every(function(indicator, index) {
                        //loop  over each indicator axis extent (if any)
                        return extents[index][0] <= data[indicator] && data[indicator] <= extents[index][1];
                    });

                    if (isValid){
                        //*********** hack alert -- return list of cities for listeners (table)
                        stateMap.cities.push(data);
                        return null;
                    }
                    return "none";

                });

                //*********** hack alert -- how to expose this object to brush events? Publish?
                list.render();

                _point.style("display", function(data){
                    //In this case, loops through each city along any axis and asks:
                    // Is the indicator for this city within the brush for those being brushed?
                    return actives.every(function(indicator, indindex) {
                        return extents[indindex][0] <= data[indicator] && data[indicator] <= extents[indindex][1];
                    }) ? null : "none";
                });

            }

            function renderBody(){

                var
                  g
                , points
                ;

                // Add grey background lines for context.
                _background = _svg.append("g")
                                .attr("class", "background")
                                .selectAll("path")
                                .data(_data)
                                .enter().append("path")
                                .attr("d", path);

                // Add blue foreground lines for focus.
                _foreground = _svg.append("g")
                                .attr("class", "foreground")
                                .selectAll("path")
                                .data(_data)
                                .enter()
                                .append("path")
                                .attr("class", "unhighlight")
                                .attr("d", path);

                // Add a group element for each dimension.
                g = _svg.selectAll(".dimension")
                            .data(_metadata)
                           .enter()
                            .append("g")
                            .attr("class", "dimension")
                            .attr("transform", function(d) { return "translate(" + _x(d) + ")"; })
                            .call(
                                d3.behavior.drag()
                                .on("dragstart", function(d) {
                                    _dragging[d] = this.__origin__ = _x(d);
                                    _background.attr("visibility", "hidden");
                                })
                                .on("drag", function(d) {
                                    _dragging[d] = Math.min(_width, Math.max(0, this.__origin__ += d3.event.dx));
                                    _foreground.attr("d", path);
                                    _metadata.sort(function(a, b) { return position(a) - position(b); });
                                    _x.domain(_metadata);
                                    g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                                })
                                .on("dragend", function(d) {
                                    delete this.__origin__;
                                    delete _dragging[d];
                                    transition(d3.select(this)).attr("transform", "translate(" + _x(d) + ")");

                                    transition(_foreground).attr("d", path);

                                    _background.attr("d", path)
                                            .transition()
                                            .delay(500)
                                            .duration(0)
                                            .attr("visibility", null);
                                })
                            )
                ;


                // Add a group for each set of points
                points = _svg.selectAll(".dimension")
                                 .append("g").attr("class","points");
                _point = points.selectAll(".point")
                       .data(_data)
                      .enter()
                       .append("circle")
                       .attr({ cy     :  function(city){
                                             var p = d3.select(this.parentNode).datum();
                                             return _y[p](city[p]);
                                         }
                              , cx    : 0
                              , r     : 3
                              , class : "unhighlight point"
                        })
                ;

                // Add an axis and title.
                g.append("g")
                    .attr("class", "axis")
                    .each(function(d) { d3.select(this).call( _axis.scale(_y[d])); })
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("y", _height)
                    .attr("dy", "2em")
                    .text(String)
                ;

                //try to wrap the labels
                d3.selectAll("g.axis > text").call(gcif.util.wrap, 0.80 * (_x.range()[1] - _x.range()[0]));

                // Add and store a brush for each axis if there is > 1 indicator
                if(_metadata.length > 1){

                    g.append("g")
                        .attr("class", "brush")
                        .each(function(d) {
                                d3.select(this).call(
                                _y[d].brush = d3.svg.brush().y(_y[d])
                                                           .on("brush.chart", brush)
                            );
                        })
                        .selectAll("rect")
                        .attr("x", -8)
                        .attr("width", 16);
                }

                // register listener for mouseover, mouseout, and click
                d3.selectAll(".foreground > path")
                    .on("mouseover", function(d){
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
                    .on("click", function(d){

                        var pathdata = d3.select(this).data()[0];

                        //In this case, loops through each city along any axis and asks:
                        // Is this city the same city (CityUniqueID_) being highlighted?
                        _point.attr("class", function(pointdata){

                            if (pointdata["CityUniqueID"] === pathdata["CityUniqueID"]){
                                return d3.select(this)
                                         .attr("class") === "unhighlight point" ? "highlight point" : "unhighlight point";
                            } else {
                                return "unhighlight point";
                            }
                        });

                        //toggle the color of clicked paths
                        d3.select(this).attr("class", function(){
                            return d3.select(this).attr("class") === "unhighlight" ? "highlight" : "unhighlight";
                        });
                    })
                    ;

                // register listener for mouseover, mouseout for points
                d3.selectAll(".point")
                    .on("mouseover", function(d){
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
            }

            _parallel.render = function() {
                setsvgdim();
                _svg = rendersvg(_container);
                renderAxes();
                renderBody();
            };

            _parallel.clearBrush = function(d3brushes){
                d3brushes.each(function(indicator){
                    _y[indicator].brush.clear();
                    d3.select(this).call( _y[indicator].brush );
                    d3.select(this).call( brush );
                })
            };

             _parallel.subsetBrush = function(){
            };

            _parallel.clearHighlight = function(d3paths){
                d3paths.each(function(d){
                        d3.select(this).attr("class","unhighlight");
                })
            };

            _parallel.data = function(_){
                if (!arguments.length) return _data;
                _data = _;
                return _parallel;
            };

            _parallel.metadata = function(_){
                if (!arguments.length) return _metadata;
                _metadata = _;
                return _parallel;
            };

            return _parallel;

        }//END /Parallel/


         /************************************ Helpers ************************************************************/
        /* rendering */
        function renderAll() {

            list.metadata( stateMap.indicators );
            list.data( stateMap.cities );
            parallelChart.metadata( stateMap.indicators );
            parallelChart.data( stateMap.cities );

            list.render();
            parallelChart.render();
        }

        /* Update graph using new width and height (code below) */
        function resize() {
            d3.transition()
            .duration(750)
            .each(renderAll);
        }

        function resetState(){
            stateMap.theme      = undefined;
            stateMap.indicators = undefined;
            stateMap.cities     = undefined;
            stateMap.member_cities_db = TAFFY();
            stateMap.performance_indicators_db = TAFFY();
            stateMap.abundant_themes_db = TAFFY();
        }


        /* event listners */
        //reset button for highlighted paths
        d3Map.d3clear_highlights.on("click", function(){
            parallelChart.clearHighlight(d3Map.d3compare.selectAll(".foreground path.highlight"))
        });

        //reset button for brushes
        d3Map.d3clear_brushes.on("click", function(){//
            parallelChart.clearBrush( d3.selectAll(".brush") )
        });

        //subset button for brushes
        d3Map.d3isolate_brushed.on("click", function(){//
            parallelChart.subsetBrush();
            renderAll();
        });

        //listen to the clear all button
        d3Map.d3refresh.on("click", function(){
            resetState();
            loadMongodb();
        });

        //listen to changes in theme dropdown
        d3Map.d3theme_dropdown.on("change", function(){
            stateMap.theme = d3Map.d3theme_dropdown.node().value;
            stateMap.indicators = stateMap.theme === "all" ?
                              stateMap.abundant_themes_db()
                                      .map(function(idoc){ return idoc["indicator"]; }) :
                              stateMap.performance_indicators_db({ theme: stateMap.theme, core: 1 })
                                      .map(function(idoc){ return idoc["indicator"]; });
            renderAll();
        });

        // window resizing
        d3.select(window).on('resize', resize );

        /* load data from MongoDB */
        function loadMongodb() {

            // push member city data from mongodb collection "member_cities" in TAFFY DB
//            d3.json("/member_cities/list", function(member_cities_data) {
            d3.json("assets/data/member_cities.json", function(member_cities_data) {
                stateMap.member_cities_db.insert(member_cities_data);
                //cache the cities in the stateMap
                stateMap.cities = stateMap.member_cities_db(function(){
                    //only include the top 50 cities by indicator count
                    return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
                }).get();


                // push performance indicator data from mongodb collection "performance_indicators" in TAFFY DB
//                d3.json("/performance_indicators/list", function(performance_indicators_data) {
                d3.json("assets/data/performance_indicators.json", function(performance_indicators_data) {
                    stateMap.performance_indicators_db.insert(performance_indicators_data);


                    var dropdata = stateMap.performance_indicators_db(function(){
                                //only include indicators in top 5 themes
                                return stateMap.top5Themes.indexOf(this["theme"]) >= 0;
                            }).distinct("theme");
                    dropdata.splice(0, 0, "all");

                    //Load (top) indicators into dropdown menu
                    d3Map.d3theme_dropdown.selectAll("option")
                        .data(dropdata)
                       .enter()
                        .append("option")
                        .text(function(theme) { return theme; });

                    d3.json("assets/data/abundant_themes.json", function(abundant_themes) {
                        //this is pre-filtered for the indicators of interest
                        stateMap.abundant_themes_db.insert(abundant_themes);

                        //initialize this set to the default -- all
                        stateMap.theme = "all";
                        stateMap.indicators =  stateMap.abundant_themes_db()
                                                   .map(function(idoc){ return idoc["indicator"]; });
                        renderAll();
                    });

                });
            });

        }

        /* instructions for drawing */
        //Setup Graphical
        parallelChart = Parallel( d3Map.d3compare );

        // Setup Tabular
        list = List( d3Map.d3table );

        // load data; fire graphs
        loadMongodb();

    };
    // END private method /render/

    //--------------------- END DOM METHODS ----------------------


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

