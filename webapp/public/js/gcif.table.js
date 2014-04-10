/*
 * chart.table.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif, chart */

gcif.table = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

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


    //------------------- BEGIN EVENT HANDLERS -------------------

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------

    //------------------- BEGIN PUBLIC METHODS -------------------

    setDataUrl = function(url){
        // do  nothing
    };

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

    };
    // End PUBLIC method /initModule/

    return {   initModule  : initModule
             , setDataUrl  : setDataUrl
            };
    //------------------- END PUBLIC METHODS ---------------------
})();

