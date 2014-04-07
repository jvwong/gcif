/*
 * chart.util.js
 * General JavaScript utilities
 *
 */

/*jslint          browser : true,  continue : true,
 devel  : true,  indent  : 2,     maxerr   : 50,
 newcap : true,  nomen   : true,  plusplus : true,
 regexp : true,  sloppy  : true,  vars     : false,
 white  : true
 */
/*global $, chart */

chart.util = (function () {
  var makeError, setConfigMap, renderAll;

  // Begin Public constructor /makeError/
  // Purpose: a convenience wrapper to create an error object
  // Arguments:
  //   * name_text - the error name
  //   * msg_text  - long error message
  //   * data      - optional data attached to error object
  // Returns  : newly constructed error object
  // Throws   : none
  //
  makeError = function ( name_text, msg_text, data ) {
    var error     = new Error();
    error.name    = name_text;
    error.message = msg_text;

    if ( data ){ error.data = data; }

    return error;
  };
  // End Public constructor /makeError/

  // Begin Public method /setConfigMap/
  // Purpose: Common code to set configs in feature modules
  // Arguments:
  //   * input_map    - map of key-values to set in config
  //   * settable_map - map of allowable keys to set
  //   * config_map   - map to apply settings to
  // Returns: true
  // Throws : Exception if input key not allowed
  //
  setConfigMap = function ( arg_map ){
    var
      input_map    = arg_map.input_map,
      settable_map = arg_map.settable_map,
      config_map   = arg_map.config_map,
      key_name, error;

    for ( key_name in input_map ){
      if ( input_map.hasOwnProperty( key_name ) ){
        if ( settable_map.hasOwnProperty( key_name ) ){
          config_map[key_name] = input_map[key_name];
        }
        else {
          error = makeError( 'Bad Input',
            'Setting config key |' + key_name + '| is not supported'
          );
          throw error;
        }
      }
    }
  };
  // End Public method /renderAll/

  // Begin Public constructor /renderAll/
  // Purpose: Applies the graph function to each selection
  // Arguments:
  //   * arg_array - an array of graph functions
  // Returns  : none
  // Throws   : error if arg_array is not an array
  //
  renderAll = function( selection, charts ){

    try
    {
      selection.each(function(data, index){
        d3.select(this).call(charts[index]);
      });
    }
    catch(err)
    {
      console.error(err);
    }

  };

  return {
    makeError    : makeError,
    setConfigMap : setConfigMap,
    renderAll    : renderAll
  };
}());
