/*
 * chart.chat.js
 * Chat feature module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, chart */

chart.chat = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      settable_map : {
          slider_open_time    : true
        , slider_close_time   : true
        , slider_opened_em    : true
        , slider_closed_em    : true
        , slider_opened_title : true
        , slider_closed_title : true

        , chat_model      : true
        , people_model    : true
        , set_chat_anchor : true

      }
      , slider_open_time     : 250

      , slider_close_time    : 250
      , main_html : String()
        + '<div class="chart-chat">'


          + '<div class="chart-chat-head">'
              + '<div class="chart-chat-head-title">CHAT</div>'
              + '<div class="chart-chat-head-min">-</div>'
          + '</div>'


          + '<div class="chart-chat-sizer">'

            + '<div class="chart-chat-msg">'

              + '<span class="chart-chat-sizer-box-title">Messages</span>'
              + '<div class="chart-chat-msg-log"></div>'

              + '<div class="chart-chat-msg-in">'
                + '<form class="chart-chat-msg-form">'
                  + '<input type="text"/>'
                  + '<input type="submit" style="display:none"/>'
//                  + '<div class="chart-chat-msg-send">send</div>'
                + '</form>'
              + '</div>'

            + '</div>'

            + '<div class="chart-chat-list">'
              + '<span class="chart-chat-sizer-box-title">Users</span>'
              + '<div class="chart-chat-list-box"></div>'
            + '</div>'

        + '</div>'
      , slider_opened_em     : 20
      , slider_closed_em     : 2
      , slider_opened_right  : -2
      , slider_hidden_right  : -19.5
      , slider_closed_right  : -20
      , slider_opened_title  : 'Minimize'
      , slider_closed_title  : 'Open'
      , slider_opened_min_em : 10
      , window_width_min_em  : 40

      , chat_model      : null
      , people_model    : null
      , set_chat_anchor : null
    },
    stateMap  = {
      $append_target      : null
    , position_type       : 'closed'
    , px_per_em           : 0
    , slider_closed_right : 0
    , slider_hidden_right : 0
    , slider_opened_right : 0
    , isOnline : false
    }

    , jqueryMap = {}

    , setJqueryMap,  setPxSizes,   scrollChat
    , writeChat,     writeAlert,   clearChat
    , onSubmitMsg,   onTapList
    , onSetchatee,   onUpdatechat, onListchange
    , onLogin,       onLogout
    , configModule,  initModule
    , setSliderPosition
    , onTapToggle, removeSlider,  handleResize
    ;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var
      $append_target = stateMap.$append_target
    , $slider        = $append_target.find( '.chart-chat' );

    jqueryMap = {
        $slider       : $slider
      , $head         : $slider.find( '.chart-chat-head' )
      , $minimize     : $slider.find( '.chart-chat-head-min' )
      , $title        : $slider.find( '.chart-chat-head-title' )
      , $sizer        : $slider.find( '.chart-chat-sizer' )
      , $list_box     : $slider.find( '.chart-chat-list-box' )
      , $msg_log      : $slider.find( '.chart-chat-msg-log' )
      , $msg_in       : $slider.find( '.chart-chat-msg-in' )
      , $input        : $slider.find( '.chart-chat-msg-in input[type=text]')
      , $send         : $slider.find( '.chart-chat-msg-send' )
      , $form         : $slider.find( '.chart-chat-msg-form' )
      , $window       : $(window)
    };
  };
  // End DOM method /setJqueryMap/

//  // Begin DOM method /setPxSizes/
  setPxSizes = function () {
    var px_per_em, window_width_em, opened_width_em;

    px_per_em = chart.util_b.getEmSize( jqueryMap.$slider.get(0) );
    window_width_em = Math.floor(
      ( jqueryMap.$window.width() / px_per_em ) + 0.5
    );

    opened_width_em
      = window_width_em > configMap.window_width_min_em
      ? configMap.slider_opened_em
      : configMap.slider_opened_min_em;

    stateMap.px_per_em            = px_per_em;
    stateMap.slider_closed_right  = configMap.slider_closed_right;
    stateMap.slider_hidden_right  = configMap.slider_hidden_right;
    stateMap.slider_opened_right  = configMap.slider_opened_right;
    jqueryMap.$sizer.css({
      width : ( opened_width_em - 2 ) * px_per_em
    });
    jqueryMap.$slider.css({
      width : ( opened_width_em ) * px_per_em
    });
  };
//  // End DOM method /setPxSizes/

  // Begin public method /setSliderPosition/
  // Example   : chart.chat.setSliderPosition( 'closed' );
  // Purpose   : Move the chat slider to the requested position
  // Arguments :
  //   * position_type - enum('closed', 'opened', or 'hidden')
  //   * callback - optional callback to be run end at the end
  //     of slider animation.  The callback receives a jQuery
  //     collection representing the slider div as its single
  //     argument
  // Action    :
  //   This method moves the slider into the requested position.
  //   If the requested position is the current position, it
  //   returns true without taking further action
  // Returns   :
  //   * true  - The requested position was achieved
  //   * false - The requested position was not achieved
  // Throws    : none
  //
  setSliderPosition = function ( position_type, callback ) {

    var
      right_em, animate_time, slider_title, toggle_text;

    // position type of 'opened' is not allowed for anon user;
    // therefore we simply return false; the shell will fix the
    // uri and try again.
    if ( position_type === 'opened' && configMap.people_model.get_user().get_is_anon()){
      return false;
    }

    // return true if slider already in requested position
    if ( stateMap.position_type === position_type ){
      if ( position_type === 'opened' ) {
        jqueryMap.$input.focus();
      }
      return true;
    }

    // prepare animate parameters
    switch ( position_type ){
      case 'opened' :
        right_em     = stateMap.slider_opened_right;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text  = '-';
      break;

      case 'hidden' :
        right_em     = stateMap.slider_hidden_right;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '+';
      break;

      case 'closed' :
        right_em     = stateMap.slider_closed_right;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '-';
      break;

      // bail for unknown position_type
      default : return false;
    }

    // animate slider position change
    stateMap.position_type = '';
    jqueryMap.$slider.animate(
      { right : right_em + "em" },
      animate_time,
      function () {
        jqueryMap.$minimize.prop( 'title', slider_title );
        jqueryMap.$minimize.text( toggle_text );
        stateMap.position_type = position_type;
        if ( callback ) { callback( jqueryMap.$slider ); }
      }
    );
    return true;
  };
  // End public DOM method /setSliderPosition/



  // Begin private DOM methods to manage chat message
  scrollChat = function() {
    var $msg_log = jqueryMap.$msg_log;
    $msg_log.animate(
      { scrollTop : $msg_log.prop( 'scrollHeight' ) - $msg_log.height() },
      150
    );
  };

  writeChat = function ( person_name, text, is_user ) {
    var msg_class = is_user
      ? 'chart-chat-msg-log-me' : 'chart-chat-msg-log-msg';

    jqueryMap.$msg_log.append(
      '<div class="' + msg_class + '">'
      + chart.util_b.encodeHtml(person_name) + ': '
      + chart.util_b.encodeHtml(text) + '</div>'
    );

    scrollChat();
  };

  writeAlert = function ( alert_text ) {
    jqueryMap.$msg_log.append(
      '<div class="chart-chat-msg-log-alert">'
        + chart.util_b.encodeHtml(alert_text)
      + '</div>'
    );
    scrollChat();
  };

  //on logout clear out the contents
  clearChat = function () {
    jqueryMap.$msg_log.empty();
    jqueryMap.$list_box.empty();
  };
//  // End private DOM methods to manage chat message
//  //---------------------- END DOM METHODS ---------------------

//  //------------------- BEGIN EVENT HANDLERS -------------------
  onTapToggle = function ( event ) {

    var eType = event.currentTarget.classList[0];

    if ( stateMap.position_type === 'opened' && eType === 'chart-chat-head-toggle' ) {
      setSliderPosition( 'closed' );
      chart.model.people.logout();
    }
    else if ( stateMap.position_type === 'opened' && eType === 'chart-chat-head-min' ){
      setSliderPosition( 'hidden' );
    }
    else if ( stateMap.position_type === 'closed' || stateMap.position_type === 'hidden' ){
      setSliderPosition( 'opened' );
      jqueryMap.$input.focus();
    }
    return false;
  };

  onSubmitMsg = function ( event ) {
    var msg_text = jqueryMap.$input.val();

    if ( msg_text.trim() === '' ) { return false; }
    configMap.chat_model.send_msg( msg_text );
    //This roundtrips from the model to an sio 'updatechat' emission
    //--> _publish_updatechat --> 'chart-updatechat' gevent
    // --> chart.chat onUpdatechat

    //This is just some animation sugar
    jqueryMap.$input.focus();
    jqueryMap.$send.addClass( 'chart-x-select' );
    setTimeout(
      function () { jqueryMap.$send.removeClass( 'chart-x-select' ); },
      250
    );
    return false;
  };

  onTapList = function ( event ) {
    var $tapped  = $( event.elem_target )
      , chatee_id;

    if ( ! $tapped.hasClass('chart-chat-list-name') ) { return false; }

    chatee_id = $tapped.attr( 'data-id' );
    if ( ! chatee_id ) { return false; }

    configMap.chat_model.set_chatee( chatee_id );
      //if valid action, fires off a 'chart-setchatee'
    return false;
  };

  onSetchatee = function ( event, arg_map ) {
    var
      new_chatee = arg_map.new_chatee,
      old_chatee = arg_map.old_chatee;

    jqueryMap.$input.focus(); //put the focus on the input box
    if ( ! new_chatee ) {
      if ( old_chatee ) {
        writeAlert( old_chatee.name + ' has left the chat' );
      }
      else {
        writeAlert( 'Your friend has left the chat' );
      }
      jqueryMap.$title.text( 'Chat' );
      return false;
    }

    jqueryMap.$list_box
      .find( '.chart-chat-list-name' )
      .removeClass( 'chart-x-select' )
      .end()
      .find( '[data-id=' + arg_map.new_chatee.id + ']' )
      .addClass( 'chart-x-select' );

    writeAlert( 'Now chatting with ' + arg_map.new_chatee.name );
//    jqueryMap.$title.text( 'Chat with ' + arg_map.new_chatee.name );
    return true;
  };

  onListchange = function ( event ) {

    var
      list_html = String(),
      people_db = configMap.people_model.get_db(),
      chatee    = configMap.chat_model.get_chatee();


    people_db().each( function ( person, idx ) {
      var select_class = '';

      if ( person.get_is_anon() || person.get_is_user() ) { return true; }

      if ( chatee && chatee.id === person.id ) {
        select_class=' chart-x-select';
      }

      if( stateMap.isOnline ){
        list_html
          += '<div class="chart-chat-list-name'
          +  select_class + '" data-id="' + person.id + '">'
          +  chart.util_b.encodeHtml( person.name ) + '</div>';
      }

    });

    if ( stateMap.isOnline ) {
      clearChat();
    }
    // jqueryMap.$list_box.html( list_html );
    jqueryMap.$list_box.html( list_html );
  };


  //This picks up from chart.model send_msg (msg_map) --> _publish_updatechat
  // --> $.gevent.publish( 'chart-updatechat', [ msg_map ] ); where...
//  msg_map = {
//    dest_id   : x.id,
//    dest_name : x.name,
//    sender_id : stateMap.x.id,
//    msg_text  : msg_text
//  };
  onUpdatechat = function ( event, msg_map ) {
    var
      is_user,
      sender_id = msg_map.sender_id,
      msg_text  = msg_map.msg_text,
      chatee    = configMap.chat_model.get_chatee() || {},
      sender    = configMap.people_model.get_by_cid( sender_id );


    //If there is no sender, just post as alert
    if ( ! sender ) {
      writeAlert( msg_text );
      return false;
    }

    //determine if the sender of the message is the user
    is_user = sender.get_is_user();

    //if the sender IS NOT the user OR
    // the sender IS NOT (already) the chatee
    //    set the chatee
    if ( ! ( is_user || sender_id === chatee.id ) ) {
      configMap.chat_model.set_chatee( sender_id );
    }

    //writeChat needs to know how to post in the log
    // (if sender is ME then post in green etc )
    writeChat( sender.name, msg_text, is_user );


    //clear the input text box; refocus
    if ( is_user ) {
      jqueryMap.$input.val( '' );
      jqueryMap.$input.focus();
    }
  };

  onLogin = function ( event, login_user ) {
    setSliderPosition( 'hidden' );
    jqueryMap.$input.focus();
    stateMap.isOnline = true;
  };

  onLogout = function ( event, logout_user ) {
    setSliderPosition( 'closed' );
    stateMap.isOnline = false;
    clearChat();
  };


  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Example   : spa.chat.configModule({ slider_open_em : 18 });
  // Purpose   : Configure the module prior to initialization
  // Arguments :
  //   * set_chat_anchor - a callback to modify the URI anchor to
  //     indicate opened or closed state. This callback must return
  //     false if the requested state cannot be met
  //   * chat_model - the chat model object provides methods
  //       to interact with our instant messaging
  //   * people_model - the people model object which provides
  //       methods to manage the list of people the model maintains
  //   * slider_* settings. All these are optional scalars.
  //       See mapConfig.settable_map for a full list
  //       Example: slider_open_em is the open height in em's
  // Action    :
  //   The internal configuration data structure (configMap) is
  //   updated with provided arguments. No other actions are taken.
  // Returns   : true
  // Throws    : JavaScript error object and stack trace on
  //             unacceptable or missing arguments
  //
  configModule = function ( input_map ) {
    chart.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  // End public method /configModule/

  // Begin public method /initModule/
  // Example    : spa.chat.initModule( $('#div_id') );
  // Purpose    :
  //   Directs Chat to offer its capability to the user
  // Arguments  :
  //   * $append_target (example: $('#div_id')).
  //     A jQuery collection that should represent
  //     a single DOM container
  // Action     :
  //   Appends the chat slider to the provided container and fills
  //   it with HTML content.  It then initializes elements,
  //   events, and handlers to provide the user with a chat-room
  //   interface
  // Returns    : true on success, false on failure
  // Throws     : none
  //
  initModule = function ( $append_target ) {

    var $list_box;

    // load chat slider html and jquery cache
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    setPxSizes();

////    initialize chat slider to default state
    stateMap.position_type = 'opened';
    setSliderPosition('closed');

////    Have $list_box subscribe to jQuery global events
    $list_box = jqueryMap.$list_box;
    $.gevent.subscribe( $list_box, 'chart-listchange', onListchange );
    $.gevent.subscribe( $list_box, 'chart-setchatee',  onSetchatee  );
    $.gevent.subscribe( $list_box, 'chart-updatechat', onUpdatechat );
    $.gevent.subscribe( $list_box, 'chart-login',      onLogin      );
    $.gevent.subscribe( $list_box, 'chart-logout',     onLogout     );
    $.gevent.subscribe( $append_target, 'chart-swipe-left', function(){
      setSliderPosition('opened');
    });

////    bind user input events
    jqueryMap.$minimize.bind( 'utap', onTapToggle );
    jqueryMap.$list_box.bind( 'utap', onTapList   );
    jqueryMap.$send.bind(     'utap', onSubmitMsg );
    jqueryMap.$form.bind(   'submit', onSubmitMsg );
  };
  // End public method /initModule/

//  // Begin public method /removeSlider/
//  // Purpose    :
//  //   * Removes chatSlider DOM element
//  //   * Reverts to initial state
//  //   * Removes pointers to callbacks and other data
//  // Arguments  : none
//  // Returns    : true
//  // Throws     : none
//  //
//  removeSlider = function () {
//    // unwind initialization and state
//    // remove DOM container; this removes event bindings too
//    if ( jqueryMap.$slider ) {
//      jqueryMap.$slider.remove();
//      jqueryMap = {};
//    }
//    stateMap.$append_target = null;
//    stateMap.position_type  = 'closed';
//
//    // unwind key configurations
//    configMap.chat_model      = null;
//    configMap.people_model    = null;
//    configMap.set_chat_anchor = null;
//
//    return true;
//  };
//  // End public method /removeSlider/
//
  // Begin public method /handleResize/
  // Purpose    :
  //   Given a window resize event, adjust the presentation
  //   provided by this module if needed
  // Actions    :
  //   If the window height or width falls below
  //   a given threshold, resize the chat slider for the
  //   reduced window size.
  // Returns    : Boolean
  //   * false - resize not considered
  //   * true  - resize considered
  // Throws     : none
  //
  handleResize = function () {
    // don't do anything if we don't have a slider container
    if ( ! jqueryMap.$slider ) { return false; }

    setPxSizes();
    if ( stateMap.position_type === 'opened' ){
      jqueryMap.$slider.css({ width : stateMap.slider_opened_px });
    }
    return true;
  };
  // End public method /handleResize/

  // return public methods
  return {
//    setSliderPosition : setSliderPosition,
      configModule      : configModule
    , initModule        : initModule
//    removeSlider      : removeSlider,
    , handleResize      : handleResize
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
