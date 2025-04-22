/*global d3*/

const margin = { top: 30, right: 300, bottom: 200, left: 100 };

let currentData;

// SVG 크기를 안전하게 가져오기
const svgElement = d3.select("#stacked-bar").node().parentNode;
const { width: svgWidth, height: svgHeight } = svgElement.getBoundingClientRect();

const svgContainer = d3.select("#stacked-bar")
    .attr("viewBox", `0 0 ${svgWidth + margin.right} ${svgHeight + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// 내부 margin 적용을 위한 그룹
const svg2 = svgContainer
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


const colors = {
    Gold: "#ffd700",
    Silver: "#c0c0c0",
    Bronze: "#cd7f32"
};

const nocToIso = {
    USA: "us", KOR: "kr", JPN: "jp", CHN: "cn", GBR: "gb", GER: "de",
    RUS: "ru", FRA: "fr", ITA: "it", AUS: "au", CAN: "ca", BRA: "br",
    ESP: "es", NED: "nl", SWE: "se", SUI: "ch", HUN: "hu", POL: "pl",
    ARG: "ar", AUT: "at", BEL: "be", BUL: "bg", CUB: "cu", DEN: "dk",
    FIN: "fi", GRE: "gr", NOR: "no", ROU: "ro",
    EUN: "ru", ROC: "ru", URS: "ru",
    FRG: "de", GDR: "de", TCH: "cz", YUG: "rs"
};

d3.csv("../data/top10_medals_per_year.csv").then(data => {
    data.forEach(d => {
        d.Year = +d.Year;
        d.Gold = +d.Gold;
        d.Silver = +d.Silver;
        d.Bronze = +d.Bronze;
        d.Total = +d.Total;
        currentData = data;
    });

    initStackedBar(data);
});

function initStackedBar(data) {
    const yearSlider = d3.select("#year-slider2");
    const yearLabel = d3.select("#year-label2");

    yearSlider.on("input", function () {
        const year = +this.value;
        yearLabel.text("Year: " + year);
        updateStackedBar(data, year);
    });

    updateStackedBar(data, +yearSlider.property("value"));
}

let playing = false;
let playInterval = null;

const playIcon = `
<svg id="play-icon" width="20" height="20" viewBox="0 0 20 20" fill="#f5c138">
  <polygon points="4,2 16,10 4,18"></polygon>
</svg>`;

const pauseIcon = `
<svg id="pause-icon" width="20" height="20" viewBox="0 0 20 20" fill="#f5c138">
  <rect x="4" y="2" width="4" height="16"></rect>
  <rect x="12" y="2" width="4" height="16"></rect>
</svg>`;

d3.select("#play-button").on("click", function () {
    const button = d3.select(this);
    playing = !playing;

    if (playing) {
        button.html(pauseIcon);
        playInterval = setInterval(() => {
            const slider = d3.select("#year-slider2");
            let year = +slider.property("value");
            const maxYear = +slider.attr("max");
            const step = +slider.attr("step");

            year += step;
            if (year > maxYear) year = +slider.attr("min");

            slider.property("value", year);
            d3.select("#year-label2").text("Year: " + year);
            updateStackedBar(currentData, year);
        }, 1000);
    } else {
        button.html(playIcon);
        clearInterval(playInterval);
    }
});

function updateStackedBar(data, year) {

    const yearData = data.filter(d => d.Year === year);

    const keys = ["Gold", "Silver", "Bronze"];
    const stack = d3.stack().keys(keys)(yearData);

    const x = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d.Total)])
        .range([0, svgWidth]);

    const y = d3.scaleBand()
        .domain(yearData.map(d => d.NOC))
        .range([0, svgHeight])
        .padding(0.1);

    console.log("🔥 막대 두께(px):", y.bandwidth());

    svg2.selectAll(".layer").remove();

    svg2.selectAll(".layer")
        .data(stack)
        .enter()
        .append("g")
        .attr("class", "layer")
        .attr("fill", d => colors[d.key])
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("y", d => y(d.data.NOC))
        .attr("x", d => x(d[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth());

    svg2.selectAll(".x-axis").remove();
    svg2.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${svgHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

    svg2.selectAll(".x-label").remove();
    svg2.append("text")
        .attr("class", "x-label")
        .attr("x", svgWidth / 2)
        .attr("y", svgHeight + 50)
        .attr("text-anchor", "middle")
        .text("Total Medal Count");

    svg2.selectAll(".y-axis").remove();
    svg2.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg2.selectAll(".y-label").remove();
    svg2.append("text")
        .attr("class", "y-label")
        .attr("x", -svgHeight/3)
        .attr("y", -80)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Country (NOC)");

    svg2.selectAll(".layer").remove();
    svg2.selectAll(".layer")
        .data(stack)
        .enter()
        .append("g")
        .attr("class", "layer")
        .attr("fill", d => colors[d.key])
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("y", d => y(d.data.NOC))
        .attr("x", d => x(d[0]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth());

    // ✅ ③ 바 라벨은 막대 뒤에 추가
    svg2.selectAll(".bar-label").remove();
    svg2.selectAll(".bar-label")
        .data(yearData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.Total) + 5)
        .attr("y", d => y(d.NOC) + y.bandwidth() / 2 + 4)
        .text(d => d.Total)
        .style("font-size", "12px")
        .style("fill", "#444");

    svg2.selectAll(".flag-icon").remove();
    svg2.selectAll(".flag-icon")
        .data(yearData)
        .enter()
        .append("image")
        .attr("class", "flag-icon")
        .attr("xlink:href", d => {
            const iso = nocToIso[d.NOC];
            return iso ? `https://flagcdn.com/w40/${iso}.png` : null;
        })
        .attr("x", -60)
        .attr("y", d => y(d.NOC) + y.bandwidth() / 2 - 8)
        .attr("width", 24)
        .attr("height", 16);

    svg2.selectAll(".legend").remove();
    const legend = svg2.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${svgWidth - 100}, 0)`)

    const legendItems = ["Gold", "Silver", "Bronze"];
    legend.selectAll("rect")
        .data(legendItems)
        .enter()
        .append("rect")
        .attr("x", 200)
        .attr("y", (d, i) => i * 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => colors[d]);

    legend.selectAll("text")
        .data(legendItems)
        .enter()
        .append("text")
        .attr("x", 220)
        .attr("y", (d, i) => i * 20 + 7)
        .text(d => d)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
}
