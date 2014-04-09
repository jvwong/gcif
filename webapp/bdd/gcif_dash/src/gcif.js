/*
 * gcif.js
 * Root namespace module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, gcif:true */

gcif = (function () {
  'use strict';

  var initModule = function ( $content ) {
    gcif.util.initModule();
  };

  return { initModule: initModule };
}());

