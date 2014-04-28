/*
 * gcif.toolbox.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.toolbox = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">' +
                '<h3 class="page-header">Toolbox</h3>' +

                '<div class="row gcif-shell-dash-toolbox">' +
                    '<div class="col-xs-6 col-sm-3 gcif-shell-dash-toolbox-select-compare">' +
                        '<h4>Comparison</h4>' +
                        '<span class="text-muted">Top 50 Reporting</span>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-3 gcif-shell-dash-toolbox-select-similar">' +
                        '<h4>Similarity</h4>' +
                        '<span class="text-muted">Top 50 Reporting</span>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-3 gcif-shell-dash-toolbox-select-placeholder1">' +
                        '<h4></h4>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-3 gcif-shell-dash-toolbox-select-placeholder2">' +
                        '<h4></h4>' +
                    '</div>' +
                '</div>' +

                '<div class="gcif-shell-dash-toolbox-compare"></div>' +
            '</div>'



    }
    , stateMap = {
        $container : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
    , display
    , initModule
    ;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container

        jqueryMap = {
               $container     : $container
             , $compare        : $container.find('.gcif-shell-dash-toolbox-compare')
             , $similar        : $container.find('.gcif-shell-dash-toolbox-similar')
        };
    };
    //--------------------- END DOM METHODS ----------------------



    // private method /display/
    display = function(){

        gcif.compare.initModule( jqueryMap.$compare );
        gcif.compare.render();

    };
    //end /display/


    //------------------- BEGIN EVENT HANDLERS -------------------

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------


    //------------------- BEGIN PUBLIC METHODS -------------------

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
        display();

    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

