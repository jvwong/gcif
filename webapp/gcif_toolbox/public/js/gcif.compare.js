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

            '<h3 class="sub-header"></h3>' +

            '<div class="row">' +
                '<ul id="myTab" class="nav nav-tabs">' +
                    '<li class="active"><a href="#gcif-compare-graphical" data-toggle="tab">Graphical</a></li>' +
                    '<li class=""><a href="#gcif-compare-tabular" data-toggle="tab">Tablular</a></li>' +
                '</ul>' +
                '<div id="myTabContent" class="tab-content">' +
                    '<div class="tab-pane fade active in" id="gcif-compare-graphical">' +
                        '<form class="form" role="form">' +
                            '<div class="form-group gcif-compare graphical menu">' +
                                '<label for="theme-dropdown" class="col-sm-1 control-label">Theme</label>' +
                                '<div class="col-sm-11">' +
                                    '<select id="theme-dropdown" class="form-control"></select>' +
                                '</div>' +
                                '<label for="region-dropdown" class="col-sm-1 control-label">Region</label>' +
                                '<div class="col-sm-11">' +
                                    '<select id="region-dropdown" class="form-control"></select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<div class="btn-group gcif-compare graphical col-sm-offset-1 col-sm-11">' +
                                    '<button type="button" class="btn btn-default" id="clear-highlights">' +
                                        '<span class="glyphicon glyphicon-remove"></span> Clear Highlights' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="clear-brushes">' +
                                        '<span class="glyphicon glyphicon-remove"></span> Clear Brushes' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="isolate-brushed">' +
                                        '<span class="glyphicon glyphicon-th"></span> Isolate Brushed' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="refresh">' +
                                        '<span class="glyphicon glyphicon-refresh"></span> Refresh' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div class="gcif-compare chart col-lg-12"></div>' +
                    '</div>' +

                    '<div class="tab-pane fade" id="gcif-compare-tabular">' +
                        '<form class="form" role="form">' +
                            '<div class="form-group">' +
                                '<div class="btn-group gcif-compare tabular col-sm-12">' +
                                    '<a href="">' +
                                        '<button type="button" class="btn btn-default" id="export-csv">' +
                                            '<span class="glyphicon glyphicon-download"></span> CSV' +
                                        '</button>' +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div class="gcif-compare table col-lg-12"></div>' +
                    '</div>' +

                '</div>' +
            '</div>'
    }
    , stateMap = {
            $container                : undefined

          , cities                    : undefined
          , indicators                : undefined
          , theme                     : undefined
          , region                    : undefined

          , color                     : undefined

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
//          , top50Cities               : ["AMMAN","TORONTO","BOGOTA"]
          , top5Themes                : ["education","finance","health","safety","urban planning"]
    }

    , jqueryMap = {}, d3Map= {}
    , setJqueryMap, setd3Map

    , dispatch = d3.dispatch("brush", "data_update", "load_cities", "load_indicators", "load_themes", "done_load")

    , parallelChart, list

    , loadData, loadListeners, initCharts, resetState, render, redraw
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------
    setJqueryMap = function(){
        var
          $container = stateMap.$container;

        jqueryMap = {
            $container       : $container
          , $theme_dropdown  : $container.find(".form-group.gcif-compare.graphical.menu #theme-dropdown")
          , $region_dropdown : $container.find(".form-group.gcif-compare.graphical.menu #region-dropdown")
        };
    };

    setd3Map = function(){
        d3Map = {
              d3compare           : d3.select(".gcif-compare.chart")

            , d3clear_highlights  : d3.select(".btn-group.gcif-compare.graphical button#clear-highlights")
            , d3clear_brushes     : d3.select(".btn-group.gcif-compare.graphical button#clear-brushes")
            , d3isolate_brushed   : d3.select(".btn-group.gcif-compare.graphical button#isolate-brushed")
            , d3refresh           : d3.select(".btn-group.gcif-compare.graphical button#refresh")
            , d3theme_dropdown    : d3.select(".form-group.gcif-compare.graphical.menu select#theme-dropdown")
            , d3region_dropdown   : d3.select(".form-group.gcif-compare.graphical.menu select#region-dropdown")

            , d3table             : d3.select(".gcif-compare.table")
            , d3export_csv        : d3.select(".btn-group.gcif-compare.tabular button#export-csv")
            , d3downloadanchor    : d3.select(".btn-group.gcif-compare.tabular a")
        };
    };

    initCharts = function(){
        stateMap.color = d3.scale.ordinal()
                           .domain(stateMap.abundant_themes_db().distinct("theme"))
                           .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"]);

        parallelChart = gcif.parallel.Parallel( d3Map.d3compare );
        parallelChart.color(stateMap.color);

        list = gcif.table.Table( d3Map.d3table );
        list.color(stateMap.color);
    };

    resetState = function (){
        stateMap.theme      = undefined;
        stateMap.indicators = undefined;
        stateMap.cities     = undefined;
        stateMap.member_cities_db = TAFFY();
        stateMap.performance_indicators_db = TAFFY();
        stateMap.abundant_themes_db = TAFFY();
    };

    loadData = function(){
//        d3.json("/performance_indicators/list", function(performance_indicators_data) {
//            dispatch.load_indicators(performance_indicators_data);
//            d3.json("assets/data/abundant_themes.json", function(abundant_themes) {
//                dispatch.load_themes(abundant_themes);
//                d3.json("/member_cities/list", function(member_cities_data) {
//                    dispatch.load_cities(member_cities_data);
//                    dispatch.done_load();
//                });
//            });
//        });
            d3.json("assets/data/performance_indicators.json", function(performance_indicators_data) {
                dispatch.load_indicators(performance_indicators_data);
                d3.json("assets/data/abundant_themes.json", function(abundant_themes) {
                    dispatch.load_themes(abundant_themes);
                    d3.json("assets/data/member_cities.json", function(member_cities_data) {
                        dispatch.load_cities(member_cities_data);
                        dispatch.done_load();
                    });
                });
            });
    };

    loadListeners = function(){
                //--------------------- BEGIN EVENT LISTENERS ----------------------
        dispatch.on("brush", function(brusheddata){
            stateMap.cities = brusheddata;
            dispatch.data_update();
        });

        dispatch.on("data_update", function(){
            redraw(true);
        });

        dispatch.on("load_cities", function(data){
            stateMap.member_cities_db.insert(data);
            //cache the cities in the stateMap
            stateMap.cities = stateMap.member_cities_db(function(){
                //only include the top 50 cities by indicator count
                return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
            }).get();

            var dropdata = stateMap.member_cities_db(function(){
                //only include regions from top 50 cities
                return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
            }).distinct("Region");

            dropdata.splice(0, 0, "all");
            //Load (top) regions into dropdown menu
            d3Map.d3region_dropdown.selectAll("option")
                .data(dropdata)
                .enter()
                .append("option")
                .text(function(theme) { return theme; });
            stateMap.region = "all";
        });

        dispatch.on("load_indicators", function(data){
            stateMap.performance_indicators_db.insert(data);
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
        });

        dispatch.on("load_themes", function(data){
            //this is pre-filtered for the indicators of interest
            stateMap.abundant_themes_db.insert(data);
            //initialize this set to the default -- all
            stateMap.theme = "all";
            stateMap.indicators =  stateMap.abundant_themes_db()
                .map(function(idoc){ return idoc["indicator"]; });
        });

        //table button for exporting csv
        d3Map.d3export_csv.on("click", function(){
            var output = []
                , headers
                , encodedUri
                ;

            headers = stateMap.indicators;
            stateMap.cities.forEach(function(data){
                var row = headers.map(function(header){
                    return data[header];
                });
                row.unshift(data["CityName"]);
                output.push(row);
            });

            headers.unshift("City");
            output.unshift(headers);
            encodedUri = d3.csv.format(output);
            d3Map.d3downloadanchor.attr({
                href      : "data:application/csv, " + encodeURIComponent(encodedUri)
                , download  : "gcif_data.csv"
            });
        });

        //reset button for highlighted paths
        d3Map.d3clear_highlights.on("click", function(){
            parallelChart.clearHighlight(d3Map.d3compare.selectAll(".foreground path.highlight"), d3Map.d3compare.selectAll(".point.highlight"))
        });

        //reset button for brushes
        d3Map.d3clear_brushes.on("click", function(){//
            parallelChart.clearBrush( d3.selectAll(".brush") )
        });

        //subset button for brushes
        d3Map.d3isolate_brushed.on("click", function(){//
            parallelChart.subsetBrush();
            redraw();
        });

        //listen to the clear all button
        d3Map.d3refresh.on("click", function(){
            resetState();
            loadData();

            dispatch.on("done_load", function(){
                jqueryMap.$theme_dropdown.find("option").filter(function() {
                        return $(this).text() === "all";
                }).prop('selected', true);
                jqueryMap.$region_dropdown.find("option").filter(function() {
                        return $(this).text() === "all";
                }).prop('selected', true);

                redraw();
            });
        });

        //listen to changes in theme dropdown
        d3Map.d3theme_dropdown.on("change", function(){
            stateMap.theme = d3Map.d3theme_dropdown.node().value;
            stateMap.indicators = stateMap.theme === "all" ?
                stateMap.abundant_themes_db()
                    .map(function(idoc){ return idoc["indicator"]; }) :
                stateMap.performance_indicators_db({ theme: stateMap.theme, core: 1 })
                    .map(function(idoc){ return idoc["indicator"]; });
            redraw();
        });

        //listen to changes in region dropdown
        d3Map.d3region_dropdown.on("change", function(){
            stateMap.region = d3Map.d3region_dropdown.node().value;
            var cities = stateMap.member_cities_db(function(){
                return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
            }).get();

            stateMap.cities = stateMap.region === "all" ? cities :
                stateMap.member_cities_db(function(){
                    return stateMap.top50Cities.indexOf(this["CityName"]) >= 0 &&
                        this["Region"] === stateMap.region;
                }).get();
            redraw();
        });

        // window resizing
        d3.select(window).on('resize', redraw );

        //--------------------- END EVENT LISTENERS ----------------------

    };

    redraw = function(listonly){
        listonly = typeof listonly !== 'undefined' ? listonly : false;

        d3.transition()
        .duration(500)
        .each(function(){return renderAll(listonly);});

        function renderAll(listonly){
            list.metadb( stateMap.performance_indicators_db().get() );
            list.metadata( stateMap.indicators );
            list.data( stateMap.cities );

            list.render();

            if (!listonly){
                parallelChart.metadb( stateMap.performance_indicators_db().get() );
                parallelChart.metadata( stateMap.indicators );
                parallelChart.data( stateMap.cities );
                parallelChart.dispatch( dispatch );
                parallelChart.render();
            }
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

