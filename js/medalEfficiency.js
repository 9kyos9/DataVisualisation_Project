/* global d3 */

let efficiencyMap = new Map();

// SVG setting
const svgNode = d3.select("#map_graph").node().parentNode;
const { width, height } = svgNode.getBoundingClientRect();

const svg1 = d3.select("#map_graph")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width} ${height - 70}`);


// map
const projection = d3.geoMercator()
    .scale(width / 6.5)
    .center([0, 20])
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);


const tooltip = d3.select("#tooltip");

const geoURL = "../data/world.geo.json";

Promise.all([
    d3.json(geoURL),
    d3.csv("../data/medal_efficiency_NOC_modified.csv")
]).then(([geoData, medalData]) => {
    initMap(geoData);
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

            tooltip
                .style("opacity", 1);
        })
        .on("mousemove", function (event, d) {
            const info = efficiencyMap.get(d.id?.toUpperCase?.());


            tooltip
                .html(info
                    ? `<strong>${d.properties.name}</strong><br/>
                    Medal Efficiency: ${info.efficiency.toFixed(5)}`
                    : `<strong>${d.properties.name}</strong><br/>
                    Medal Efficiency: N/A`
                )
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", function () {
            d3.select(this)
                .transition().duration(200)
                .style("opacity", 0.8)
                .attr("stroke", "#999");

            tooltip
                .style("opacity", 0);
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
        .range(["#fff9c4", "#f5c138","#ff9800"]);

    svg1.selectAll(".country")
        .transition()
        .duration(500)
        .attr("fill", d => {
            const info = efficiencyMap.get(d.id?.toUpperCase?.());
            return info ? colorScale(info.efficiency) : "#eee";
        });
}


