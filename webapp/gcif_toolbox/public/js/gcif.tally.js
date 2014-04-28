/*
 * gcif.tally.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.tally = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">' +
                '<h3 class="page-header">Data Source</h3>' +

                '<div class="row gcif-data-sources">' +
                    '<div class="col-xs-6 col-sm-3 gcif-dash-source">' +
                        '<img src="assets/images/tally/blue-pastel.png" class="img-responsive gcif-dash-source-img" alt="member_recent" />' +
                        '<h4>Member</h4>' +
                        '<span class="text-muted">255 Reporting</span>' +
                    '</div>' +

                    '<div class="col-xs-6 col-sm-3 gcif-dash-source">' +
                        '<img src="assets/images/tally/brown-pastel.png" class="img-responsive gcif-dash-source-img" alt="china" />' +
                        '<h4>China</h4>' +
                        '<span class="text-muted">285 Reporting</span>' +
                    '</div>' +

                    '<div class="col-xs-6 col-sm-3 gcif-dash-source">' +
                        '<img src="assets/images/tally/mint-pastel.png" class="img-responsive gcif-dash-source-img" alt="nonmember" />' +
                        '<h4>Non-Member</h4>' +
                        '<span class="text-muted">8 Reported</span>' +
                    '</div>' +

                    '<div class="col-xs-6 col-sm-3 gcif-dash-source">' +
                        '<img src="assets/images/tally/violet-pastel.png" class="img-responsive gcif-dash-source-img" alt="ontario" />' +
                        '<h4>Other</h4>' +
                        '<span class="text-muted"></span>' +
                    '</div>' +
                 '</div>' +

                 '<div class="gcif-shell-dash-hbar"></div>' +
            '</div>'





    }
    , stateMap = {
        $container : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
    , renderGraphs
    , onClickSource
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container

        jqueryMap = {
               $container     : $container
             , $dataSourceImg : $container.find('.gcif-dash-source-img')
             , $hbar          : $container.find('.gcif-shell-dash-hbar')
             , $table         : $container.find('.gcif-shell-dash-table')
        };
    };
    //--------------------- END DOM METHODS ----------------------



    // private method /renderGraphs/
    renderGraphs = function( source ){

        gcif.hbar.setDataUrls( source );
        gcif.hbar.initModule( jqueryMap.$hbar );

    };
    //end /renderGraphs/


    //------------------- BEGIN EVENT HANDLERS -------------------

    onClickSource = function(e){

        // get the source clicked from the "alt" attribute
        configMap.data_source =  e.currentTarget["alt"];

        // push that source as a prefix to the data urls generated within the graph modules
        renderGraphs(configMap.data_source);

    };

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------


    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /setDataSource/
    // Example   : gcif.dash.setDataSource( 'simpledata.json' );
    // Purpose   :
    //   Accepts a string indicating the data source to prefix a data file name with
    // Arguments :
    //   * source (example: 'china' )
    // Action    :
    //   Sets the configMap setDataSource attribute
    // Returns   : none
    // Throws    : error if this is not a valid url for d3
//    setDataSource = function ( source ) {
//
//        if (source){
//
//            //store in stateMap
//            configMap.data_source = source;
//
//            //pass to graph functions
//            try{
//                renderGraphs(source);
//            }
//            catch(error){
//                console.log(error);
//            }
//
//        }
//
//    };
    // End PUBLIC method /setDataSource/



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
        jqueryMap.$dataSourceImg.click(onClickSource);

    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

