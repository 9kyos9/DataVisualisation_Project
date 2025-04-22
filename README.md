## DataVisualisation_Project
# Part 3: Implementation

## ✅ Implemented Visualization
This project implements two interactive visualizations addressing **Q1: How have team performance trends evolved when visualized in terms of medal efficiency relative to the number of athletes?**

### 1. Choropleth Map
Displays medal efficiency by country using a gold-based color scale. Countries are colored based on their medals-per-athlete ratio. A year slider enables temporal filtering, and a tooltip shows detailed values for each country.

### 2. Racing Stacked Bar Chart
Animated bar chart that ranks the top 10 countries by total medal count for each year. Bars are stacked by medal type (Gold, Silver, Bronze). A year slider and autoplay button allow users to explore performance over time.

---

## 📊 Dataset
- **medal_efficiency.csv**: contains year, NOC (team code), number of athletes, and medal efficiency
- **olympics_dataset.csv**: athlete-level Olympic data including name, gender, team, event, medal
- **top10_medals_per_year.csv**: preprocessed dataset of yearly top-10 countries with medal counts per type
- **world.geo.json**: GeoJSON file for country shapes

---

## 🛠 Tools & Libraries
- **D3.js (v6)**
- HTML/CSS/JS
- Visual Studio Code / WebStorm for local development

---

## 🧩 Interactivity
- Choropleth Map:
    - Year slider to update medal efficiency
    - Tooltip on hover with country name and efficiency value
- Racing Bar Chart:
    - Year slider + autoplay button
    - Medal type color-coded stacks
    - National flag images beside bars

---

## ⚠️ Notes & Challenges
- Mapping NOC codes to GeoJSON features required preprocessing and custom ISO mappings.
- Scaling and responsiveness were implemented using SVG `viewBox` and `preserveAspectRatio`.
- Ensuring smooth animation and interaction compatibility across screen sizes was a key design focus.


