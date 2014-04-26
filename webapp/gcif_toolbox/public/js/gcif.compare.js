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
                    '<li class=""><a href="#images" data-toggle="tab">Images</a></li>' +
                '</ul>' +
                '<div id="myTabContent" class="tab-content">' +
                    '<div class="tab-pane fade active in" id="graphical">' +
                        '<form class="form" role="form">' +
                            '<div class="form-group gcif-compare graphical menu">' +
                                '<label for="category-dropdown" class="col-sm-1 control-label">Theme</label>' +
                                '<div class="col-sm-11">' +
                                    '<select id="theme-dropdown" class="form-control"></select>' +
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
                                    '<button type="button" class="btn btn-default" id="save-png">' +
                                        '<span class="glyphicon glyphicon-picture"></span>' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div class="gcif-compare chart col-lg-12"></div>' +
                    '</div>' +

                    '<div class="tab-pane fade" id="tabular">' +
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

                    '<div class="tab-pane fade" id="images">' +
                        '<div class="gcif-compare images col-lg-12"></div>' +
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
//          , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE",
//                                         "BELO HORIZONTE","BUENOS AIRES","GOIANIA","PEORIA","SAANICH","SANTA ANA",
//                                         "DALLAS","LVIV","SASKATOON","TUGUEGARAO","CALI","HAMILTON","ILE-DE-FRANCE",
//                                         "HAIPHONG","LISBON","MILAN","OLONGAPO","CANCUN","DURBAN","MOMBASA","TRUJILLO",
//                                         "OSHAWA","SAO BERNARDO DO CAMPO","SURREY","KRYVYI RIH","PUERTO PRINCESA",
//                                         "MAKATI","PORT OF SPAIN","KABANKALAN","MUNOZ","RIGA","SAO PAULO","TACURONG",
//                                         "ZAMBOANGA","BALANGA","BEIT SAHOUR","ISTANBUL","CLARINGTON","MEDICINE HAT",
//                                         "VAUGHAN","LAOAG","GUELPH","KING COUNTY","SANA'A","BOGOR"]
          , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE"]
          , top5Themes                : ["education","finance","health","safety","urban planning"]
    }

    , jqueryMap = {}
    , d3Map= {}
    , setJqueryMap
    , setd3Map
    , render
    , dispatch = d3.dispatch("brush", "data_update", "load_cities", "load_indicators", "load_themes", "done_load")
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

            , d3clear_highlights  : d3.select(".btn-group.gcif-compare.graphical button#clear-highlights")
            , d3clear_brushes     : d3.select(".btn-group.gcif-compare.graphical button#clear-brushes")
            , d3isolate_brushed   : d3.select(".btn-group.gcif-compare.graphical button#isolate-brushed")
            , d3refresh           : d3.select(".btn-group.gcif-compare.graphical button#refresh")
            , d3theme_dropdown    : d3.select(".form-group.gcif-compare.graphical.menu select#theme-dropdown")

            , d3table             : d3.select(".gcif-compare.table")
            , d3export_csv        : d3.select(".btn-group.gcif-compare.tabular button#export-csv")
            , d3downloadanchor    : d3.select(".btn-group.gcif-compare.tabular a")

            , d3export_png        : d3.select(".btn-group.gcif-compare.graphical button#save-png")

            , d3images             : d3.select(".gcif-compare.images")
        };
    };


    // BEGIN private method /render/
    render = function(){

        var
        parallelChart
        , list
        ;

        /* rendering */
        function renderAll() {
            list.metadata( stateMap.indicators );
            list.data( stateMap.cities );
            parallelChart.metadata( stateMap.indicators );
            parallelChart.data( stateMap.cities );
            parallelChart.dispatch( dispatch );

            list.render();
            parallelChart.render();
        }

        /* Update graph using new width and height (code below) */
        function change() {
            d3.transition()
            .duration(700)
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

        function getData() {
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
        }

        /* event listeners */
        //list for dispatch events
        dispatch.on("data_update", function(){
            list.data( stateMap.cities );
            list.render();
        });

        dispatch.on("load_cities", function(data){
            stateMap.member_cities_db.insert(data);
            //cache the cities in the stateMap
            stateMap.cities = stateMap.member_cities_db(function(){
                //only include the top 50 cities by indicator count
                return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
            }).get();
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

        //table button for exporting csv
        d3Map.d3export_png.on("click", function(){
            var html = d3.select("svg")
                .attr("version", 1.1)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .node().parentNode.innerHTML;

            console.log(d3Map.d3images);
            var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
            var img = '<img src="'+ imgsrc +'">';
            d3Map.d3images.html(img);

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
            renderAll();
        });

        //listen to the clear all button
        d3Map.d3refresh.on("click", function(){
            resetState();
            getData();
        });

        //listen to changes in theme dropdown
        d3Map.d3theme_dropdown.on("change", function(){
            stateMap.theme = d3Map.d3theme_dropdown.node().value;
            stateMap.indicators = stateMap.theme === "all" ?
                stateMap.abundant_themes_db()
                    .map(function(idoc){ return idoc["indicator"]; }) :
                stateMap.performance_indicators_db({ theme: stateMap.theme, core: 1 })
                    .map(function(idoc){ return idoc["indicator"]; });
            change();
        });

        // window resizing
        d3.select(window).on('resize', renderAll );

        /* Load the data, then draw */
        getData();
        dispatch.on("done_load", function(){
            parallelChart = gcif.parallel.Parallel( d3Map.d3compare );
            list = gcif.table.Table( d3Map.d3table );
            change();
        });


    };
    // END private method /render/

    //--------------------- END DOM METHODS ----------------------


    //--------------------- BEGIN DISPATCH LISTENERS ----------------------
    dispatch.on("brush", function(brusheddata){
        stateMap.cities = brusheddata;
        console.log(brusheddata.length);
        console.log(brusheddata);
        var u = stateMap.cities.map( function(d){ return d["CityName"]; } );
        console.log(u);
        dispatch.data_update();
    });

    //--------------------- END DISPATCH LISTENERS ----------------------


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

