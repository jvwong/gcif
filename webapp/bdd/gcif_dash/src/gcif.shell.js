/*
 * gcif.shell.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.shell = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<div class="content">' +
                '<div class="container">' +

                    '<div class="row">' +
                        '<div class="span6" id="dc-barChart-population">' +
                            '<h4>Population</h4>' +
                        '</div>' +
                    '</div>' +

                    '<div class="row">' +
                        '<div class="span12" id="">' +
                        '</div>' +
                   ' </div>' +

                    '<div class="row">' +
                        '<div class="span12" id="table-chart">' +
                            '<table class="table table-hover" id="dc-dataTable-data">' +
                                '<thead>' +
                                    '<tr class="header">' +
                                        '<th>Date</th>' +
                                        '<th>Amount</th>' +
                                        '<th>Detail</th>' +
                                        '<th>Who</th>' +
                                    '</tr>' +
                                '</thead>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +

                '</div>' +
            '</div>'

    }
    , stateMap = {
        $container : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container

        jqueryMap = {
            $container    : $container
    //      , $header       : $container.find('.chart-shell-header')


        };
    };
    //--------------------- END DOM METHODS ----------------------



    //------------------- BEGIN EVENT HANDLERS -------------------

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------


    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /initModule/
    // Example   : chart.shell.initModule( $('.container') );
    // Purpose   :
    //   Directs the Shell to offer its capability to the user
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

    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

