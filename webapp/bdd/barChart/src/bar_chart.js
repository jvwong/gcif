function BarChart(container) {

    /* START variable declarations  */
    if (!BarChart.id){ BarChart.id = 0; }
    var
        id = BarChart.id++
        , chart = {}
        , _parent = container
        , svg
        , body
        , _width = 500
        , _height = 350
        , _margins = {top: 10, left: 10, right: 10, bottom: 10}
        , _data
        , _xScale = d3.scale.linear()
        , _yScale = d3.scale.linear()
        , _xAxis = d3.svg.axis().scale(_xScale).orient("bottom")
        , _yAxis = d3.svg.axis().scale(_yScale).orient("left").ticks([5])
        ;
    /* END variable declarations  */

    /* START helper functions */
    function quadrantWidth(){
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight(){
        return _height - _margins.top - _margins.bottom;
    }

    function barPath(data) {

        var path = [],
            i = -1,
            n = data.length,
            d;
        var _barwidth = _xScale.rangeBand();

        while (++i < n) {
            d = data[i];

//            console.log(_xScale(d.x));

            path.push("M", _xScale(d.x), ",", quadrantHeight(),
                "V", _yScale(d.y),
                "h", _barwidth,
                "V", quadrantHeight(),
                "z");
        }
        return path.join("");
    }

    /* END helper function */



    /* START chart rendering */
    chart.render = function () {

        /* render the svg element */
            svg = _parent.append("svg")
                .attr({
                      height: _height
                    , width: _width
                })
                ;

        /* render a group element to append chart */
            body = svg.append("g")
                .attr({
                      class: "body"
                    , transform: "translate(" + _margins.left + "," + _margins.top + ")"
                })
                ;

        /* set up the ranges */
        _xScale.rangeRoundBands([0, quadrantWidth()], 0.04, 0.02);
        _yScale.rangeRound([quadrantHeight(), 0]);

        /* add data points */
        if (_data) {

            /* set the domain */
                _xScale.domain( _data.map( function(d,i){ return i; } ) );
                _yScale.domain( [0, d3.max(_data, function(d,i){ return d.y; })] );

            /* generate clipPath element */
                body.append("clipPath")
                    .attr({
                        id : "clip-" + id
                    })
                    .append("rect")
                    .attr({
                          width  : quadrantWidth()
                        , height : quadrantHeight()
                    });


            /* generate bars */
                body.selectAll(".chart-bar  .bar")
                    .data(["chart-bar background", "chart-bar foreground"]) //store these in each __data__ attribute to be added
                  .enter() //for each selection
                    .append("path")
                    .attr("class", function(d) { return d + " bar"; })
                    .datum(_data)
                ;

                body.selectAll(".chart-bar.foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");

                body.selectAll(".chart-bar.bar")
                        .datum(_data)
                        .attr("d", barPath)
                    ;

            /* generate axes */
                /* x axis */
                body.append("g")
                    .attr({
                        class : "chart-bar x axis",
                        transform : "translate(0," + quadrantHeight() + ")"
                    })
                    .call(_xAxis)
                    .append("text")
                    .attr({
                        class : "axis-label"
                        , x : ( ( quadrantWidth() + _margins.left ) / 2  )
                        , y : 40
                    })
                    .style("text-anchor", "end")
                    .text("x axis label")
                ;

                /* y axis */
                body.append("g")
                    .attr({
                        class : "chart-bar y axis"
                    })
                    .call(_yAxis)
                    .append("text")
                    .attr({
                        transform : "rotate(-90)"
                        , x : -( (quadrantHeight() - _margins.bottom ) / 2 )
                        , y : - 50
                    })
                    .style("text-anchor", "end")
                    .text("y axis label")
                ;


        }//endif

    };
    /* END chart rendering */

    /* START chart update */
    chart.update = function (data) {



    };
    /* END chart update */


    chart.margins = function(_){
        if(!arguments.length) return _margins;
        _margins = _;
        return chart;
    };

    chart.data = function(_){
        if(!arguments.length) return _data;
        _data = _;
        return chart;
    };

    chart.width = function(_){
        if(!arguments.length) return _width;
        _width = _;
        return chart;
    };

    chart.height = function(_){
        if(!arguments.length) return _height;
        _height = _;
        return chart;
    };

    chart.xScale = function(_){
        if(!arguments.length) return _xScale;
        _xScale = _;
        _xAxis.scale(_xScale);
        return chart;
    };

    chart.yScale = function(_){
        if(!arguments.length) return _yScale;
        _yScale = _;
        _yAxis.scale(_yScale);
        return chart;
    };

    chart.xAxis = function(_){
        if(!arguments.length) return _xAxis;
        _xAxis = _;
        return chart;
    };

    chart.yAxis = function(_){
        if(!arguments.length) return _yAxis;
        _yAxis = _;
        return chart;
    };


    return chart;
}