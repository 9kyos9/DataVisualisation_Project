/* global d3 */

// SVG 설정
const svg = d3.select("#my_dataviz")
    .attr("width", 800)
    .attr("height", 600);

const width = +svg.attr("width");
const height = +svg.attr("height");

// 지도 투영 설정
const projection = d3.geoMercator()
    .scale(100)
    .center([0, 20])
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// 색상 스케일 정의 (메달 효율성 기준)
const colorScale = d3.scaleThreshold()
    .domain([0.00001, 0.0001, 0.0005, 0.001, 0.002, 0.005])
    .range(d3.schemeBlues[7]);

const geojsonURL = "data/world.geojson";  // ✅ 로컬 버전

Promise.all([
    d3.json(geojsonURL),
    d3.csv("data/medal_efficiency.csv")  // 너가 업로드한 데이터
]).then(([geoData, medalData]) => {
    initMap(geoData);
    updateMap(2000, medalData); // 초기값: 2000

    d3.select("#year-slider").on("input", function () {
        const selectedYear = +this.value;
        d3.select("#year-label").text("Year: " + selectedYear);
        updateMap(selectedYear, medalData);
    });
});

function initMap(worldData) {
    svg.append("g")
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
        })
        .on("mouseleave", function () {
            d3.select(this)
                .transition().duration(200)
                .style("opacity", 0.8)
                .attr("stroke", "#999");
        });
}

function updateMap(year, data) {
    const filtered = data.filter(d => +d.Year === year);

    const efficiencyMap = new Map();
    filtered.forEach(d => {
        efficiencyMap.set(d.NOC, +d["Medal Efficiency"]);
    });

    svg.selectAll(".country")
        .transition()
        .duration(500)
        .attr("fill", d => {
            const code = d.id; // ISO Alpha-3 코드
            const eff = efficiencyMap.get(code);
            return eff != null ? colorScale(eff) : "#eee";
        });
}
