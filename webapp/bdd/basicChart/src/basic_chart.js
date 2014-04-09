function BasicChart(container) {
    var chart = {};

    var _parent = container
        , svg
        , body
        , _width = 500
        , _height = 350
        , _margins = {top: 10, left: 10, right: 10, bottom: 10}
        , _data
        , _xScale = d3.scale.linear()
        , _yScale = d3.scale.linear()
        , _xAxis = d3.svg.axis().scale(_xScale).orient("bottom")
        , _yAxis = d3.svg.axis().scale(_yScale).orient("left")
        ;

    function quadrantWidth(){
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight(){
        return _height - _margins.top - _margins.bottom;
    }

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

        if (_data) {

            _xScale.range([0, quadrantWidth()]);
            _yScale.range([quadrantHeight(), 0]);

            /* generate axes */
                /* x axis */
                body.append("g")
                    .attr({
                        class : "x axis",
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
                        class : "y axis"
                    })
                    .call(_yAxis)
                    .append("text")
                    .attr({
                        transform : "rotate(-90)"
                        , x : -( (quadrantHeight() - _margins.bottom ) / 2 )
                        , y : - 50
                    })
                    .style("text-anchor", "end")
                    .text("x axis label")
                ;

        }//endif

    };

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