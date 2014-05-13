gcif = (function () {
    'use strict';

    var BarChart
    ;

    BarChart = function(p) {
        var that = {};

        var _parent = p, _width = 250, _height = 250,
            _margins = {top: 10, left: 30, right: 10, bottom: 30},
            _data
        ;

        that.render = function () {
            var svg = _parent
                .append("svg")
                .attr("height", _height)
                .attr("width", _width);

            var body = svg.append("g")
                .attr("class", 'body')
                .attr("transform", "translate(" + _margins.left + "," + _margins.top + ")")
        };

        that.data = function (d) {
            if (!arguments.length) return _data;
            _data = d;
            return that;
        };

        return that;
    };

    return {BarChart: BarChart};
}());

exports.gcif = gcif;