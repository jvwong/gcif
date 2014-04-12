/*
 * gcif.hbar.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.hbar = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<h4 class="sub-header">Indicator Counts</h4>' +
            '<div class="gcif-hbar chart">' +
                '<p class="gcif-hbar menu"><b>Indicator Category</b>' +
                '<br>Category: <select></select>' +
            '</div>'
    }
    , stateMap = {
          $container : undefined
        , dataUrl   : undefined
    }
    , jqueryMap = {}
    , d3Map= {}
    , setJqueryMap
    , setd3Map
    , setDataUrl
    , render
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container

        jqueryMap = {
              $container : $container
        };
    };

    setd3Map = function(){
        d3Map = {
              d3bar  : d3.select(".gcif-hbar.chart")
            , d3menu : d3.select(".gcif-hbar.menu select")
        };
    };


    // BEGIN private method /render/
    render = function(dataurl){


        var
          margin = {top: 20, right: 40, bottom: 10, left: 40}
        , width = 960
        , height = 250 - margin.top - margin.bottom

        , format = d3.format(".1%")
        , cities
        , categories
        , defaultCategory = "all"

        , x = d3.scale.linear().range([0, width])
        , y = d3.scale.ordinal().rangeRoundBands([0, height], .1)

        , xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("top")
                        .tickSize(-height - margin.bottom)
                        .tickFormat(format)

        /* append main svg */
        , svg = d3Map.d3bar.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("margin-left", -margin.left + "px")

        , g = svg.append("g")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;

        /* append axes */
        svg.append("g")
            .attr("class", "gcif-hbar chart x axis");

        svg.append("g")
            .attr("class", "gcif-hbar chart y axis")
          .append("line")
            .attr("class", "domain")
            .attr("y2", height);


        /* register event listeners*/
        d3Map.d3menu.on("change", change);

        d3.csv(dataurl, function(data) {

            //global variable
            cities = data;

            // remove the CityName and CityUniqueID_ and all keys
            categories = d3.keys(cities[0]).filter(function(key) {
                return key != "CityName" && key != "CityUniqueID_";
            });

            cities.forEach(function(city) {
                categories.forEach(function(category){

                    city["CityUniqueID_"] = +city["CityUniqueID_"];
                    city[category] = +city[category];

                });
            });

            d3Map.d3menu.selectAll("option")
                        .data(categories)
                       .enter()
                        .append("option")
                        .text(function(category) { return category; });

            d3Map.d3menu.property("value", defaultCategory);

            redraw();
        });

//       var altKey;
//        d3.select(window)
//            .on("keydown", function() { altKey = d3.event.altKey; })
//            .on("keyup", function() { altKey = false; });

        function change() {
          d3.transition()
              .duration(altKey ? 7500 : 750)
              .each(redraw);
        }

        function redraw() {

            //get the category
            var
              current_category = d3Map.d3menu.property("value")
            //sort by total number of categories reported and return the top N cities
            , top = cities.sort(function(a, b) { return b[current_category] - a[current_category]; }).slice(0, 10);

            console.log(top);

//            y.domain(top.map(function(d) { return d.State; }));
//
//            var bar = svg.selectAll(".bar")
//              .data(top, function(d) { return d.State; });
//
//            var barEnter = bar.enter().insert("g", ".axis")
//              .attr("class", "bar")
//              .attr("transform", function(d) { return "translate(0," + (y(d.State) + height) + ")"; })
//              .style("fill-opacity", 0);
//
//            barEnter.append("rect")
//              .attr("width", age && function(d) { return x(d[age]); })
//              .attr("height", y.rangeBand());
//
//            barEnter.append("text")
//              .attr("class", "label")
//              .attr("x", -3)
//              .attr("y", y.rangeBand() / 2)
//              .attr("dy", ".35em")
//              .attr("text-anchor", "end")
//              .text(function(d) { return d.State; });
//
//            barEnter.append("text")
//              .attr("class", "value")
//              .attr("x", age && function(d) { return x(d[age]) - 3; })
//              .attr("y", y.rangeBand() / 2)
//              .attr("dy", ".35em")
//              .attr("text-anchor", "end");
//
//            x.domain([0, top[0][age = age1]]);
//
//            var barUpdate = d3.transition(bar)
//              .attr("transform", function(d) { return "translate(0," + (d.y0 = y(d.State)) + ")"; })
//              .style("fill-opacity", 1);
//
//            barUpdate.select("rect")
//              .attr("width", function(d) { return x(d[age]); });
//
//            barUpdate.select(".value")
//              .attr("x", function(d) { return x(d[age]) - 3; })
//              .text(function(d) { return format(d[age]); });
//
//            var barExit = d3.transition(bar.exit())
//              .attr("transform", function(d) { return "translate(0," + (d.y0 + height) + ")"; })
//              .style("fill-opacity", 0)
//              .remove();
//
//            barExit.select("rect")
//              .attr("width", function(d) { return x(d[age]); });
//
//            barExit.select(".value")
//              .attr("x", function(d) { return x(d[age]) - 3; })
//              .text(function(d) { return format(d[age]); });
//
//            d3.transition(svg).select(".x.axis")
//              .call(xAxis);
        }

    };
    // END private method /render/

    //--------------------- END DOM METHODS ----------------------


    //------------------- BEGIN EVENT HANDLERS -------------------

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------

    //------------------- BEGIN PUBLIC METHODS -------------------

    // Begin Public method /setDataurl/
    // Example   : gcif.table.setDataUrl( "/path/to/data" );
    // Purpose   :
    //   Sets the stateMap key for $dataurl
    // Arguments :
    //   * absolute path to a valid file
    // Action    :
    //   Populates $dataUrl value
    // Returns   : none
    // Throws    : none
    setDataUrl = function(url){
        stateMap.dataUrl = url;
    };
    // End PUBLIC method /setDataurl/

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
        $container.html(configMap.main_html);
        setJqueryMap();
        setd3Map();
        render(stateMap.dataUrl);

    };
    // End PUBLIC method /initModule/

    return {   initModule  : initModule
             , setDataUrl  : setDataUrl
            };
    //------------------- END PUBLIC METHODS ---------------------
})();

