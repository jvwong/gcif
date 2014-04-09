describe('BasicChart', function () {
    var   div
        , chart
        , height = 350
        , width = 500
        , margins = {top: 40, left: 70, right: 20, bottom: 50}
        , data = [
            {x: 0, y: 0},
            {x: 1, y: 3},
            {x: 2, y: 6}
        ]
        ;

    beforeEach(function () {
        div = d3.select('body').append('div');
        chart = BasicChart(div);
        chart.margins(margins);
        chart.height(height);
        chart.width(width);
    });

    afterEach(function () {
        div.remove(); //improve isolation between test cases
    });

    describe('.data', function () {
        it('should allow setting and retrieve chart data', function () {
            expect(chart.data(data).data()).toBe(data);
        });
    });

    describe('.render', function () {
        describe('svg', function () {
            it('should generate svg', function () {
                chart.render();
                expect(svg()).not.toBeEmpty();
            });

            it('should set default svg height and width', function () {
                chart.render();
                expect(svg().attr('width')).toBe('500');
                expect(svg().attr('height')).toBe('350');
            });

            it('should allow changing svg height and width', function () {
                chart.width(200).height(150).render();
                expect(svg().attr('width')).toBe('200');
                expect(svg().attr('height')).toBe('150');
            });
        });

        describe('chart body', function () {
            it('should create <g class="body">', function () {
                chart.render();
                expect(chartBody()).not.toBeEmpty();
            });

            it('should translate to (left, top)', function () {
                chart.render();
                expect(chartBody().attr('transform')).toBe('translate(70,40)')
            });
        });

        describe('axes', function () {
            beforeEach(function () {
                chart.data(data).width(width).height(height)
                    .xScale(d3.scale.linear().domain(d3.extent(data, function(d,i){ return d.x; })))
                    .yScale(d3.scale.linear().domain(d3.extent(data, function(d,i){ return d.y; })))
                    .render();
            });

            it('should orient x-axis at bottom', function () {
                expect(chart.xAxis().orient()).toBe("bottom");
            });

            it('should orient y-axis left', function () {
                expect(chart.yAxis().orient()).toBe("left");
            });

            it('should set x scale domain', function () {
                expect(chart.xScale().domain()).toEqual([0, 2]);
            });

            it('should set y scale domain', function () {
                expect(chart.yScale().domain()).toEqual([0, 6]);
            });

            it('should set x scale range', function () {
                expect(chart.xScale().range()).toEqual([0, width - margins.left - margins.right]); //d3 selection
            });

            it('should set y scale range', function () {
                expect(chart.yScale().range()).toEqual([height - margins.top - margins.bottom, 0]); //d3 selection
            });

        });

    });

    function svg() {
        return div.select('svg');
    }

    function chartBody() {
        return svg().select('g.body');
    }

});