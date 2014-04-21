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


// Begin /model_people_basic/ test
var model_people_basic = function ( test ) {
  var peopleDb = chart.model.people.get_db();
  var peopleList = peopleDb().get();

  //initialize
  chart.initModule(null);
  chart.model.setDataMode('fake');

  /* begin tests */
  test.expect(5);

  // 1 --- retrieval person
  var person = peopleDb({ cid : 'id_01' }).first();
  test.ok(person.name === "Betty", "retrieved person OK");

  // 2 --- get_is_anon()
  test.ok(!person.get_is_anon(), "get_is_anon() OK");

  // 3 --- anonymous should have id 'a0'
  person = peopleDb({ id : 'a0' }).first();
  test.ok(person.get_is_anon(), "get_is_anon() OK");

  // 4 --- anonymous name
  test.ok(person.name === "anonymous", "get_is_anon() OK");

  // 5 --- get_by_cid
  person = chart.model.people.get_by_cid('id_03');
  test.ok(person.name === "Pebbles", "get_by_cid OK");

  test.done();
};
// End /model_people_basic/ model functionality


// Begin /testAcct / test
var testAcct  = function ( test ) {

  var $t, user, on_login
    , $defer  = $.Deferred();


  //handler for 'spa-login' event
  on_login = function(){ $defer.resolve(); };

  //initialize
  chart.initModule( null );
  chart.model.setDataMode( 'fake' );

  //create JQuery selection
  $t = $('<div/>');

  //subscribe
  $.gevent.subscribe( $t, 'chart-login', on_login );

  /* begin tests */
  test.expect( 1 );

  chart.model.people.login( 'Fred' );

  // 1 --- confirm non-anonymous user
  user = chart.model.people.get_user();
  test.ok( !user.get_is_anon(), "non-anonymous user");

  $defer.done( test.done );
};
// End /testAcct/ model functionality

module.exports = {  model_people_basic : model_people_basic
                  , testAcct : testAcct
                 };
