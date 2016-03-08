d3.marquee = function() {

    var items = null,
        hoverSelect = true,
        area = null,
        on = {start:function(){}, draw: function(){}, end: function(){}};

    function marquee() {
        // the element where the marquee was called
        var _this = d3.select(this[0][0]);

        // add a new group for the marquee
        var g = _this.append("g")
            .attr("class","marquee");



        // add an origin node
        var origin_node = g.append("circle")
            .attr("class","origin");

        // add a final node
        var final_node = g.append("circle")
            .attr("class","origin");

        // add a rect
        var lasso = g.append("polygon")
            .style("stroke-dasharray", ("2,2"))
            .style("stroke", "grey")
            .style("fill", "grey")
            .style("fill-opacity", .2);


        //used when setting up the marquee
        var doDraw = false

        // The marquee origin for calculations
        var origin;

        // The transformed marquee origin for rendering
        var torigin;

        var final;
        var tfinal;
        var rect;

        // The last known point on the marquee during drag - needed for evaluating edges
        var last_known_point;


        // Apply drag behaviors
        var drag = d3.behavior.drag()
            .on("dragstart",dragstart)
            .on("drag",dragmove)
            .on("dragend",dragend);

        // Call drag
        area.call(drag);

        function dragstart() {
            // Initialize paths

            rect = null;


            // Set every item to have a false selection and reset their center point and counters
            items[0].forEach(function(d) {
                d.hoverSelected = false;
                d.loopSelected = false;
                var box = d.getBoundingClientRect();
                d.marqueePoint = {
                    cx: Math.round(box.left + box.width/2),
                    cy: Math.round(box.top + box.height/2),
                    edges: {top:0,right:0,bottom:0,left:0},
                    close_edges: {left: 0, right: 0}
                };


            });

            // if hover is on, add hover function
            if(hoverSelect===true) {
                items.on("mouseover.marquee",function() {
                    // if hovered, change marquee selection attribute to true
                    d3.select(this)[0][0].hoverSelected = true;
                });
            }

            // Run user defined start function
            on.start();
        }

        //when relative size of a and b not known
        function is_between(n,a,b){
            if(a<b){
                return n>a && n<b;
            }
            return n<a && n>b;

        }

        function dragmove() {
            // Get mouse position within body, used for calculations
            var x = d3.event.sourceEvent.clientX;
            var y = d3.event.sourceEvent.clientY;
            // Get mouse position within drawing area, used for rendering
            var tx = d3.mouse(this)[0];
            var ty = d3.mouse(this)[1];

            // Initialize the path or add the latest point to it
            if (doDraw===false) {
                doDraw = true
                origin = [x,y];
                torigin = [tx,ty];
                final = [x,y];
                tfinal = [tx, ty];
                // Draw origin node
                origin_node
                    .attr("cx",tx)
                    .attr("cy",ty)
                    .attr("r",7)
                    .attr("display",null);
            }
            else {

                final = [x,y];
                tfinal = [tx, ty];

                final_node
                    .attr("cx",tx)
                    .attr("cy",ty)
                    .attr("r",7)
                    .attr("display",null);


                //lasso
                lasso
                    .attr("points", [tx,ty,tx,torigin[1],torigin[0],torigin[1],torigin[0],ty].join(','));  // x,y points
            }

            items[0].forEach(function(d) {
                if(is_between(d.marqueePoint.cx, x, origin[0]) && is_between(d.marqueePoint.cy, y, origin[1])){
                    d.loopSelected = true;
                }
                else{
                    d.loopSelected = false;
                }
            });


            d3.selectAll(items[0].filter(function(d) {return d.loopSelected;}))
                .each(function(d) {d.possible = true;});
            d3.selectAll(items[0].filter(function(d) {return !d.loopSelected;}))
                .each(function(d) {d.possible = false;});


            on.draw();

        }

        function dragend() {
            // Remove mouseover tagging function
            items.on("mouseover.marquee",null);

            // Tag selected items
            items.filter(function(d) {return d.possible === true;})
                .each(function(d) {d.selected = true;});

            items.filter(function(d) {return d.possible === false;})
                .each(function(d) {d.selected = false;});

            // Reset possible items
            items
                .each(function(d) {d.possible = false;});

            // Clear marquee

            origin_node.attr("display","none");
            final_node.attr("display","none");
            // Run user defined end function
            doDraw = false
            on.end();

        }
    }

    marquee.items  = function(_) {
        if (!arguments.length) return items;
        items = _;
        items[0].forEach(function(d) {
            var item = d3.select(d);
            if(typeof item.datum() === 'undefined') {
                item.datum({possible:false,selected:false});
            }
            else {
                var e = item.datum();
                e.possible = false;
                e.selected = false;
                item.datum(e);
            }
        });
        return marquee;
    };



    marquee.hoverSelect = function(_) {
        if (!arguments.length) return hoverSelect;
        hoverSelect = _===true ? true : false;
        return marquee;
    };

    marquee.on = function(type,_) {
        if(!arguments.length) return on;
        if(arguments.length===1) return on[type];
        var types = ["start","draw","end"];
        if(types.indexOf(type)>-1) {
            on[type] = _;
        }
        return marquee;
    };

    marquee.area = function(_) {
        if(!arguments.length) return area;
        area=_;
        return marquee;
    };


    return marquee;

};