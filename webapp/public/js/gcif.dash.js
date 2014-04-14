/*
 * gcif.dash.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.dash = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">' +
                '<h3 class="page-header">Data Source</h3>' +

                '<div class="row placeholders">' +
                    '<div class="col-xs-3 col-sm-3">' +
                        '<a href="#">' +
                            '<img src="assets/blue-pastel.png" class="img-responsive gcif-source" alt="Placeholder thumbnail" />' +
                            '<h4>Member</h4>' +
                            '<span class="text-muted">255 Total</span>' +
                        '</a>' +
                    '</div>' +
                    '<div class="col-xs-3 col-sm-3">' +
                        '<img src="assets/brown-pastel.png" class="img-responsive gcif-source" alt="Placeholder thumbnail" />' +
                        '<h4>US</h4>' +
                        '<span class="text-muted"></span>' +
                    '</div>' +
                    '<div class="col-xs-3 col-sm-3">' +
                        '<img src="assets/mint-pastel.png" class="img-responsive gcif-source" alt="Placeholder thumbnail" />' +
                        '<h4>China</h4>' +
                        '<span class="text-muted"></span>' +
                    '</div>' +
                    '<div class="col-xs-3 col-sm-3">' +
                        '<img src="assets/violet-pastel.png" class="img-responsive gcif-source" alt="Placeholder thumbnail" />' +
                        '<h4>Ontario</h4>' +
                        '<span class="text-muted"></span>' +
                    '</div>' +
                 '</div>' +

                '<div class="gcif-shell-dash-hbar"></div>'


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
             , $hbar      : $container.find('.gcif-shell-dash-hbar')
             , $table     : $container.find('.gcif-shell-dash-table')
        };
    };
    //--------------------- END DOM METHODS ----------------------



    // private method /renderGraphs/
    renderGraphs = function(dataurl){

        gcif.table.setDataUrl(dataurl);
        gcif.table.initModule( jqueryMap.$table );

        gcif.hbar.setDataUrl(dataurl);
        gcif.hbar.initModule( jqueryMap.$hbar );

    };
    //end /renderGraphs/


    //------------------- BEGIN EVENT HANDLERS -------------------

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------


    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /setDataUrl/
    // Example   : chart.graphpad.setDataSource( 'simpledata.json' );
    // Purpose   :
    //   Accepts a valid url pointing to a data source
    // Arguments :
    //   * url (example: '/usr/data/simpledata.json' )
    //     A string that should represent a url
    // Action    :
    //   Sets the configMap setDataUrl attribute
    // Returns   : none
    // Throws    : error if this is not a valid url for d3
    setDataUrl = function ( url ) {

        if (url){

            //store in stateMap
            configMap.data_url = url;

            //pass to graph functions
            try{
                renderGraphs(configMap.data_url);
            }
            catch(error){
                console.log(error);
            }

        }

    };
    // End PUBLIC method /initModule/



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
//        setDataUrl('./member_recent_category_counts.csv');
        setDataUrl('./china_category_counts.csv');

    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

