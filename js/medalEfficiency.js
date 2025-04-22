/* global d3 */

let efficiencyMap = new Map();

// SVG setting
const svgNode = d3.select("#map_graph").node().parentNode;
const { width, height } = svgNode.getBoundingClientRect();

const svg1 = d3.select("#map_graph")
    .attr("viewBox", `0 0 ${width * 1.3} ${height *1.2}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .style("display", "block")
    .style("margin", "auto");

// map
const projection = d3.geoMercator()
    .scale(width / 6.5)
    .center([0, 50])
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const tooltip = d3.select("#tooltip");

const geoURL = "data/world.geo.json";

Promise.all([
    d3.json(geoURL),
    d3.csv("data/medal_efficiency_NOC_modified.csv")
]).then(([geoData, medalData]) => {
    initMap(geoData);
    initLegend();
    updateMap(2000, medalData);

    d3.select("#year-slider1").on("input", function () {
        const selectedYear = +this.value;
        d3.select("#year-label1").text("Year: " + selectedYear);
        updateMap(selectedYear, medalData);
    });
});

function initMap(worldData) {
    svg1.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#eee")
        .attr("stroke", "#999")
        .attr("class", "country")
        .style("opacity", 0.8)
        .on("mouseover", function () {
            d3.select(this)
                .transition().duration(200)
                .style("opacity", 1)
                .attr("stroke", "black");

            tooltip.style("opacity", 1);
        })
        .on("mousemove", function (event, d) {
            const info = efficiencyMap.get(d.id?.toUpperCase?.());

            tooltip
                .html(info
                    ? `<strong>${d.properties.name}</strong><br/>Medal Efficiency: ${info.efficiency.toFixed(5)}`
                    : `<strong>${d.properties.name}</strong><br/>Medal Efficiency: N/A`
                )
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", function () {
            d3.select(this)
                .transition().duration(200)
                .style("opacity", 0.8)
                .attr("stroke", "#999");

            tooltip.style("opacity", 0);
        });
}

function updateMap(year, data) {
    const filtered = data.filter(d => +d.Year === year);

    efficiencyMap = new Map(); // 재초기화

    filtered.forEach(d => {
        efficiencyMap.set(d.NOC.toUpperCase(), {
            efficiency: +d["Medal Efficiency"],
            noc: d.NOC
        });
    });

    const maxEfficiency = d3.max(filtered, d => +d["Medal Efficiency"]);

    const colorScale = d3.scaleSequential()
        .domain([0, 0.5 * maxEfficiency, maxEfficiency])
        .range(["#fff9c4", "#f5c138", "#ff9800"]);

    svg1.selectAll(".country")
        .transition()
        .duration(500)
        .attr("fill", d => {
            const info = efficiencyMap.get(d.id?.toUpperCase?.());
            return info ? colorScale(info.efficiency) : "#eee";
        });
}

function initLegend() {
    const legendWidth = 320;
    const legendHeight = 14;

    const colorScale = d3.scaleSequential()
        .domain([0, 0.5, 1]) // 초기 범위 (예시)
        .range(["#fff9c4", "#f5c138", "#ff9800"]);

    const legendSvg = d3.select("#legend")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", 60);

    const defs = legendSvg.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    linearGradient.selectAll("stop")
        .data(colorScale.range().map((color, i, nodes) => {
            return {
                offset: `${(i / (nodes.length - 1)) * 100}%`,
                color: color
            };
        }))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legendSvg.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5)
        .style("fill", "url(#legend-gradient)");

    legendSvg.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .text("Medal Efficiency")
        .style("font-size", "13px")
        .style("fill", "#333")
        .style("font-weight", "500");

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(6)
        .tickFormat(d3.format(".4f"))
        .ticks(6);

    legendSvg.append("g")
        .attr("transform", `translate(0, ${20 + legendHeight})`)
        .call(legendAxis)
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", "#333");
}
