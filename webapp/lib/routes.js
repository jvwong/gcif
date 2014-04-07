/*
 * routes.js - module to provide routing
 */

/*jslint         node    : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 50,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true
 */
/* global, chart */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
//    authenticate, isValidUser
    configRoutes
  , crud        = require( './crud' )
  , chat        = require( './chat' )
  , makeMongoId = crud.makeMongoId;
// ------------- END MODULE SCOPE VARIABLES ---------------


// ------------- BEGIN PASSPORT CONFIGURATION ---------------

//authenticate = function( passport, LocalStrategy ){
//
//  passport.use(new LocalStrategy(
//
//    function(username, password, done) {
//      crud.read(
//        'user'
//        , { name: username }
//        , {}
//        , function( err, userlist ) {
//
//          var user = userlist[0];
//          if (err) { return done(err); }
//          if (!user) {
//            return done(null, false, { message: 'Incorrect username.' });
//          }
////          if (!user.validPassword(password)) {
////            return done(null, false, { message: 'Incorrect password.' });
////          }
////          console.log("Error: %s", err);
////          console.log("User returned: %s", user[0].name);
//          return done( null, user );
//        }
//      );
//    }
//
//  ));
//}
//
//isValidUser = function (request, response, next){
//
//  if( !request.isAuthenticated() ){
//    console.log("authenticated: no");
//    response.redirect( '/login' );
//  }else{
//    console.log("authenticated: yes");
//    next();
//  }
//
//}
//

// ------------- END PASSPORT CONFIGURATION ---------------


// ---------------- BEGIN PUBLIC METHODS ------------------
configRoutes = function ( app, server ) {

  app.get( '/', function ( request, response ) {
    response.redirect( '/webapp' );
  });

  app.get( '/webapp', function ( request, response ) {
      response.redirect( '/webapp.html' );
  });

//  app.all( '/:obj_type/*?', function ( request, response, next ) {
//    response.contentType( 'json' );
//    next();
//  });
//
//  app.get( '/:obj_type/list', function ( request, response ) {
//    crud.read(
//      request.params.obj_type,
//      {}, {},
//      function ( inner_error, map_list ) { response.send( map_list ); }
//    );
//  });
//
//  app.post( '/:obj_type/create', function ( request, response ) {
//    crud.construct(
//      request.params.obj_type,
//      request.body,
//      function ( result_map ) { response.send( result_map ); }
//    );
//  });
//
//  app.get( '/:obj_type/read/:id', function ( request, response ) {
//    crud.read(
//      request.params.obj_type,
//      { _id: makeMongoId( request.params.id ) },
//      {},
//      function ( inner_error, map_list ) { response.send( map_list ); }
//    );
//  });
//
//  app.post( '/:obj_type/update/:id', function ( request, response ) {
//    crud.update(
//      request.params.obj_type,
//      { _id: makeMongoId( request.params.id ) },
//      request.body,
//      function ( result_map ) { response.send( result_map ); }
//    );
//  });
//
//  app.get( '/:obj_type/delete/:id', function ( request, response ) {
//    crud.destroy(
//      request.params.obj_type,
//      { _id: makeMongoId( request.params.id ) },
//      function ( result_map ) { response.send( result_map ); }
//    );
//  });
//
  chat.connect( server );
};

module.exports = { configRoutes : configRoutes
//                   , authenticate : authenticate
                  };
// ----------------- END PUBLIC METHODS -------------------
