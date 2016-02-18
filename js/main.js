require(['d3'], function(d3) {
    'use strict';

    // Mocking the data
    var data = {
        revenueChart  : [{
                name: 'REVENUE',
                device: 'Tablet',
                color: 'lightgreen',
                val: 120000,
                suffix: '€',
                percent: 0.6
            },{
                name: 'REVENUE',
                device: 'Smartphones',
                color: 'darkgreen',
                val: 80000,
                suffix: '€',
                percent: 0.4
            }],
        impresionsChart: [{
                name: 'IMPRESIONS',
                device: 'Tablet',
                color: 'skyblue',
                val: 20000000,
                percent: 0.4
            },{
                name: 'IMPRESIONS',
                device: 'Smartphones',
                color: 'darkblue',
                val: 30000000,
                percent: 0.6
            }],
        visitsChart: [{
                name: 'VISITS',
                device: 'Tablet',
                color: 'sun',
                val: 480000000,
                percent: 0.8
            },{
                name: 'VISITS',
                device: 'Smartphones',
                color: 'orange',
                val: 120000000,
                percent: 0.2
            }]
    },
        loadTime = 2000,
        topPadding = 33;


    function plotChart( chartId, data ) {

        var id = document.getElementById( chartId ),
            width = id.clientWidth,
            height = width * 0.5,
            radius = height / 2,
            box = d3.select( id ),
            svg = box.select( 'svg' )
                .attr( 'width', width )
                .attr( 'height', height + topPadding );

        var chart = svg.append( 'g' )
            .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')'
        );

        var details = svg.append( 'g' )
            .attr('class', 'plot__details');

        var dextro = { startAngle: 0, endAngle: 0 };
        var levo = { startAngle: 2 * Math.PI, endAngle: 2 * Math.PI };

        var pieLayout = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.percent;
            });

        var arc = d3.svg.arc()
            .outerRadius( radius - 18)
            .innerRadius( 0 );

        var count = 0;
        var pieChartPieces = chart.datum(data)
            .selectAll('path')
            .data(pieLayout)
            .enter()
            .append('path')
            .attr('class', function(d) {
                return  d.data.color;
            })
            .each( function (obj, index) {
                this._current = ( index % 2 == 0 ) ? levo : dextro;
                count += obj.data.val;
            })
            .transition()
            .duration(loadTime)
            .attrTween( 'd', function( d ) {
                var interpolate = d3.interpolate( this._current, d );
                this._current = interpolate( 0 );

                return function( t ) {
                    return arc( interpolate( t ) );
                };
            })
            .each('end', function handleAnimationEnd (d) {
                printDetails (d.data, this);
            });

        plotCenter (data, count);

        function plotCenter(data, count) {
            var mainContainer = chart.append('g')
                .attr('class', 'plot__center');

            var Radius = radius - 25;

            mainContainer.append('circle')
                .attr('class', 'plot__main__innerCircle')
                .attr('r', 0)
                .attr('r', Radius);

            mainContainer.append( 'line')
                .attr('class', 'plot__detail__segment')
                .attr('x1', - Radius + 1)
                .attr('x2', - Radius + 4)
                .attr('y1', 0)
                .attr('y2', 0);
            mainContainer.append( 'line')
                .attr('class', 'plot__detail__segment')
                .attr('x1', Radius - 1)
                .attr('x2', Radius - 4)
                .attr('y1', 0)
                .attr('y2', 0);
            mainContainer.append( 'line')
                .attr('class', 'plot__detail__segment')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', - Radius + 1)
                .attr('y2', - Radius + 4);
            mainContainer.append( 'line')
                .attr('class', 'plot__detail__segment')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', Radius - 1)
                .attr('y2', Radius - 4);

            var valueSuffix = '';
            if (typeof data[0].suffix !== 'undefined') {
                valueSuffix = data[0].suffix;
            }

            mainContainer.data([data])
                .append('text')
                .text ('0')
                .attr('class', 'plot__head__name')
                .attr('x', 0)
                .attr('y', -15)
                .attr('text-anchor', 'middle')
                .html(data[0].name);

            mainContainer.data([count])
                .append( 'text' )
                .text ( '0' )
                .attr( 'class', 'plot__head__value' )
                .attr( 'x', 0 )
                .attr( 'y', 5 )
                .attr( 'text-anchor', 'middle' )
                .transition()
                .duration( loadTime )
                .tween( 'text', function( d ) {
                    var i = d3.interpolateRound( this.textContent.replace( /\s%/ig, '' ), d );
                    return function( t ) {
                        var format = d3.format('0,000');
                        this.textContent = i( t );
                        this.textContent = format(this.textContent) + valueSuffix;
                    };
                } );
        }

        function printDetails (data, element) {
            var BBox = element.getBBox(),
                infoWidth = width * 0.5,
                anchor,
                infoContainer,
                position,
                valueSuffix = '';

            if (typeof data.suffix !== 'undefined') {
                valueSuffix = data.suffix;
            }

            if ((BBox.x + BBox.width / 2) >= 0) {
                infoContainer = details.append('g')
                    .attr('width', infoWidth)
                    .attr('transform', 'translate(' + (width - infoWidth) + ',' + (width - infoWidth - 20) + ')'
                );
                anchor = 'end';
                position = 'right';
            } else {
                infoContainer = details.append('g')
                    .attr('width', infoWidth)
                    .attr('transform', 'translate(' + 0 + ',' + (width - infoWidth - 20) + ')'
                );
                anchor = 'start';
                position = 'left';
            }

            infoContainer.data([data.device])
                .append('foreignObject')
                .attr('width', infoWidth)
                .attr('height', 16)
                .append('xhtml:body')
                .attr('class', 'plot__detail__textContainer ' + 'plot__detail__' + position + ' ' + data.color)
                .html(data.device);

            infoContainer.data([data.percent * 100])
                .append('text')
                .text ('0 %')
                .attr('class', 'plot__detail__percentage')
                .attr('x', (position === 'left' ? 0 : infoWidth))
                .attr('y', 25)
                .attr('text-anchor', anchor)
                .transition()
                .tween('text', function (d) {
                    var i = d3.interpolateRound(this.textContent.replace( /\s%/ig, '' ), d);
                    return function(t) {
                        this.textContent = i(t) + '%';
                    };
                });

            infoContainer.data([data.val])
                .append('text')
                .text ('0')
                .attr('class', 'plot__detail__val')
                .attr('x', (position === 'left' ? 0 : infoWidth))
                .attr('y', 39)
                .attr('text-anchor', anchor)
                .transition()
                .tween('text', function(d) {
                    var i = d3.interpolateRound( this.textContent.replace( /\s%/ig, ''), d);
                    return function(t) {
                        var format = d3.format('0,000');
                        this.textContent = i(t);
                        this.textContent = format(this.textContent) + valueSuffix;
                    };
                });
        }
    }

    var charts = document.querySelectorAll('figure');
    var ids = [];

    for (var i = 0; i < charts.length; i++) {
        ids[i] = charts[i].getAttribute('id');
        plotChart(ids[i], data[ids[i]])
    }

});

define();