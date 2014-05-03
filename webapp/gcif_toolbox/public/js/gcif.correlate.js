/*
 * gcif.correlate.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.correlate = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
          configMap = {

            main_html : String() +

                '<h3 class="sub-header"></h3>' +

                '<div class="row">' +

                    '<ul id="myTab" class="nav nav-tabs">' +
                        '<li class="active"><a href="#gcif-correlate-graphical" data-toggle="tab">Graphical</a></li>' +
                        '<li class=""><a href="#gcif-correlate-tabular" data-toggle="tab">Tablular</a></li>' +
                    '</ul>' +
                    '<div id="myTabContent" class="tab-content">' +
                        '<div class="tab-pane fade active in" id="gcif-correlate-graphical">' +
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
                            '</form>' +
                            '<div class="row">' +
                                '<div class="gcif-correlate chart col-lg-6"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="tab-pane fade" id="gcif-correlate-tabular">' +
                            '<div class="gcif-correlate table col-lg-12"></div>' +
                        '</div>' +
                    '</div>' +

                '</div>'
        }
        , stateMap = {
            $container                  : undefined

            , cities                    : undefined
            , indicators                : undefined

            , color                     : undefined

            , cities_db          : TAFFY()
            , performance_indicators_db : TAFFY()


          , topThemes                  : ["education","finance","health","safety","urban planning"]

          , xValue                      : undefined
          , yValue                      : undefined
          , title                       : "Correlation"
        }

        , jqueryMap = {}, d3Map= {}
        , setJqueryMap, setd3Map

        , dispatch = d3.dispatch("brush", "data_update", "load_cities", "load_indicators", "done_load")

        , loadData, loadListeners, initCharts, resetState, render, redraw

        , scatter
        , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------
    setJqueryMap = function(){
        var
            $container = stateMap.$container;

        jqueryMap = {
              $container       : $container
            , $xVal_dropdown   : $container.find(".form-group.gcif-correlate.graphical.menu select#xVal-dropdown")
            , $yVal_dropdown   : $container.find(".form-group.gcif-correlate.graphical.menu select#yVal-dropdown")

        };
    };

    setd3Map = function(){
        d3Map = {
              d3correlate           : d3.select(".gcif-correlate.chart")

            , d3xVal_dropdown       : d3.select(".form-group.gcif-correlate.graphical.menu select#xVal-dropdown")
            , d3yVal_dropdown       : d3.select(".form-group.gcif-correlate.graphical.menu select#yVal-dropdown")
        };
    };

    initCharts = function(){
        scatter = gcif.scatter.Scatter( d3Map.d3correlate );
        scatter.xValue( stateMap.xValue );
        scatter.yValue( stateMap.yValue );
        scatter.title( stateMap.title );
        scatter.data( stateMap.cities );
        scatter.render();

    };

    resetState = function (){
        stateMap.indicators = undefined;
        stateMap.cities     = undefined;
        stateMap.cities_db  = TAFFY();
        stateMap.performance_indicators_db = TAFFY();
    };

    loadData = function(){
        d3.json("/performance_indicators/list", function(performance_indicators_data) {
            dispatch.load_indicators(performance_indicators_data);
        });

        d3.json("/gcif_combined/list", function(cities_data){
            dispatch.load_cities(cities_data);
            dispatch.done_load();
        });
    };

    loadListeners = function(){
        //--------------------- BEGIN EVENT LISTENERS ----------------------

        dispatch.on("data_update", function(){
            redraw(true);
        });

        dispatch.on("load_cities", function(data){
            stateMap.cities_db.insert(data);
            stateMap.cities = stateMap.cities_db().get();
        });

        dispatch.on("load_indicators", function(data){
            stateMap.performance_indicators_db.insert(data);
            stateMap.indicators = stateMap.performance_indicators_db(function(){
                return this["core"] === 1 ;//&& stateMap.topThemes.indexOf(this["theme"]) >= 0;
            }).order("indicator asec").get();

            // load the indicators into the x/y value drop downs
            d3Map.d3xVal_dropdown.selectAll("option")
                .data(stateMap.indicators)
                .enter()
                .append("option")
                .text(function(d) { return d["indicator"]; });
            stateMap.xValue = d3Map.d3xVal_dropdown.node().value;

            d3Map.d3yVal_dropdown.selectAll("option")
                .data(stateMap.indicators)
                .enter()
                .append("option")
                .text(function(d) { return d["indicator"]; });
            stateMap.yValue = d3Map.d3yVal_dropdown.node().value;

        });


        // window resizing
        d3.select(window).on('resize', redraw );

        //listen to changes in x/y drop downs
        d3Map.d3xVal_dropdown.on("change", function(){
            stateMap.xValue = d3Map.d3xVal_dropdown.node().value;
            redraw();
        });
        d3Map.d3yVal_dropdown.on("change", function(){
            stateMap.yValue = d3Map.d3yVal_dropdown.node().value;
            redraw();
        });
        //--------------------- END EVENT LISTENERS ----------------------

    };

    redraw = function(){
        d3.transition()
            .duration(500)
            .each(renderAll);

        function renderAll(){
            scatter.xValue( stateMap.xValue );
            scatter.yValue( stateMap.yValue );
            scatter.render();
        }

    };

    // BEGIN public method /render/
    // Example   : gcif.compare.render();
    // Purpose   :
    //   Adds the graphical and tabular elements to the page
    // Arguments : none
    // Action    :
    //   Loads data, populates d3compare and d3table elements, and
    //   triggers listeners
    // Returns   : none
    // Throws    : none
    render = function(){
        loadListeners();
        loadData();

        dispatch.on("done_load", function(){
            initCharts();
            redraw();
        });

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
        resetState();
        //store container in stateMap
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();
        setd3Map();
    };
    // End PUBLIC method /initModule/

    return { initModule   : initModule
           , render       : render
    };
    //------------------- END PUBLIC METHODS ---------------------
})();

