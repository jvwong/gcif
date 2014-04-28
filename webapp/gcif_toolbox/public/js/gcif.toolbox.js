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
                '<h3 class="page-header">Tool: <span id="gcif-toolbox-tool-title"></span></h3>' +

                '<div class="row gcif-toolbox-tools">' +
                    '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool compare">' +
                        '<a href="#">' +
                            '<h4>Compare</h4>' +
                        '</a>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool similar">' +
                        '<a href="#">' +
                            '<h4>Similar</h4>' +
                        '</a>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool placeholder1">' +
                        '<h4></h4>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool placeholder2">' +
                        '<h4></h4>' +
                    '</div>' +
                '</div>' +

                '<div class="gcif-toolbox-compare"></div>' +
            '</div>'



    }
    , stateMap = {
        $container : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
    , display
    , tool
    , onClickTool
    , initModule
    ;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container;

        jqueryMap = {
               $container      : $container
             , $compare        : $container.find('.gcif-toolbox-compare')
             , $toolTitle      : $container.find('#gcif-toolbox-tool-title')
             , $toolSelection  : $container.find('.gcif-toolbox-tool')
             , $similar        : $container.find('.gcif-toolbox-similar')
        };
    };
    //--------------------- END DOM METHODS ----------------------



    // private method /display/
    display = function(tool){
        if(tool === "Compare"){
            gcif.compare.initModule( jqueryMap.$compare );
            gcif.compare.render();
        }
    };
    //end /display/


    //------------------- BEGIN EVENT HANDLERS -------------------

    onClickTool = function(e){
        // get the tool clicked
        configMap.tool = $(e.target).find("h4").html();
        jqueryMap.$toolTitle.html( configMap.tool );
        display(configMap.tool);
    };

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

        //register listeners
        jqueryMap.$toolSelection.click(onClickTool);
        $('.gcif-toolbox-tool.compare').click();

    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

