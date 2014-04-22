/*
 * gcif.similar.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.similar = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<h3 class="sub-header">Indicators</h3>' +

            '<div class="row">' +
            '<div>'


    }
    , stateMap = {
          $container : undefined
    }

    , jqueryMap = {}
    , d3Map= {}
    , setJqueryMap
    , setd3Map
    , render
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container;

        jqueryMap = {
              $container  : $container
        };
    };

    setd3Map = function(){
        d3Map = {
        };
    };


    // BEGIN private method /render/
    render = function(){
       var
          margin = {top: 50, right: 80, bottom: 10, left: 200}
        , width
        , height
        , svg;


        function setsvgdim(){

            var
              verticalScaling = 1
            ;

            width = $( window ).width() * 0.8 - margin.left - margin.right;
            height = $( window ).height() * verticalScaling - margin.top - margin.bottom;
        }


        function rendersvg(){

            //clear out any residual svg elements
            d3.select("svg").remove();

        }


        /* register event listeners*/
        d3.select(window).on('resize', resize);

        /* read in the data */
        d3.csv(dataurl, function(data) {

        });

        /* Update graph using new width and height (code below) */
        function resize() {
            setsvgdim();
            rendersvg();
            change();
        }


        function change() {
            d3.transition()
                .duration(750)
                .each(redraw);
        }


        function redraw() {

            //get the category
            var x;
        }


    };
    // END private method /render/

    //--------------------- END DOM METHODS ----------------------


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
        setd3Map();
        render();
    };
    // End PUBLIC method /initModule/

    return { initModule   : initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

