/*
 * gcif.dash.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.dash = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">' +
                '<h1 class="page-header">Dashboard</h1>' +

                '<div class="row placeholders">' +
                    '<div class="col-xs-6 col-sm-3 placeholder">' +
                        '<img data-src="holder.js/200x200/auto/sky" class="img-responsive" alt="Generic placeholder thumbnail">' +
                        '<h4>Label</h4>' +
                        '<span class="text-muted">Something else</span>' +
                    '</div>' +
                '<div class="col-xs-6 col-sm-3 placeholder">' +
                    '<img data-src="holder.js/200x200/auto/vine" class="img-responsive" alt="Generic placeholder thumbnail">' +
                    '<h4>Label</h4>' +
                    '<span class="text-muted">Something else</span>' +
                '</div>' +
                '<div class="col-xs-6 col-sm-3 placeholder">' +
                    '<img data-src="holder.js/200x200/auto/sky" class="img-responsive" alt="Generic placeholder thumbnail">' +
                    '<h4>Label</h4>' +
                    '<span class="text-muted">Something else</span>' +
                '</div>' +
                '<div class="col-xs-6 col-sm-3 placeholder">' +
                    '<img data-src="holder.js/200x200/auto/vine" class="img-responsive" alt="Generic placeholder thumbnail">' +
                    '<h4>Label</h4>' +
                    '<span class="text-muted">Something else</span>' +
                '</div>' +
            '</div>' +

            '<h2 class="sub-header">Section title</h2>' +
            '<div class="table-responsive">' +
                '<table class="table table-striped">' +
                    '<thead>' +
                        '<tr>' +
                            '<th>#</th>' +
                            '<th>Header</th>' +
                            '<th>Header</th>' +
                            '<th>Header</th>' +
                            '<th>Header</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td>1,001</td>' +
                            '<td>Lorem</td>' +
                            '<td>ipsum</td>' +
                            '<td>dolor</td>' +
                            '<td>sit</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>1,002</td>' +
                            '<td>amet</td>' +
                            '<td>consectetur</td>' +
                            '<td>adipiscing</td>' +
                            '<td>elit</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>'
    }
    , stateMap = {
        $container : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
    , setDataUrl
    , renderGraphs
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
    //--------------------- END DOM METHODS ----------------------


    // Begin public method /renderGraphs/
    // Example   : chart.graphpad();
    // Purpose   :
    // Arguments :
    //   * a -
    // Action    :
    //   This method
    // Returns   : none
    // Throws    : none
    //
    // private method /renderGraphs/
    renderGraphs = function(data){
        var
          dayChart
        , dataTable

        , dtgFormat2
        , monthNames
        , parseDate

        , facts

        , dayDimension
        , dayDimensionGroup

        , margins_template

        , span_height
        , span4_width
        , span6_width
        , span12_width

        , nestByCity

        , start_dayChart
        , end_dayChart

        ;

        //formatting and utilities
        margins_template = {top: 10, right: 10, bottom: 80, left: 60};
        span_height = 350;
        span4_width = 250;
        span6_width = 400;
        span12_width = 700;



        // data variable formatting

        // A nest operator, for grouping the flight list.
        nestByCity = d3.nest().key(function(data) { return d3.time.day(d.date); });

        data.forEach(function(d) {

            if( (d["CityName"]).toUpperCase() === "TORONTO"){
                gcif.util.parseData(d);
                console.log(d);
            }

        });



        //            // Run the data through crossfilter and load our 'facts'
        //            facts = crossfilter(data);
        //
        //            // Create crossfilter dimensions
        //            dayDimension = facts.dimension(function(d) { return d3.time.day(d.date); });
        //            dayDimensionGroup = dayDimension.group().reduceSum(function(d) { return d.amount; });
        //
        //            //// Receipts by day
        //            start_dayChart = d3.time.day.offset(d3.extent(data, function(d){ return d.date; })[0], -1);
        //            end_dayChart  = d3.time.day.offset(d3.extent(data, function(d){ return d.date; })[1], +1);
        //            dayChart.width(span12_width)
        //                    .height(span_height)
        //                    .margins(margins_template)
        //                    .dimension(dayDimension)
        //                    .group(dayDimensionGroup)
        //                    .title("Daily Expenses")
        //                    .transitionDuration(500)
        //                    .centerBar(true)
        //                    .gap(1)
        //                    .xUnits(d3.time.days)
        //                    .x(d3.time.scale().domain([start_dayChart, end_dayChart]) )
        //                    .elasticY(true)
        //                    .xAxis();
        //
        //            // Table of receipt data
        //            dataTable.width( span12_width )
        //                    .dimension( dayDimension )
        //                    .group(function() {
        //                      return "";
        //                    })
        //                    .size(10).order(d3.descending)
        //                    .columns([
        //                      function(d) { return d.date.toDateString(); },
        //                      function(d) { return d.amount; },
        //                      function(d) { return d.detail; },
        //                      function(d) { return d.name; },
        //                    ]);
        //
        //
        //            // Render the Charts
        //            dc.renderAll();
        //
        //            // Adjust axes
        //            d3.select("#dc-day-chart .axis.x")
        //                    .selectAll("text")
        //                    .style("text-anchor", "end")
        //                    .attr("dx", "-.8em")
        //                    .attr("dy", ".15em")
        //                    .attr("transform", function() {
        //                      return "rotate(-45)";
        //                    });




        // Create the dc-2.0.0 chart objects & link to div
        dayChart = dc.barChart("#dc-barChart-population");
        dataTable = dc.dataTable("#dc-dataTable-data");


    };
    //end /renderGraphs/


    //------------------- BEGIN EVENT HANDLERS -------------------

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------


    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /setDataUrl/
    // Example   : chart.graphpad.setDataSource( 'simpledata.json' );
    // Purpose   :
    //   Accepts a valid url pointing to a data source
    // Arguments :
    //   * url (example: '/usr/data/simpledata.json' )
    //     A string that should represent a url
    // Action    :
    //   Sets the configMap setDataUrl attribute
    // Returns   : none
    // Throws    : error if this is not a valid url for d3
    setDataUrl = function ( url ) {

        //store container in stateMap
        if (url){

            configMap.data_url = url;
            //note the hack is just the url for a local file
            try{
                d3.csv(configMap.data_url, function(data){
                    renderGraphs(data);
                });
            }
            catch(error){
                console.log(error);
            }

        }

    };
    // End PUBLIC method /initModule/



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

        setDataUrl('./clean_compile.csv');

    };
    // End PUBLIC method /initModule/

    return {  initModule  : initModule
            };
    //------------------- END PUBLIC METHODS ---------------------
})();

