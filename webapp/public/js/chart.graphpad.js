/*
 * chart.graphpad.js
 * Coordinating module for individual graph
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, chart, crossfilter, d3 */

chart.graphpad = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
  configMap = {

    main_html : String()

      + '<div class="chart-graphpad bar brushable graph delay"></div>'
      + '<div class="chart-graphpad bar brushable graph distance"></div>'
//      + '<div class="chart-graphpad table graph"></div>'

    , data_url : null
  },
  stateMap = {
      $container          : undefined
    , data                : new Array()
    , charts              : new Array()
    , drag_map            : null
    , $drag_target        : null
  }

  , jqueryMap = {}
  , setJqueryMap
  , d3Map = {}
  , setd3Map
  , renderGraphs
  , onTapGraph, onHeldstartGraph, onHeldmoveGraph, onHeldendGraph, updateGraph, bindSelections
  , setDataUrl, initModule
  ;

  //---------------- END MODULE SCOPE VARIABLES --------------


  //--------------------- BEGIN DOM METHODS --------------------

  setJqueryMap = function(){
    var $container = stateMap.$container;
        jqueryMap = {
        $container      : $container
      };
  };

  setd3Map = function(){

    d3Map = {
        graphs         : d3.selectAll('.graph')
      , tables         : d3.selectAll('.table.graph')
      , bars           : d3.selectAll('.bar.graph')
      , scatters       : d3.selectAll('.scatter.graph')
    };

  };



  //--------------------- END DOM METHODS ----------------------


  // Begin public method /renderGraphs/
  // Example   : chart.graphpad();
  // Purpose   :
  // Arguments :
  //   * position_type - enum('closed', 'opened', or 'hidden')  //
  // Action    :
  //   This method
  // Returns   : none
  // Throws    : none
  //
  // private method /renderGraphs/
  renderGraphs = function(data){

    stateMap.$container.html(configMap.main_html);
    setJqueryMap();
    setd3Map();

    var parseDate = function(data) {
      return new Date(2001,
        data.substring(0, 2) - 1,
        data.substring(2, 4),
        data.substring(4, 6),
        data.substring(6, 8));
    };

    /* utilities */
    data.forEach(function(d, i) {
      d.index = i;
      d.date = parseDate(d.date);
      d.delay = +d.delay;
      d.distance = +d.distance;
    });

    /* Crossfilter */
    var
    cf = crossfilter(data)
    , all = cf.groupAll()
    , binwidth_hour = 1
    , hour = cf.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; })
    , hours = hour.group(Math.floor)
    , binwidth_delay = 10
    , delay = cf.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); })
    , delays = delay.group(function(d) { return Math.floor(d / binwidth_delay ) * binwidth_delay; })
    , delay2 = cf.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); })
    , delays2 = delay2.group(function(d) { return Math.floor(d / binwidth_delay ) * binwidth_delay; })

    , binwidth_dist = 50
    , distance = cf.dimension(function(d) { return Math.min(1999, d.distance); })
    , distances = distance.group(function(d) { return Math.floor(d / binwidth_dist) * binwidth_dist; })

    , date = cf.dimension(function(d) { return d.date; })

    , panel_width = 300
    , panel_height = 150
    , panel_margin = { top : 20, right : 50, bottom : 50, left : 80}


    /* bar-specific stuff */
    , data_array = [
          delays.all()
        , distances.all()
      ]
    , chart_array = [
        chart.bar.barChart()
          .dimension(delay)
          .xScale(d3.scale.linear()
            .domain([-60, 150])
            .rangeRound([0, panel_width - panel_margin.left - panel_margin.right])
          )
          .yScale(d3.scale
            .linear()
            .rangeRound([(panel_height - panel_margin.top - panel_margin.bottom), 0])
          )
          .xValue( function(d,i){ return d.key; } )
          .yValue( function(d,i){ return d.value; } )
          .panel_width(panel_width)
          .panel_height(panel_height)
          .margin(panel_margin)
          .binWidth(binwidth_delay)
          .bargap(1)
          .xlabel("Hours")
          .ylabel("Counts")
          .title("Delays")

      , chart.bar.barChart()
          .dimension(distance)
          .xScale(d3.scale.linear()
            .domain([0, 2000])
            .rangeRound([0, panel_width - panel_margin.left - panel_margin.right])
          )
          .yScale(d3.scale
            .linear()
            .rangeRound([(panel_height - panel_margin.top - panel_margin.bottom), 0])
          )
          .xValue( function(d,i){ return d.key; } )
          .yValue( function(d,i){ return d.value; } )
          .panel_width(panel_width)
          .panel_height(panel_height)
          .margin(panel_margin)
          .binWidth(binwidth_dist)
          .bargap(1)
          .xlabel("Distance (mi)")
          .ylabel("Counts")
          .title("Distance")
    ]
    ;

    /* generic rendering */
    //this is temporary hack -- graphs, data, and selections will be pushed in
    stateMap.data       = data_array;
    stateMap.charts     = chart_array;

    //bind the data
    d3Map.graphs.data(stateMap.data);
    chart.util.renderAll(d3Map.graphs, stateMap.charts);

    //register listeners for all graphs
    stateMap.charts.forEach( function(c, index) {
      c.on("brush", function(){ chart.util.renderAll(d3Map.graphs, stateMap.charts); })
       .on("brushend", function(){ chart.util.renderAll(d3Map.graphs, stateMap.charts); });
    });

    //this resets the filter of the given chart
    window.chart_reset = function(i, type) {
      var array;
      switch(type)
      {
        case "bar":
          array = stateMap.charts;
          break;
        default:
          array = [];
      }
      array[i].filter(null);
      chart.util.renderAll(d3Map.graphs, stateMap.charts);
    };

    /* bind elements */
    bindSelections( $('.graph .title') );



    /* table-specific stuff */
//    , formatNumber = d3.format(",d") //integer
//    , formatChange = d3.format("+,d")//use positive and negative signs
//    , formatDate = d3.time.format("%B %d, %Y")// full month name, zero-padded day of the month as a decimal number [01,31], year with century as a decimal number.
//    , formatTime = d3.time.format("%I:%M %p")// hour (12-hour clock) as a decimal number [01,12], minute as a decimal number [00,59],  either AM or PM
//
//    , column_definitions = [
//        { "name" : "time", "accessor" : function(d) { return formatTime(d.date); } }
//      , { "name" : "origin", "accessor" : function(d) { return d.origin; } }
//      , { "name" : "destination", "accessor" : function(d) { return d.destination; } }
//      , { "name" : "distance", "accessor" : function(d) { return formatNumber(d.distance) + " mi"; } }
//      , { "name" : "delay", "accessor" : function(d) { return formatChange(d.delay) + " min"; } }
//    ]
//
//    , nest_accessor = d3.nest().key(function(d) { return d3.time.day(d.date); })
//    , subhead_accessor = function(d) { return formatDate( d.values[0].date ); }
//    , table_array = [
//      chart.table.tableChart()
//        .title("Flight Data")
//        .dimension(date)
//        .num_rows(25)
//        .panel_width(panel_width*1.8)
//        .panel_height(panel_height*1.8)
//        .margin(panel_margin)
//        .column_definitions(column_definitions)
//        .nest_accessor(nest_accessor)
//        .subhead_accessor(subhead_accessor)
//    ]

  };
  //end /renderGraphs/

  //------------------- BEGIN EVENT HANDLERS -------------------

  //begin /onTapGraph/
  onTapGraph = function(event, ui){

    var $all, $target;

    $target = $(event.elem_target).closest(".chart-graphpad.graph");
    $all = $(".chart-graphpad.graph");

    $all.removeClass("selected");
    $all.children(".title").css({  "background-color": "#C6C6AA"
                                 , "color" : "black"
                                });
    $all.css( "z-index", 0 );

    if ( $target.length === 0 ){ return false; }
    $target.addClass("selected");
    $target.children(".title").css({  "background-color": "steelblue"
                                    , "color" : "white"
                                  });
    $target.css( "z-index", 1 );

  };
  //end/onTapGraph/


  //begin /onHeldstartGraph/
  onHeldstartGraph = function ( event ){

    var offset_target_map, offset_nav_map,
      $target = $( event.elem_target ).closest(".chart-graphpad.graph");

    if ( $target.length === 0 ){ return false; }

    onTapGraph( event );

    stateMap.$drag_target = $target;
    offset_target_map = $target.offset();
    offset_nav_map    = jqueryMap.$container.offset();

    offset_target_map.top  -= offset_nav_map.top;
    offset_target_map.left -= offset_nav_map.left;

    stateMap.drag_map      = offset_target_map;

    $target.addClass('chart-x-is-drag');
  };
  //end /onHeldstartGraph/

  //begin /onHeldmoveGraph/
  onHeldmoveGraph = function ( event ){
    var drag_map = stateMap.drag_map;
    if ( ! drag_map ){ return false; }

    drag_map.top  += event.px_delta_y;
    drag_map.left += event.px_delta_x;

    stateMap.$drag_target.css({
      top : drag_map.top, left : drag_map.left
    });
  };
  //end /onHeldmoveGraph/

  //begin /onHeldendGraph/
  onHeldendGraph = function ( event ) {
    var $drag_target = stateMap.$drag_target;
    if ( ! $drag_target ){ return false; }

    $drag_target
      .removeClass('chart-x-is-drag');

//    stateMap.drag_bg_color= undefined;
    stateMap.$drag_target = null;
    stateMap.drag_map     = null;
    updateGraph( $drag_target );
  };
  //end /onHeldendGraph/


  updateGraph = function ( $target ){
    var css_map, person_id;

    css_map = {
      top  : parseInt( $target.css( 'top'  ), 10 )
      , left : parseInt( $target.css( 'left' ), 10 )
    };
    person_id = $target.attr( 'data-id' );

//    configMap.chat_model.update_avatar({
//      person_id : person_id, css_map : css_map
//    });
  };

  bindSelections = function( $selector ){

//    console.log( $selector );

    $selector
      .bind( 'utap', onTapGraph )
      .bind( 'udragstart', onHeldstartGraph )
      .bind( 'udragmove',  onHeldmoveGraph  )
      .bind( 'udragend',   onHeldendGraph   );

    jqueryMap.$container
      .bind( 'utap', onTapGraph );

  }


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

    //store container in stateMap
    if (url){

      configMap.data_url = url;

      //note the hack is just the url for a local file....should upload file I guess.
      try{
        d3.csv(configMap.data_url, function(data){ renderGraphs(data); });
      }
      catch(error){
        console.log(error);
      }

    }

  };
  // End PUBLIC method /initModule/


  // Begin Public method /initModule/
  // Example   : chart.graphpad.initModule( $('#app_div_id') );
  // Purpose   :
  //   Coordinates the individual graphs to be offered to user
  // Arguments :
  //   * $container (example: $('#app_div_id')).window
  //     A jQuery collection that should represent
  //     a single DOM container
  // Action    :
  //   Populates $container with the graphpad DOM element
  //   and then initializes individual graph modules contained therein.
  // Returns   : none
  // Throws    : none

  initModule = function ( $container ) {

    //store container in stateMap
    stateMap.$container = $container;
    setDataUrl('flights-3m-500.json');

  };
  // End PUBLIC method /initModule/

  return {    initModule : initModule
            , setDataUrl : setDataUrl
         };
  //------------------- END PUBLIC METHODS ---------------------
})();

