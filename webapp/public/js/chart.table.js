/*
 * chart.table.js
 * table module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, chart, crossfilter, d3 */


chart.table = (function(){
  'use strict';
  var tableChart;

//  tableChart = function(){ return 0; };
  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /tableChart/
  // Example   : chart.bar.tableChart();
  // Purpose   :
  //   Sets up a data table
  // Arguments : none
  // Action    :
  //   returns a chart with configurable attributes
  // Returns   : chart(div)
  // Throws    : none
  tableChart = function() {

    if (!tableChart.id){ tableChart.id = 0; }

    // non-updated variables
    var
    id = tableChart.id++
    , panel_width = 800, panel_height = 300
    , margin = { top : 20, right : 50, bottom : 50, left : 80}
    , width = panel_width - margin.left - margin.right
    , height = panel_height - margin.top - margin.bottom
    , title, noTitle
    , dimension
    , num_rows = 10
    , nest_accessor, subhead_accessor
    , column_definitions
    ;

    function chart(div){

      // updated variables
      var
      data_definition = {"table_data" : nest_accessor.entries(dimension.top(num_rows)), "accessor": function(d) { return d.key; }}
      , datatable, row, column
      , div
      ;

      div.each(function() { //this is processing a value bound to the div

        div = d3.select(this);
        div.style({
            "width": panel_width + "px"
          , "height": panel_height + "px"
        });
        noTitle = div.select(".chart-table.title").empty();

        /* only append a title if one doensn't exist*/
        if(noTitle && title){
          div.append("div")
            .attr({
              class : "chart-table title"
            })
            .html(title);
        }

        /* Set up the table (nested) */
        datatable = d3.select(this)
                          .selectAll(".chart-table.datatable")
                          .data(data_definition.table_data, data_definition.accessor);

        /*new*/
        datatable.enter().append("div")
          .attr("class", "chart-table datatable")
          .append("div")
          .attr("class", "subheader")
          .text(subhead_accessor);


        /* exit selections */
        datatable.exit().remove();

        /* update selections */
        row = datatable.order()
          .selectAll(".row")
          .data(function(d) { return d.values; }, function(d) { return d.index; }),


        /* enter selections */
        column = row.enter()
          .append("div")
          .attr("class", "row");

        column_definitions.forEach(function(spec){

          column.append("div")
            .attr("class", spec.name)
            .text(spec.accessor);

        });

        row.exit().remove();

        row.order();


      });//end div.each({

    }//end private function /chart/

    /* chart attribute setters */
    chart.title = function(_) {
      if (!arguments.length) {
        return title;
      }
      title = _;
      return chart;
    };

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.panel_width = function(_) {
      if (!arguments.length) return panel_width;
      panel_width = _;
      width = panel_width - margin.left - margin.right;
      return chart;
    };

    chart.panel_height = function(_) {
      if (!arguments.length) return panel_height ;
      panel_height = _;
      height = panel_height - margin.top - margin.bottom;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length){
        return dimension;
      }
      dimension = _;
      return chart;
    };

    chart.num_rows = function(_) {
      if (!arguments.length){
        return num_rows;
      }
      num_rows = _;
      return chart;
    };

    chart.column_definitions = function(_) {
      if (!arguments.length){
        return column_definitions;
      }
      column_definitions = _;
      return chart;
    };

    chart.nest_accessor = function(_) {
      if (!arguments.length){
        return nest_accessor;
      }
      nest_accessor = _;
      return chart;
    };

    chart.subhead_accessor = function(_) {
      if (!arguments.length){
        return subhead_accessor;
      }
      subhead_accessor = _;
      return chart;
    };

    return chart;

  };  //end public function /tableChart/

  return { tableChart : tableChart };
//------------------- END PUBLIC METHODS ---------------------

})();




