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
                            '<div class="gcif-correlate chart col-lg-12"></div>' +
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
            , theme                     : undefined

            , color                     : undefined

            , member_cities_db          : TAFFY()
            , performance_indicators_db : TAFFY()

            , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE",
                "BELO HORIZONTE","BUENOS AIRES","GOIANIA","PEORIA","SAANICH","SANTA ANA",
                "DALLAS","LVIV","SASKATOON","TUGUEGARAO","CALI","HAMILTON","ILE-DE-FRANCE",
                "HAIPHONG","LISBON","MILAN","OLONGAPO","CANCUN","DURBAN","MOMBASA","TRUJILLO",
                "OSHAWA","SAO BERNARDO DO CAMPO","SURREY","KRYVYI RIH","PUERTO PRINCESA",
                "MAKATI","PORT OF SPAIN","KABANKALAN","MUNOZ","RIGA","SAO PAULO","TACURONG",
                "ZAMBOANGA","BALANGA","BEIT SAHOUR","ISTANBUL","CLARINGTON","MEDICINE HAT",
                "VAUGHAN","LAOAG","GUELPH","KING COUNTY","SANA'A","BOGOR"]
//          , top50Cities                 : ["AMMAN","TORONTO","BOGOTA"]
          , top5Themes                  : ["education","finance","health","safety","urban planning"]

          , dummydata                   : TAFFY()

          , xValue                      : "Percentage of students completing primary education"
          , yValue                      : "Average life expectancy"
          , title                       : "Graph"
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
        };
    };

    setd3Map = function(){
        d3Map = {
              d3correlate           : d3.select(".gcif-correlate.chart")
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
        stateMap.theme      = undefined;
        stateMap.indicators = undefined;
        stateMap.cities     = undefined;
        stateMap.member_cities_db = TAFFY();
        stateMap.performance_indicators_db = TAFFY();
    };

    loadData = function(){
        d3.json("/performance_indicators/list", function(performance_indicators_data) {
            dispatch.load_indicators(performance_indicators_data);
        });

        d3.json("/member_cities/list", function(member_cities_data) {
            d3.json("/chinese_cities/list", function(chinese_cities_data) {
                stateMap.dummydata = [{"ARF": 1.7148437500001736, "E2F": 1.7031250000002176, "FCS": 427, "MYC": 1.3398437500001052, "SCS": 176.2356440572}, {"ARF": 1.2656250000002096, "E2F": 1.1289062500000158, "FCS": 209, "MYC": 2.9140625000000004, "SCS": 118.636615905}, {"ARF": 1.1953125000008393, "E2F": 1.1562500000009206, "FCS": 325, "MYC": 0.0312499999913847, "SCS": 81.3123008063}, {"ARF": 1.445312499999512, "E2F": 1.2812499999998999, "FCS": 445, "MYC": 1.0, "SCS": 105.5449600879}, {"ARF": 1.2812499999998999, "E2F": 1.4843750000004234, "FCS": 264, "MYC": 0.8828125000009474, "SCS": 100}, {"ARF": 1.0195312499998948, "E2F": 0.8789062499999332, "FCS": 316, "MYC": 0.14062500001322653, "SCS": 92.2239565104}, {"ARF": 1.4335937500002853, "E2F": 0.7031250000027985, "FCS": 354, "MYC": 0.8242187499991215, "SCS": 121.8814184842}, {"ARF": 1.445312499999512, "E2F": 0.6562499999999216, "FCS": 355, "MYC": 0.9218750000011302, "SCS": 122.9826225656}, {"ARF": 1.1914062499986098, "E2F": 0.7187499999987595, "FCS": 351, "MYC": 0.7382812500017283, "SCS": 96.4661619911}, {"ARF": 1.4140624999993279, "E2F": 1.0625000000002038, "FCS": 433, "MYC": 1.378906250000338, "SCS": 135.7727142105}, {"ARF": 1.4335937500002853, "E2F": 0.8906250000006839, "FCS": 348, "MYC": 2.7968750000000098, "SCS": 118.636615905}, {"ARF": 1.531249999999673, "E2F": 1.4648437499995355, "FCS": 485, "MYC": 1.003906249999377, "SCS": 114.4441900797}, {"ARF": 1.2226562500011542, "E2F": 0.6757812499988898, "FCS": 249, "MYC": 0.38281250000779954, "SCS": 86.596432336}, {"ARF": 0.9570312499987697, "E2F": 0.7421874999994419, "FCS": 367, "MYC": 0.32031250000442063, "SCS": 98.2171889188}, {"ARF": 1.5664062500005638, "E2F": 1.4804687499998972, "FCS": 448, "MYC": 2.027343749999825, "SCS": 243.6232598152}, {"ARF": 1.417968750000763, "E2F": 1.0859374999991842, "FCS": 458, "MYC": 0.4453124999979543, "SCS": 87.3788349853}, {"ARF": 1.511718749999969, "E2F": 0.7890625000006796, "FCS": 435, "MYC": 0.5039062499960383, "SCS": 106.498563535}, {"ARF": 1.531249999999673, "E2F": 0.7265625000028006, "FCS": 319, "MYC": 3.1210937499999973, "SCS": 176.2356440572}, {"ARF": 1.3945312499992797, "E2F": 0.7421874999994419, "FCS": 414, "MYC": 2.964843749999989, "SCS": 187.6884293576}, {"ARF": 1.0429687500010236, "E2F": 1.0664062499987987, "FCS": 329, "MYC": 2.4921875000000413, "SCS": 100.9035044841}, {"ARF": 1.2929687499999103, "E2F": 0.8671874999992759, "FCS": 402, "MYC": 0.9648437499979169, "SCS": 104.599895343}, {"ARF": 1.5585937499997586, "E2F": 1.179687499999821, "FCS": 421, "MYC": 2.753906249999967, "SCS": 182.6916717941}, {"ARF": 1.519531249999738, "E2F": 0.9492187500000815, "FCS": 286, "MYC": 2.5976562500000226, "SCS": 161.0761534618}, {"ARF": 1.58593749999965, "E2F": 1.593749999999498, "FCS": 248, "MYC": 2.3007812500001066, "SCS": 171.5437896343}, {"ARF": 1.9218750000000904, "E2F": 0.8671874999992759, "FCS": 456, "MYC": 0.5976562499979388, "SCS": 102.7350768179}, {"ARF": 0.683593749996948, "E2F": 0.49218749999654554, "FCS": 249, "MYC": 2.621093749999969, "SCS": 58.820843762}, {"ARF": 1.6015625000000124, "E2F": 1.2500000000002631, "FCS": 353, "MYC": 1.1757812499999245, "SCS": 122.9826225656}, {"ARF": 1.6445312499995133, "E2F": 1.2148437500004112, "FCS": 369, "MYC": 2.2265625000000417, "SCS": 248.0454414314}, {"ARF": 1.5273437500001432, "E2F": 1.1757812499999245, "FCS": 380, "MYC": 0.6523437500010222, "SCS": 84.2910085028}, {"ARF": 0.9570312499987697, "E2F": 1.1953125000008393, "FCS": 235, "MYC": 0.7968750000021592, "SCS": 71.0497411443}, {"ARF": 1.3007812499992373, "E2F": 0.69921875000215, "FCS": 307, "MYC": 0.7109375000024072, "SCS": 100}, {"ARF": 1.6796874999996558, "E2F": 0.9609375000021428, "FCS": 401, "MYC": 2.9609375000000044, "SCS": 182.6916717941}, {"ARF": 1.3515624999994889, "E2F": 1.0703124999997373, "FCS": 221, "MYC": 0.8437500000000832, "SCS": 112.4038663772}, {"ARF": 1.1015624999984641, "E2F": 0.828124999997098, "FCS": 263, "MYC": 2.6054687499999525, "SCS": 81.3123008063}, {"ARF": 1.3320312500006048, "E2F": 0.6367187500041303, "FCS": 223, "MYC": 1.1367187500010922, "SCS": 115.4781984689}, {"ARF": 1.574218749999463, "E2F": 1.6250000000004303, "FCS": 419, "MYC": 1.1601562500007774, "SCS": 88.964911282}, {"ARF": 1.6250000000004303, "E2F": 0.9374999999999672, "FCS": 292, "MYC": 2.933593749999979, "SCS": 145.9024215631}];
                dispatch.load_cities(member_cities_data, chinese_cities_data);
                dispatch.done_load();
            });
        });

//        d3.json("assets/data/performance_indicators.json", function(performance_indicators_data) {
//            dispatch.load_indicators(performance_indicators_data);
//        });
//
//        d3.json("assets/data/member_cities.json", function(member_cities_data) {
//            dispatch.load_cities(member_cities_data);
//            dispatch.done_load();
//        });
    };

    loadListeners = function(){
        //--------------------- BEGIN EVENT LISTENERS ----------------------

        dispatch.on("data_update", function(){
            redraw(true);
        });

        dispatch.on("load_cities", function(data){
            stateMap.member_cities_db.insert(data);
            stateMap.cities = stateMap.member_cities_db(function(){
                return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
            }).get();
        });

        dispatch.on("load_indicators", function(data){
            stateMap.performance_indicators_db.insert(data);
            stateMap.indicators = stateMap.performance_indicators_db(function(){
                return stateMap.top5Themes.indexOf(this["theme"]) >= 0;
            }).get();
        });

        // window resizing
        d3.select(window).on('resize', redraw );

        //--------------------- END EVENT LISTENERS ----------------------

    };

    redraw = function(){
        d3.transition()
            .duration(500)
            .each(renderAll);

        function renderAll(){
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

