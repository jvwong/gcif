/*
 * chart.js
 * Root namespace module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, chart:true */

chart = (function () {
  'use strict';

  var initModule = function ( $container ) {
    chart.data.initModule();
    chart.model.initModule();

    if ( chart.shell && $container ){
      chart.shell.initModule( $container );
    }

  };

  return { initModule: initModule };
}());

