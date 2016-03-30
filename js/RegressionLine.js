//adapted from http://bl.ocks.org/benvandyke/8459843
var RegressionLine = function(){


    var api = {};

    api.make = function(svg, dots, decimalFormat ){

        var xSeries = [];
        var ySeries = [];

        var dot;

        for(var i = 0; i<dots[0].length;i++){
            circle = dots[0][i];
            xSeries.push(circle.getAttribute('cx'));
            ySeries.push(circle.getAttribute('cy'));
        }




        var leastSquaresCoeff = leastSquares(xSeries, ySeries);



        // apply the reults of the least squares regression
        var x1 = xSeries[0];
        var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
        var x2 = xSeries[xSeries.length - 1];
        var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
        var trendData = [[x1,y1,x2,y2]];

        var trendline = svg.selectAll(".trendline")
            .data(trendData);

        trendline.enter()
            .append("line")
            .attr("class", "trendline")
            .attr("x1", function(d) { return xScale(d[0]); })
            .attr("y1", function(d) { return yScale(d[1]); })
            .attr("x2", function(d) { return xScale(d[2]); })
            .attr("y2", function(d) { return yScale(d[3]); })
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // display equation on the chart
        svg.append("text")
            .text("eq: " + decimalFormat(leastSquaresCoeff[0]) + "x + " +
                decimalFormat(leastSquaresCoeff[1]))
            .attr("class", "text-label")
            .attr("x", function(d) {return xScale(x2) - 60;})
            .attr("y", function(d) {return yScale(y2) - 30;});

        // display r-square on the chart
        svg.append("text")
            .text("r-sq: " + decimalFormat(leastSquaresCoeff[2]))
            .attr("class", "text-label")
            .attr("x", function(d) {return xScale(x2) - 60;})
            .attr("y", function(d) {return yScale(y2) - 10;});
    }

    // returns slope, intercept and r-square of the line
    function leastSquares(xSeries, ySeries) {
        var reduceSumFunc = function(prev, cur) { return prev + cur; };

        var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
        var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

        var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
            .reduce(reduceSumFunc);

        var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
            .reduce(reduceSumFunc);

        var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
            .reduce(reduceSumFunc);

        var slope = ssXY / ssXX;
        var intercept = yBar - (xBar * slope);
        var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

        return [slope, intercept, rSquare];
    }

    return api;
}();