/*
 * gcif.util.js
 * General JavaScript utilities
 *
 */

/*jslint          browser : true,  continue : true,
 devel  : true,  indent  : 2,     maxerr   : 50,
 newcap : true,  nomen   : true,  plusplus : true,
 regexp : true,  sloppy  : true,  vars     : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.util = (function () {
    var
      formatYear = d3.time.format("%Y")
    , wrap
    , initModule
    ;


    // Begin Public method /wrap/
    // Purpose: Wraps text according to width
    // Arguments:
    //   * text - the d3 text selection
    //   * width - width of text
    // Returns: none
    // Throws : none
    // example useage
    //  d3.selectAll("g.axis > text").call(wrap, 0.80 * (x.range()[1] - x.range()[0]));
    //
    wrap = function(text, width){
        text.each(function() {
            var text = d3.select(this)
            , words = text.text().split(/\s+/).reverse()
            , word
            , line = []
            , lineNumber = 0
            , lineHeight = 1.1 // ems
            , y = text.attr("y")
            , dy = parseFloat(text.attr("dy"))
            , tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
            ;
            console.log(dy);
            console.log(words);

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }

        });
    };
    // End Public method /parseData/

    initModule = function ( $container ) {
        //do nothing
    };

    return {
          initModule : initModule
        ,  wrap      : wrap
    };
}());


