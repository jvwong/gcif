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
                                    '<button type="button" class="btn btn-default" id="reset-highlight">' +
                                        '<span class="glyphicon glyphicon-pencil"></span> Reset Highlight' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="reset-brushes">' +
                                        '<span class="glyphicon glyphicon-pencil"></span> Reset Brushes' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div class="gcif-compare chart col-lg-12"></div>' +
                    '</div>' +
                    '<div class="tab-pane fade" id="tabular">' +
                        '<div class="gcif-compare table col-lg-12">' +
                            '<table class="table table-hover table-striped">' +
                                '<thead></thead>' +
                                '<tbody></tbody>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +

                '</div>' +

            '</div>'
    }
    , stateMap = {
          $container                  : undefined
          , cities                    : undefined

          , isClicked                 : false
          , theme                     : "education"
          , means                     : {}

          , member_cities_db          : TAFFY()
          , performance_indicators_db : TAFFY()
          , abundant_themes_db        : TAFFY()
          , car_data                  : TAFFY()
          , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE",
                                         "BELO HORIZONTE","BUENOS AIRES","GOIANIA","PEORIA","SAANICH","SANTA ANA",
                                         "DALLAS","LVIV","SASKATOON","TUGUEGARAO","CALI","HAMILTON","ILE-DE-FRANCE",
                                         "HAIPHONG","LISBON","MILAN","OLONGAPO","CANCUN","DURBAN","MOMBASA","TRUJILLO",
                                         "OSHAWA","SAO BERNARDO DO CAMPO","SURREY","KRYVYI RIH","PUERTO PRINCESA",
                                         "MAKATI","PORT OF SPAIN","KABANKALAN","MUNOZ","RIGA","SAO PAULO","TACURONG",
                                         "ZAMBOANGA","BALANGA","BEIT SAHOUR","ISTANBUL","CLARINGTON","MEDICINE HAT",
                                         "VAUGHAN","LAOAG","GUELPH","KING COUNTY","SANA'A","BOGOR"]
//          , top50Cities               : ["AMMAN","TORONTO","BOGOTA"]
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
            , d3reset_highlight   : d3.select(".gcif-compare.reset button#reset-highlight")
            , d3reset_brushes     : d3.select(".gcif-compare.reset button#reset-brushes")
            , d3theme_dropdown    : d3.select(".gcif-compare.menu select#theme-dropdown")
            , d3table             : d3.select(".gcif-compare.table")
        };
    };


    // BEGIN private method /render/
    render = function(){

       var
         margin = {top: 25, right: 5, bottom: 150, left: 5}
       , minwidth = 500, minheight = 300
       , width, height
       , svg
       , x = d3.scale.ordinal()
       , y = {}
       , dragging = {}
       , line = d3.svg.line()
       , axis = d3.svg.axis().orient("left")
       , background
       , foreground
       , point
       , dimensions
       , tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0)

       , list
       ;


        /************************************ TABULAR TAB ************************************************************/

        // Render the list
        function drawList() {
            list.each( function(method){
                d3.select(this).call(method);
            });
        }

        function cityList( $container ) {

            // TBD: data here should reflect selection (bold) and brushing (subsetting)
            var   city
                , cityEnter
                , thead = $container.select("thead").html("").append("tr")
                , tbody = $container.select(this).select("tbody").html("")
                , data = stateMap.cities
                ;

            thead.append("th")
                 .attr("class", "city header")
                 .text("City")
            ;

            thead.selectAll(".field")
                 .data(dimensions)
                .enter()
                 .append("th")
                 .attr("class", "indicator header")
                 .text(function(d){
                    return d;
                })
            ;

            //append a <tr class="city") for each city
            city = tbody.selectAll(".city")
                        .data(data, function(d) { return d["UniqueID"]; });

            cityEnter = city.enter()
                .append("tr")
                    .attr("class", "city")
                ;

            cityEnter.append("td")
                     .attr("class", "cityname indicator")
                     .text(function(d){ return d["CityName"]})
            ;

            dimensions.forEach(function(dimension){
                cityEnter.append("td")
                         .attr("class", "indicator")
                         .text(function(d){
                                return d[dimension]
                        })
                ;
            });

            city.exit().remove();


        }


        /************************************ GRAPHICAL TAB***********************************************************/
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
            return line(dimensions.map(function(p) {
                    return [position(p), y[p](d[p])]; })
            );
        }


        // Handles a brush event, toggling the display of foreground lines.
        function brush() {

            //actives is the set. possibly empty, of indicators/axes that are currently being brushed
            var actives = dimensions.filter(function(indicator) { return !y[indicator].brush.empty(); }),
            extents = actives.map(function(indicator) { return y[indicator].brush.extent(); });

            // clear the cities list
            stateMap.cities.length = 0;


            //loop through each city's path and set the path visibility to null OR none
            foreground.style("display", function(data) {

                //loop over each brushed indicator
                var isValid = actives.every(function(indicator, index) {
                    //loop  over each indicator axis extent (if any)
                    return extents[index][0] <= data[indicator] && data[indicator] <= extents[index][1];
                });

                if (isValid){
                    stateMap.cities.push(data);
                    return null;
                }
                return "none";

            });

            point.style("display", function(data){
                //In this case, loops through each city along any axis and asks:
                // Is the indicator for this city within the brush for those being brushed?
                return actives.every(function(indicator, indindex) {
                    return extents[indindex][0] <= data[indicator] && data[indicator] <= extents[indindex][1];
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

        //reset button for highlighted paths
        d3Map.d3reset_highlight.on("click", function(){
            d3Map.d3compare.selectAll(".foreground path").each(
                function(){ d3.select(this).attr("class","unhighlight") }
            );
        });

        //reset button for brushes
        d3Map.d3reset_brushes.on("click", function(){
            d3.selectAll(".brush").each(function(d,i) {
                y[d].brush.clear();
                //clear the brush itself
                d3.select(this).call( y[d].brush );
                //call the brush function on this brush to redraw data within extent
                d3.select(this).call( brush );
            });
            drawList();
        });


        //listen to changes in theme dropdown
        d3Map.d3theme_dropdown.on("change", function(){
            var t = d3Map.d3theme_dropdown.node().value;
            stateMap.theme  = t;
            //need to clear the svg and redraw
            rendersvg(); redraw();
//            drawList();
        });


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

                //cache the cities in the stateMap
                stateMap.cities = stateMap.member_cities_db(function(){
                    //only include the top 50 cities by indicator count
                    return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
                }).get();

                // push performance indicator data from mongodb collection "performance_indicators" in TAFFY DB
                d3.json("/performance_indicators/list", function(performance_indicators_data) {
                    stateMap.performance_indicators_db.insert(performance_indicators_data);

                    //Load (top) indicators into dropdown menu
                    d3Map.d3theme_dropdown.selectAll("option")
                        .data(stateMap.performance_indicators_db(function(){
                                //only include indicators in top 5 themes
                                return stateMap.top5Themes.indexOf(this["theme"]) >= 0;
                            }).distinct("theme"))
                       .enter()
                        .append("option")
                        .text(function(theme) { return theme; });
                    d3Map.d3theme_dropdown.append("option").text("all");

                    d3.json("assets/data/abundant_themes.json", function(abundant_themes) {
                        //this is pre-filtered for the indicators of interest
                        stateMap.abundant_themes_db.insert(abundant_themes);
                        redraw();
                    });

                });
            });

        }


        function redraw() {
            var
              // Check the dropdown and load only those indicators mapped to a list
              ilist = stateMap.theme === "all" ? stateMap.abundant_themes_db().map(function(idoc){ return idoc["indicator"]; }) :
                  stateMap.performance_indicators_db({ theme: stateMap.theme, core: 1 }).map(function(idoc){ return idoc["indicator"]; })
            , cities = stateMap.cities
            ;


            // Extract the list of dimensions and create a scale for each.
            x.domain(dimensions = d3.keys(cities[0]).filter(function(header) {

                return header !== ("_id") &&

                       // filter the headers here based on ilist defined above
                       (ilist.indexOf(header) >=0)  &&

                       // initialize the y scale (y)
                       // y is a global dictionary {} of y-scales for each column (header)
                            //can check if we are mean centering
                       (y[header] = d3.scale.linear()
                                 .domain([0, d3.max(cities, function(document) { return +document[header];})])
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
                .enter()
                .append("path")
                .attr("class", "unhighlight")
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


            // Add a group for each set of points
            var points = svg.selectAll(".dimension")
                             .append("g").attr("class","points");
            point = points.selectAll(".point")
                   .data(cities)
                  .enter()
                   .append("circle")
                   .attr({ cy     :  function(city){
                                         var p = d3.select(this.parentNode).datum();
                                         return y[p](city[p]);
                                     }
                          , cx    : 0
                          , r     : 3
                          , class : "unhighlight point"
                    })
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

            // Add and store a brush for each axis if there is > 1 indicator
            if(ilist.length > 1){
                g.append("g")
                    .attr("class", "brush")
                    .each(function(d) {
                            d3.select(this).call(
                            y[d].brush = d3.svg.brush().y(y[d])
                                                       .on("brush.chart", brush)
                                                       .on("brush.table", drawList)
                        );
                    })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);
            }

            // register listener for mouseover, mouseout, and click
            d3.selectAll(".foreground > path")
                .on("mouseover", function(d){
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(d["CityName"])
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                })
                .on("mouseout", function(d){
                    // get rid of the tooltip when mousing away
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", function(d){

                    var pathdata = d3.select(this).data()[0];

                    //In this case, loops through each city along any axis and asks:
                    // Is this city the same city (CityUniqueID_) being highlighted?
                    point.attr("class", function(pointdata){

                        if (pointdata["CityUniqueID"] === pathdata["CityUniqueID"]){
                            return d3.select(this).attr("class") === "unhighlight point" ? "highlight point" : "unhighlight point";
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
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(d["CityName"])
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                })
                .on("mouseout", function(d){
                    // get rid of the tooltip when mousing away
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
            ;

            drawList();

        }//END /redraw/

        /* register event listeners */
        d3.select(window).on('resize', resize);

        /* instructions for drawing */
        // Graphical
        setsvgdim();
        rendersvg();
        loadMongodb();

        // Tabular
        list = cityList(d3Map.d3table);
        console.log(list);


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

