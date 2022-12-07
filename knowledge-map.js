const d3_version = '3.4.6'

// noinspection JSFileReferences
require.config({
    paths: {
        d3: `https://cdnjs.cloudflare.com/ajax/libs/d3/${d3_version}/d3.min`
    }
});


require(['d3'], function (d3) {
    const defaultData = {
        "name": "root",
        "children": [
            {
                "name": "test default from js",
                "children": [
                    {
                        "name": "benchmarking",
                        "children": [
                            {
                                "author_color": "red",
                                "size": "4005",
                                "name": "t6726-patmat-analysis.scala",
                                "weight": 1.0,
                                "ownership": 0.9,
                                "children": []
                            },
                            {
                                "author_color": "red",
                                "size": "55",
                                "name": "TreeSetIterator.scala",
                                "weight": 0.88,
                                "ownership": 0.2,
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
    const clone = (obj) => JSON.parse(JSON.stringify(obj))
    var root = window.hasOwnProperty('json') ? clone(window.json) : clone(defaultData)

    const renderDivSelector = '.knowledge-loss-map';
    const parentDiv = document.querySelector(renderDivSelector);

    var margin = 10,
        outerDiameter = 960,
        innerDiameter = outerDiameter - margin - margin;

    var x = d3.scale.linear()
        .range([0, innerDiameter]);

    var y = d3.scale.linear()
        .range([0, innerDiameter]);

    var color = d3.scale.linear()
        .domain([-1, 5])
        .range(["hsl(185,60%,99%)", "hsl(187,40%,70%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
        .padding(2)
        .size([innerDiameter, innerDiameter])
        .value(function (d) {
            return d.size;
        })

    const svgChild = parentDiv.querySelector('svg');
    if (svgChild) {
        svgChild.remove()
    }
    var svg = d3.select(parentDiv).append("svg")
        .attr("width", '100%')
        .attr("height", '900px')
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    var focus = root,
        nodes = pack.nodes(root);

    svg.append("g").selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function (d) {
            return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("r", function (d) {
            return d.r;
        })
        .style("fill", function (d) {
            return d.weight > 0.0 ? d.author_color :
                d.children ? color(d.depth) : "WhiteSmoke";
        })
        .style("fill-opacity", function (d) {
            return d.ownership;
        })
        .on("click", function (d) {
            return zoom(focus == d ? root : d);
        });

    svg.append("g").selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .style("fill-opacity", function (d) {
            return d.parent === root ? 1 : 0;
        })
        .style("display", function (d) {
            return d.parent === root ? null : "none";
        })
        .text(function (d) {
            return d.name;
        });

    d3.select(renderDivSelector)
        .on("click", function () {
            zoom(root);
        });

    function zoom(d, i) {
        var focus0 = focus;
        focus = d;

        var k = innerDiameter / d.r / 2;
        x.domain([d.x - d.r, d.x + d.r]);
        y.domain([d.y - d.r, d.y + d.r]);
        d3.event.stopPropagation();

        var transition = d3
            .selectAll(`${renderDivSelector} text, ${renderDivSelector} circle`).transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function (d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            });

        transition.filter("circle")
            .attr("r", function (d) {
                return k * d.r;
            });

        transition.filter("text")
            .filter(function (d) {
                return d.parent === focus || d.parent === focus0;
            })
            .style("fill-opacity", function (d) {
                return d.parent === focus ? 1 : 0;
            })
            .each("start", function (d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .each("end", function (d) {
                if (d.parent !== focus) this.style.display = "none";
            });
    }

    d3.select(parentDiv);
});
