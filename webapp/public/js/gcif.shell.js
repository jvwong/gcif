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

             '<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">' +
                  '<div class="container">' +
                    '<div class="navbar-header">' +
                      '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
                        '<span class="sr-only">Toggle navigation</span>' +
                        '<span class="icon-bar"></span>' +
                        '<span class="icon-bar"></span>' +
                        '<span class="icon-bar"></span>' +
                      '</button>' +
                      '<a class="navbar-brand" href="#">Project name</a>' +
                    '</div>' +
                    '<div class="collapse navbar-collapse">' +
                      '<ul class="nav navbar-nav">' +
                        '<li class="active"><a href="#">Home</a></li>' +
                        '<li><a href="#about">About</a></li>' +
                        '<li><a href="#contact">Contact</a></li>' +
                      '</ul>' +
                    '</div><!--/.nav-collapse -->' +
                  '</div>' +
                '</div>' +

            '<div class="content">' +
                '<div class="container">' +
                '</div>' +
            '</div>'


    }
    , stateMap = {
        $outerDiv : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $outerDiv = stateMap.$outerDiv

        jqueryMap = {
            $outerDiv   : $outerDiv
          , $content    : $outerDiv.find('.content')
          , $container  : $outerDiv.find('.container')

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
    initModule = function ( $outerDiv ) {

        //store container in stateMap
        stateMap.$outerDiv = $outerDiv;
        $outerDiv.html(configMap.main_html);
        setJqueryMap();

        // configure and initialize feature modules
//        gcif.dash.initModule( jqueryMap.$container );

    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

