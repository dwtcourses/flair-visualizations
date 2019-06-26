var d3 = require('d3');
var COMMON = require('../extras/common.js')();
var d3layoutcloud = require("../../d3-libs/d3.layout.cloud.js");
var Seedrandom = require("../../d3-libs/seedrandom.min.js");

var UTIL = require('../extras/util.js')();
var LEGEND = require('../extras/legend_barcharts.js')();

try {
    var d3Lasso = require("d3-lasso");

} catch (ex) { }


function wordcloud() {

    var _NAME = 'wordcloud';

    var _config,
        _dimension,
        _measure,
        _colorSet = [],
        _tooltip,

        _print,
        broadcast,
        filterParameters,
        isAnimationDisable = false,
        _notification = false,
        _data;

    var x = d3.scaleBand(), y = d3.scaleLinear();
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };

    var _local_svg, _Local_data, _originalData

    var tickLength = d3.scaleLinear()
        .domain([22, 34])
        .range([2, 4]);

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, parentContainer;
    var parentWidth, parentHeight, plotWidth, plotHeight, container;

    var filter = false, filterData = [];
    var threshold = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.colorSet(config.colorSet);
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.text + "</td>"
            + "</tr><tr>"
            + "<th>" + chart.measure() + ": </th>"
            + "<td>" + getValue(datum.text) + " </td>"
            + "</tr></table>";

        return output;
    }

    var setData = function (data) {
        var result = [];
        data.map(function (d) {
            var value = new Object();
            value['text'] = d[_dimension];
            value['size'] = d[_measure];
            result.push(value);
        })
        return result;
    }
    var getValue = function (recoed) {
        var result = 0;
        _Local_data.map(function (val) {
            if (recoed == val[_dimension]) {
                result = val[_measure];
            }
        })
        return result;
    }
    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).style('fill')
            d3.select(this)
                .style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill-opacity', '0.5')
                .style('stroke', border)
                .style('stroke-width', '2px;');

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border, _notification);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = d3.select(this).style('fill')
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border, _notification);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).style('fill')
            d3.select(this)
                .style('cursor', 'default')
                .style('fill-opacity', '1')
                .style('stroke', 'none')
                .style('stroke-width', '0px;');

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    var applyFilter = function () {
        return function () {
            if (broadcast) {
                broadcast.updateWidget = {};
                broadcast.filterSelection.id = null;
                broadcast.$broadcast('flairbiApp:filter-input-refresh');
                broadcast.$broadcast('flairbiApp:filter');
                broadcast.$broadcast('flairbiApp:filter-add');
                d3.select(this.parentNode)
                    .style('visibility', 'hidden');
            }
        }
    }
    var clearFilter = function (div) {
        return function () {
            chart.update(_originalData);
            parentContainer.select('.confirm')
                .style('visibility', 'hidden');
        }
    }


    function chart(selection) {

        data = UTIL.sortingData(_data, _dimension[0])
        _Local_data = _originalData = data;

        if (_print && !_notification) {
            parentContainer = selection;
        }
        else {
            parentContainer = d3.select('#' + selection.id)
        }

        var svg = parentContainer.append('svg')
            .attr('width', parentContainer.attr('width'))
            .attr('height', parentContainer.attr('height'))

        var width = +svg.attr('width'),
            height = +svg.attr('height');

        _local_svg = svg;

        parentContainer.append('div')
            .attr('class', 'custom_tooltip');

        parentWidth = width - 2 * COMMON.PADDING;
        parentHeight = (height - 2 * COMMON.PADDING);

        svg.attr('width', width)
            .attr('height', height)

        drawPlot.call(this, data);
    }


    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;
        if (_tooltip) {
            tooltip = parentContainer.select('.custom_tooltip');
        }
        var colour = d3.schemePaired;

        Seedrandom('heo.');
        var words = setData(data);
        var maxSize = d3.max(words, function (d) { return d.size; });
        var minSize = d3.min(words, function (d) { return d.size; });
        var fontSizeScale = d3.scalePow().exponent(5).domain([0, 1]).range([10, parentWidth * 15 / 100]);

        d3layoutcloud()
            .size([parentWidth, parentHeight])
            .words(words)
            .rotate(function () { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .fontSize(function (d) {
                return fontSizeScale(d.size / maxSize);;
            })
            .on("end", drawSkillCloud)
            .fontWeight(['bold'])
            .spiral('rectangular')
            .start();

        function drawSkillCloud(words) {
            var text = _local_svg
                .append("g")
                .attr("transform", "translate(" + ~~(parentWidth / 2) + "," + ~~(parentHeight / 2) + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) {
                    return d.size + "px";
                })
                .style("-webkit-touch-callout", "none")
                .style("-webkit-user-select", "none")
                .style("-khtml-user-select", "none")
                .style("-moz-user-select", "none")
                .style("-ms-user-select", "none")
                .style("user-select", "none")
                .style("cursor", "default")
                .style("font-family", "Impact")
                .style("fill", function (d, i) {
                    return colour[i];
                })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) {
                    return d.text;
                })
            if (!_print) {

                var _filter = UTIL.createFilterElement()
                $('#' + parentContainer.attr('id')).append(_filter);

                text.on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                    .on('click', function (d, i) {
                        var confirm = parentContainer.select('.confirm')
                            .style('visibility', 'visible');
                        filter = false;

                        var point = d3.select(this);
                        if (point.classed('selected')) {
                            point.classed('selected', false);
                        } else {
                            point.classed('selected', true);
                        }

                        var _filterDimension = {};
                        if (broadcast.filterSelection.id) {
                            _filterDimension = broadcast.filterSelection.filter;
                        } else {
                            broadcast.filterSelection.id = parentContainer.attr('id');
                        }

                        var dimension = _dimension;
                        if (_filterDimension[dimension]) {
                            var temp = _filterDimension[dimension];
                            if (temp.indexOf(d.text) < 0) {
                                temp.push(d.text);
                            } else {
                                temp.splice(temp.indexOf(d.text), 1);
                            }
                            _filterDimension[dimension] = temp;
                        } else {
                            _filterDimension[dimension] = [d.text];
                        }

                        var idWidget = broadcast.updateWidget[parentContainer.attr('id')];
                        broadcast.updateWidget = {};
                        broadcast.updateWidget[parentContainer.attr('id')] = idWidget;
                        broadcast.filterSelection.filter = _filterDimension;
                        var _filterParameters = filterParameters.get();
                        _filterParameters[dimension] = _filterDimension[dimension];
                        filterParameters.save(_filterParameters);
                    });

                parentContainer.select('.filterData')
                    .on('click', applyFilter());

                parentContainer.select('.removeFilter')
                    .on('click', clearFilter(parentContainer));
            }
        }
    }

    chart._getName = function () {
        return _NAME;
    }

    chart._getHTML = function () {
        return _local_svg.node().outerHTML;
    }

    chart.update = function (data) {

        _local_svg.selectAll('text').remove();

        drawPlot(data);
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.dimension = function (value) {
        if (!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.colorSet = function (value) {
        if (!arguments.length) {
            return _colorSet;
        }
        _colorSet = value;
        return chart;
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.print = function (value) {
        if (!arguments.length) {
            return _print;
        }
        _print = value;
        return chart;
    }

    chart.broadcast = function (value) {
        if (!arguments.length) {
            return broadcast;
        }
        broadcast = value;
        return chart;
    }

    chart.filterParameters = function (value) {
        if (!arguments.length) {
            return filterParameters;
        }
        filterParameters = value;
        return chart;
    }
    chart.isAnimationDisable = function (value) {
        if (!arguments.length) {
            return isAnimationDisable;
        }
        isAnimationDisable = value;
        return chart;
    }
    chart.notification = function (value) {
        if (!arguments.length) {
            return _notification;
        }
        _notification = value;
        return chart;
    }
    chart.data = function (value) {
        if (!arguments.length) {
            return _data;
        }
        _data = value;
        return chart;
    }
    return chart;

}
module.exports = wordcloud;
