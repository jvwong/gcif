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

            '<h3 class="sub-header">Core Indicators</h3>' +

            '<div class="row">' +

                '<div class="col-sm-12 col-md-4 col-lg-6">' +
                    '<span class="gcif-hbar menu">' +
                        '<select></select>' +
                    '</span>' +
                '</div>' +
                '<div class="col-sm-12 col-md-4 col-lg-3">' +
                    '<span class="gcif-hbar number">' +
                        'Show: ' +
                        '<select>' +
                            '<option value="25">25</option>' +
                            '<option value="50">50</option>' +
                            '<option value="100">100</option>' +
                            '<option value="200">200</option>' +
                            '<option value="1000">All</option>' +
                        '</select>' +
                    '</span>' +
                '</div>' +
                '<div class="col-sm-12 col-md-4 col-lg-3">' +
                    '<span class="gcif-hbar sort">' +
                        'Sort By Name: <input type="checkbox">' +
                    '</span>' +
                '</div>' +
            '<div>' +


            '<div class="row">' +
                '<div class="gcif-hbar chart scol-lg-6">' +
                '</div>' +

                '<div class="gcif-hbar table col-lg-6">' +
                    '<table class="table table-striped">' +
                        '<thead>' +
                            '<tr>' +
                                '<th>Indicator</th>' +
                                '<th>Value</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '<tr>' +
                                '<td>' + 'Dummy key' + '</td>' +
                                '<td>' + 'Dummy value' + '</td>' +
                            '</tr>' +
                        '</tbody>' +
                    '</table>' +
                '</div>' +

            '<div>'



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
              d3bar       : d3.select(".gcif-hbar.chart")
            , d3table     : d3.select(".gcif-hbar.table")
            , d3category  : d3.select(".gcif-hbar.menu select")
            , d3sort      : d3.select(".gcif-hbar.sort input")
            , d3number    : d3.select(".gcif-hbar.number select")
        };
    };


    // BEGIN private method /render/
    render = function(dataurl){

        var
          margin = {top: 50, right: 40, bottom: 10, left: 145}
        , width = 700
        , height = 2500 - margin.top - margin.bottom

        , cities
        , categories
        , memberData
        , categoryIndicators

        , defaultCategory = "all"
        , nCore = 40

        , x = d3.scale.linear().range([0, width])
        , y = d3.scale.ordinal().rangeBands([0, height], .1, .1)

        , xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("top")
                        .tickSize(-height - margin.bottom)

        /* append main svg */
        , svg = d3Map.d3bar.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        /* add the tool tip*/
        , tooltip = d3Map.d3bar.append("div")
                     .attr("class", "tooltip")
                     .style("opacity", 0);

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
        d3Map.d3category.on("change", change);
        d3Map.d3sort.on("change", change);
        d3Map.d3number.on("change", change);


        /* read in the data */
        d3.csv(dataurl, function(data) {

            //global variable
            cities = data;

            // remove the CityName and CityUniqueID_ and all keys
            categories = d3.keys(cities[0]).filter(function(key) {
                return key != "CityName" && key != "CityUniqueID_";
            });

            cities.forEach(function(city) {
                categories.forEach(function(category){
                    city[category] = +city[category];
                });
            });

            d3Map.d3category.selectAll("option")
                        .data(categories)
                       .enter()
                        .append("option")
                        .text(function(cat) { return cat; });

            d3Map.d3category.property("value", defaultCategory);
            d3Map.d3number.property("value", 100);

            redraw();
        });

        /* read in the full member data  */
        d3.json('./member_core_byID.json', function(data) {
            memberData = data;
        });
        /* read in the category --> indicator mapping */
        d3.json('./category_indicators.json', function(data) {
            categoryIndicators = data;
        });


        function getIndicators(data){

            var
              html
            , category_indicators
            , cityData
            , keys
            ;

            //open the list
            html = String() +
                '<ul>'
            ;

            //get the member data by CityUniqueID_
            cityData = memberData[ data["CityUniqueID_"] ];

            keys = d3.keys(cityData);

            for (var i=0; i<keys.length; i++){

                html += '<li>' +
                            keys[i] + ": " + cityData[keys[i]]
                        '</li>'
            }

            //close the list
            html += '</ul>'
            ;




            return html;

        }


        function change() {
            d3.transition()
                .duration(750)
                .each(redraw);
        }

        function redraw() {

            //get the category
            var
              current_category = d3Map.d3category.property("value")
            , alpha_sort = d3Map.d3sort.property('checked')
            , numrecords = d3Map.d3number.node().value
            , cityData
            ;

              //sort
            if (alpha_sort === false){
                cityData = cities.sort(function(a, b) { return b[current_category] - a[current_category]; }).slice(0, numrecords);
            }else{
                cityData = cities.sort(function(a, b) { return d3.ascending(a["CityName"], b["CityName"]); }).slice(0, numrecords);
            }

            //update the category
            var category = current_category;

            // position on y-axis will map onto a categorial axis
            y.domain(cityData.map(function(d) { return d["CityUniqueID_"]; }));

            var bar = svg.selectAll(".gcif-hbar.chart.bar")
                     .data(cityData, function(d) { return d["CityUnqiueID_"]; });


            //define enter selections
            var barEnter = bar.enter().insert("g", ".axis") //create and insert new elements before existing elements
                          .attr("class", "gcif-hbar chart bar")
                          .attr("transform", function(d) { return "translate(0," + (y(d["CityUniqueID_"]) + height) + ")"; })
                          .style("fill-opacity", 0);

            // NB: "return a && b"  is return a if a is falsy, return b if a is truthy
            barEnter.append("rect")
                  .attr("width", category && function(d) { return x(d[category]); })
                  .attr("height", y.rangeBand());

            // put the city name along the y axis
            barEnter.append("text")
                  .attr("class", "gcif-hbar chart label")
                  .attr("x", -3)
                  .attr("y", y.rangeBand() / 2)
                  .attr("dy", "0.35em")
                  .attr("text-anchor", "end")
                  .text(function(d) { return  d["CityName"]; });

            // put a label at the top
            barEnter.append("text")
                  .attr("class", "gcif-hbar chart value")
                  .attr("x", category && function(d) { return x(d[category]) - 3; }) //push to the left
                  .attr("y", y.rangeBand() / 2)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "end");


            /* tooltip */
            barEnter.on("mouseover", function(d) {
                     tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                     tooltip.html( getIndicators(d) )
                        .style("left", (width + 200) + "px")
                        .style("top", (d3.event.pageY - 50) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

            // setting category here as the value of the selected current_scategory
            x.domain([0, nCore ]);

            var barUpdate = d3.transition(bar)
              .attr("transform", function(d) { return "translate(0," + (d.y0 = y( d["CityUniqueID_"])) + ")"; })
              .style("fill-opacity", 1);

            barUpdate.select("rect")
              .attr("width", function(d) { return x(d[category]); })
              .attr("height", y.rangeBand());;

            //update the label on the bar (but don't do it if its zero)
            barUpdate.select(".gcif-hbar.chart.value")
              .attr("x", function(d) { return x(d[category]) - 3; })
              .attr("y", y.rangeBand() / 2)
              .text(function(d) { return d[category] > 0 ? (d[category]) : null; });

            barUpdate.select(".gcif-hbar.chart.label")
                  .attr("y", y.rangeBand() / 2);

            var barExit = d3.transition(bar.exit())
              .attr("transform", function(d) { return "translate(0," + (d.y0 + height) + ")"; })
              .style("fill-opacity", 0)
              .remove();

            barExit.select("rect")
              .attr("width", function(d) { return x(d[category]); });

            barExit.select("gcif-hbar.chart.value")
              .attr("x", function(d) { return x(d[category]) - 3; })
              .text(function(d) { return d[category]; });

            d3.transition(svg).select(".gcif-hbar.chart.x.axis")
              .call(xAxis);
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

