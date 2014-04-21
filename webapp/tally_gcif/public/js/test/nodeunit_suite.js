/*
 * nodeunit_suite.js
 * Unit test suite for chart app
 *
 * Please run using /nodeunit <this_file>/
 */

/*jslint         node   : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 50,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true
 */
/*global $, chart */

var jsdom = require("jsdom").jsdom;
var document = jsdom("<html><head></head><body><div></div></body></html>");
var window = document.parentWindow;

// third-party modules and globals
global.jQuery = require( 'jquery')(window);
global.TAFFY = require( '../jq/taffydb-2.6.2.js' ).taffy;
global.$  = global.jQuery;
require( '../jq/jquery.event.gevent-0.1.9.js' );

// our modules and globals
global.chart = null;
require( '../chart.js');
require( '../chart.util.js');
require( '../chart.fake.js');
require( '../chart.data.js');
require( '../chart.model.js');

var
// utility and handlers
  makePeopleStr, onLogin,      onListchange,
  onSetchatee,   onUpdatechat, onLogout,

// test functions
  testInitialState,    loginAsFred,       testUserAndPeople,
  testWilmaMsg,        sendPebblesMsg,    testMsgToPebbles,
  testPebblesResponse, updatePebblesAvtr, testPebblesAvtr,
  logoutAsFred,        testLogoutState,

// event handlers
  loginEvent, changeEvent, chateeEvent, msgEvent, logoutEvent,
  loginData, changeData, msgData, chateeData, logoutData,

// indexes
  changeIdx = 0, chateeIdx = 0, msgIdx = 0,

// deferred objects
  $deferLogin      = $.Deferred(),
  $deferChangeList = [ $.Deferred() ],
  $deferChateeList = [ $.Deferred() ],
  $deferMsgList    = [ $.Deferred() ],
  $deferLogout     = $.Deferred();

// utility to make a string of online person names
makePeopleStr = function ( people_db ) {
  var people_list = [];
  people_db().each(function( person, idx ) {
    people_list.push( person.name );
  });
  return people_list.sort().join( ',' );
};

// event handler for 'chart-login'
onLogin = function ( event, arg ) {
  loginEvent = event;
  loginData  = arg;
  $deferLogin.resolve();
};

// event handler for 'chart-listchange'
onListchange = function ( event, arg ) {
  changeEvent = event;
  changeData  = arg;
  $deferChangeList[ changeIdx ].resolve();
  changeIdx++;
  $deferChangeList[ changeIdx ] = $.Deferred();
};

// event handler for 'chart-updatechat'
onUpdatechat = function ( event, arg ) {
  msgEvent = event;
  msgData  = arg;
  $deferMsgList[ msgIdx ].resolve();
  msgIdx++;
  $deferMsgList[ msgIdx ] = $.Deferred();
};

// event handler for 'chart-setchatee'
onSetchatee = function ( event, arg ) {
  chateeEvent = event;
  chateeData  = arg;
  $deferChateeList[ chateeIdx ].resolve();
  chateeIdx++;
  $deferChateeList[ chateeIdx ] = $.Deferred();
};

// event handler for 'chart-logout'
onLogout = function ( event, arg ) {
  logoutEvent = event;
  logoutData  = arg;
  $deferLogout.resolve();
};

// Begin /testInitialState/
testInitialState = function ( test ) {
  var $t, user, people_db, people_str, test_str;
  test.expect( 2 );

  // initialize our SPA
  chart.initModule( null );
  chart.model.setDataMode( 'fake' );

  // create a jQuery object
  $t = $('<div/>');

  // subscribe functions to global custom events
  $.gevent.subscribe( $t, 'chart-login',      onLogin      );
  $.gevent.subscribe( $t, 'chart-listchange', onListchange );
  $.gevent.subscribe( $t, 'chart-setchatee',  onSetchatee  );
  $.gevent.subscribe( $t, 'chart-updatechat', onUpdatechat );
  $.gevent.subscribe( $t, 'chart-logout',     onLogout     );

  // test the user in the initial state
  user     = chart.model.people.get_user();
  test_str = 'user is anonymous';
  test.ok( user.get_is_anon(), test_str );

  // test the list of online persons
  test_str = 'expected user only contains anonymous';
  people_db  = chart.model.people.get_db();
  people_str = makePeopleStr( people_db );
  test.ok( people_str === 'anonymous', test_str );

  // proceed to next test without blocking
  test.done();
};
// End /testInitialState/

// Begin /loginAsFred/
loginAsFred = function ( test ) {
  var user, people_db, people_str, test_str;
  test.expect( 6 );

  // login as 'Fred'
  chart.model.people.login( 'Fred' );
  test_str = 'log in as Fred';
  test.ok( true, test_str );

  // test user attributes before login completes
  user     = chart.model.people.get_user();
  test_str = 'user is no longer anonymous';
  test.ok( ! user.get_is_anon(), test_str );

  test_str = 'usr name is "Fred"';
  test.ok( user.name === 'Fred', test_str );

  test_str = 'user id is undefined as login is incomplete';
  test.ok( ! user.id, test_str );

  test_str = 'user cid is c0';
  test.ok( user.cid === 'c0', test_str );

  test_str   = 'user list is as expected';
  people_db  = chart.model.people.get_db();
  people_str = makePeopleStr( people_db );
  test.ok( people_str === 'Fred,anonymous', test_str );

  // proceed to next test when both conditions are met:
  //   + login is complete (chart-login event)
  //   + the list of online persons has been updated
  //     (chart-listchange event)
  $.when( $deferLogin, $deferChangeList[ 0 ] )
    .then( test.done );
};
// End /loginAsFred/

// Begin /testUserAndPeople/
testUserAndPeople = function ( test ) {
  var
    user, cloned_user,
    people_db, people_str,
    user_str, test_str;
  test.expect( 4 );

  // test user attributes
  test_str = 'login as Fred complete';
  test.ok( true, test_str );

  user        = chart.model.people.get_user();
  test_str    = 'Fred has expected attributes';
  cloned_user = $.extend( true, {}, user );

  //___id and ___s are TaffyDb bloat
  delete cloned_user.___id;
  delete cloned_user.___s;
  delete cloned_user.get_is_anon;
  delete cloned_user.get_is_user;

  test.deepEqual(
    cloned_user,
    { cid     : 'id_5',
      css_map : { top: 25, left: 25, 'background-color': '#8f8' },
      id      : 'id_5',
      name    : 'Fred'
    },
    test_str
  );

  // test the list of online persons
  test_str = 'receipt of listchange complete';
  test.ok( true, test_str );

  people_db  = chart.model.people.get_db();
//  people_db().each(function( person, idx ){ console.log(person); })

  people_str = makePeopleStr( people_db );
  user_str = 'Betty,Fred,Mike,Pebbles,Wilma';
  test_str = 'user list provided is expected - ' + user_str;
  //NB that login fires an 'adduser' sio message which sticks the peopleList with
  //the new user, Fred. This also executes the callback for send_listchange callback
  // and emits a mockmessage from Wilma


  test.ok( people_str === user_str, test_str );

  // proceed to next test when both conditions are met:
  //   + first message has been received (chart-updatechat event)
  //     (this is the example message from 'Wilma')
  //   + chatee change has occurred (chart-setchatee event)
  $.when( $deferMsgList[ 0 ], $deferChateeList[ 0 ] )
    .then( test.done );
};
// End /testUserAndPeople/

// Begin /testWilmaMsg/
testWilmaMsg = function ( test ) {
  var test_str;
  test.expect( 4 );

  // test message received from 'Wilma'
  test_str = 'Message is as expected';
  test.deepEqual(
    msgData,
    //this is set in the callback  $.gevent.subscribe( $t, 'chart-updatechat', onUpdatechat );
    { dest_id: 'id_5',
      dest_name: 'Fred',
      sender_id: 'id_04',
      msg_text: 'Hi there Fred!  Wilma here.'
    },
    test_str
  );

  // test chatee attributes ---this set in gevent callbacks
  //chart.mode.js set_chatee: $.gevent.publish( 'chart-setchatee', { old_chatee : chatee, new_chatee : new_chatee } );
  //also note chateeData is set in $.gevent.subscribe( $t, 'chart-setchatee',  onSetchatee  );
  test.ok( chateeData.new_chatee.cid  === 'id_04' );
  test.ok( chateeData.new_chatee.id   === 'id_04' );
  test.ok( chateeData.new_chatee.name === 'Wilma' );

  // proceed to next test without blocking
  test.done();
};
// End /testWilmaMsg/

// Begin /sendPebblesMsg/
sendPebblesMsg = function ( test ) {
  var test_str, chatee;
  test.expect( 1 );

  // set_chatee to 'Pebbles'
  chart.model.chat.set_chatee( 'id_03' );

  // send_msg to 'Pebbles'
  chart.model.chat.send_msg( 'whats up, tricks?' );

  // test get_chatee() results
  chatee = chart.model.chat.get_chatee();
  test_str = 'Chatee is as expected';
  test.ok( chatee.name === 'Pebbles', test_str );

  // proceed to next test when both conditions are met:
  //   + chatee has been set (chart-setchatee event)
  //   + message has been sent (chart-updatechat event)
  $.when( $deferMsgList[ 1 ], $deferChateeList[ 1] )
    .then( test.done );
};
// End /sendPebblesMsg/

// Begin /testMsgToPebbles/
testMsgToPebbles = function ( test ) {
  var test_str;
  test.expect( 2 );

  // test the chatee attributes
  test_str = 'Pebbles is the chatee name';
  test.ok(
    chateeData.new_chatee.name === 'Pebbles',
    test_str
  );

  // test the message sent
  test_str = 'message change is as expected';
  test.ok( msgData.msg_text === 'whats up, tricks?', test_str );

  // proceed to the next test when
  //   + A response has been received from 'Pebbles'
  //    (chart-updatechat event)
  $deferMsgList[ 2 ].done( test.done );
};
// End /testMsgToPebbles/

// Begin /testPebblesResponse/
testPebblesResponse = function ( test ) {
  var test_str;
  test.expect( 1 );

  // test the message received from 'Pebbles'
  test_str = 'Message is as expected';
  test.deepEqual(
    msgData,
    { dest_id: 'id_5',
      dest_name: 'Fred',
      sender_id: 'id_03',
      msg_text: 'Thanks for the note, Fred'
    },
    test_str
  );

  // proceed to next test without blocking
  test.done();
};
// End /testPebblesResponse/

// Begin /updatePebblesAvtr/
updatePebblesAvtr = function ( test ) {
  test.expect( 0 );

  // invoke the update_avatar method
  chart.model.chat.update_avatar({
    person_id : 'id_03',
    css_map   : {
      'top' : 10, 'left' : 100,
      'background-color' : '#ff0'
    }
  });

  // proceed to the next test when
  //   + the list of online persons has been updated
  //     (chart-listchange event)
  $deferChangeList[ 1 ].done( test.done );
};
// End /updatePebblesAvtr/

// Begin /testPebblesAvtr/
testPebblesAvtr = function ( test ) {
  var chatee, test_str;
  test.expect( 1 );

  // get 'Pebbles' person object using get_chatee method
  chatee = chart.model.chat.get_chatee();

  // test avatar details for 'Pebbles'
  test_str = 'avatar details updated';
  test.deepEqual(
    chatee.css_map,
    { top : 10, left : 100,
      'background-color' : '#ff0'
    },
    test_str
  );

  // proceed to next test without blocking
  test.done();
};
// End /testPebblesAvtr/

// Begin /logoutAsFred/
logoutAsFred = function( test ) {
  test.expect( 0 );

  // logout as fred
  chart.model.people.logout();

  // proceed to next test when
  //   + logout is complete (chart-logout event)
  $deferLogout.done( test.done );
};
// End /logoutAsFred/

// Begin /testLogoutState/
testLogoutState = function ( test ) {
  var user, people_db, people_str, user_str, test_str;
  test.expect( 4 );

  test_str = 'logout as Fred complete';
  test.ok( true, test_str );

  // test the list of online persons
  people_db  = chart.model.people.get_db();
  people_str = makePeopleStr( people_db );
  user_str   = 'anonymous';
  test_str   = 'user list provided is expected - ' + user_str;

  test.ok( people_str === 'anonymous', test_str );

  // test user attributes
  user     = chart.model.people.get_user();
  test_str = 'current user is anonymous after logout';
  test.ok( user.get_is_anon(), test_str );

  test.ok( true, 'test complete' );

  // Proceed without blocking
  test.done();
};
// End /testLogoutState/

module.exports = {
    testInitialState     : testInitialState
  , loginAsFred          : loginAsFred
  , testUserAndPeople    : testUserAndPeople
  , testWilmaMsg         : testWilmaMsg
  , sendPebblesMsg       : sendPebblesMsg
  , testMsgToPebbles     : testMsgToPebbles
  , testPebblesResponse  : testPebblesResponse
  , updatePebblesAvtr    : updatePebblesAvtr
  , testPebblesAvtr      : testPebblesAvtr
  , logoutAsFred         : logoutAsFred
  , testLogoutState      : testLogoutState
};
// End of test suite


