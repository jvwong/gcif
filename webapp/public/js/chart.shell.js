/*
 * chart.shell.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, chart, crossfilter, d3 */

chart.shell = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
  configMap = {

      main_html : String() +

      '<div class="chart-shell-header">' +
        '<div class="chart-shell-header-title">' +
          '<h1>DASHBOARD</h1>' +
        '</div>' +
        '<a class="chart-shell-header-account-button"></a>' +
      '</div>' +

      '<div class="chart-shell-content">' +
        '<div class="chart-shell-content-main">' +
            '<div class="chart-shell-content-main-graphpad"></div>' +
        '</div>' +
      '</div>'

  }
  , stateMap = {
      $container : undefined
  }
  , jqueryMap = {}
  , setJqueryMap
  , handleResize
  , onResize, onTapAcct
  , onLogin,  onLogout
  , setChatAnchor
  , initModule;

  //---------------- END MODULE SCOPE VARIABLES --------------


  //--------------------- BEGIN DOM METHODS --------------------

  setJqueryMap = function(){
    var
      $container = stateMap.$container

    jqueryMap = {
        $container    : $container

      , $header       : $container.find('.chart-shell-header')
      , $acct         : $container.find('.chart-shell-header-account-button')

      , $content      : $container.find('.chart-shell-content')
      , $main         : $container.find('.chart-shell-content-main')
      , $graphpad     : $container.find('.chart-shell-content-main-graphpad')

      , $chooser_slider : $container.find('.chart-shell-slider.chooser')
      , $chat_slider  : $container.find('.chart-shell-slider.chat')

    };
  };

//  handleResize = function( $header, $main, $footer ){
//    var viewPortHeight = $(window).height()
//    , headerHeight = $header.height()
////    , footerHeight = $footer.height()
//    , contentHeight = viewPortHeight - headerHeight
//    ;
//    $main.css({'min-height': contentHeight * 0.90 + 'px'});
//  }

  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  // Begin Event handler /onResize/
  onResize = function () {
    if ( stateMap.resize_idto ) { return true; }

    chart.chat.handleResize();
    stateMap.resize_idto = setTimeout(
      function () { stateMap.resize_idto = undefined; },
      configMap.resize_interval
    );

    return true;
  };
  // End Event handler /onResize/

  onTapAcct = function ( event, ui ) {

    var user_name, user = chart.model.people.get_user();

    if ( user.get_is_anon() ) {
      user_name = prompt( 'Please sign-in' );
      chart.model.people.login(user_name);
      jqueryMap.$acct.html( '...' );
    }
    else {
      chart.model.people.logout();
    }

    return false;
  };

  onLogin = function ( event, login_user ) {
    jqueryMap.$acct.html( '<h3>' + chart.util_b.encodeHtml("Online") + '</h3>' );
  };

  onLogout = function ( event, logout_user ) {
    jqueryMap.$acct.html( '<h3>' + chart.util_b.encodeHtml("Chat") + '</h3>' );
  };


  //-------------------- END EVENT HANDLERS --------------------

  //---------------------- BEGIN CALLBACKS ---------------------


  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /initModule/
  // Example   : chart.shell.initModule( $('#app_div_id') );
  // Purpose   :
  //   Directs the Shell to offer its capability to the user
  // Arguments :
  //   * $content (example: $('#content')).
  //     A jQuery selection representing a single DOM container
  //   * $content (example: $('#content')).
  //     A jQuery selection representing a single DOM container
  //   * $content (example: $('#content')).
  //     A jQuery selection representing a single DOM container
  // Action    :
  //   Populates $container with the shell of the UI
  //   and then configures and initializes feature modules.
  // Returns   : none
  // Throws    : none

  initModule = function ( $container ) {

    var data_mode_str;

    // set data to fake if URI query argument set
    data_mode_str = window.location.search === '?fake' ? 'fake' : 'live';
    chart.model.setDataMode( data_mode_str );

    //store container in stateMap
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    // configure and initialize feature modules
    chart.graphpad.initModule( jqueryMap.$graphpad );
    chart.chat.configModule({
      set_chat_anchor : setChatAnchor,
      chat_model      : chart.model.chat,
      people_model    : chart.model.people
    });
    chart.chat.initModule( jqueryMap.$container );

    chart.chooser.configModule({
      set_chat_anchor : setChatAnchor,
      chat_model      : chart.model.chat,
      people_model    : chart.model.people
    });
    chart.chooser.initModule( jqueryMap.$container );

    //register the login button
    jqueryMap.$acct.html( '<h3>Chat</h3>' ).bind( 'click', onTapAcct );
    Hammer(jqueryMap.$header).on("swipeleft", function(event) {
      $.gevent.publish( 'chart-swipe-left', event );
    });
    Hammer(jqueryMap.$header).on("swiperight", function(event) {
      $.gevent.publish( 'chart-swipe-right', event );
    });

    // Handle URI anchor change events.
    $(window).bind( 'resize',     onResize );

    //subscribe to 'chart-login/logout' from model backend
    $.gevent.subscribe( $container, 'chart-login', onLogin );
    $.gevent.subscribe( $container, 'chart-logout', onLogout );

  };
  // End PUBLIC method /initModule/

  return { initModule: initModule };
  //------------------- END PUBLIC METHODS ---------------------
})();

