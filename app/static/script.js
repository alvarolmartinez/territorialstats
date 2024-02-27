// TODO: add faint line to tooltip, implement range, implement choosing clans, implement colors
 

// Constants
const TRANSITION_DURATION = 50;
const CIRCLE_RADIUS = 2;
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 500;
const MARGIN = {top: 70, right: 30, bottom: 40, left: 80};
const TOOLTIP = {left: 80, bottom: 50, color: "white", width: 100, height: 120, opacity:0.6}
const LINE_COLOR = "steelblue";
const CIRCLE_FILL_COLOR = "steelblue";
const CIRCLE_STROKE_COLOR = "white";

// Avoiding weird initial transitions with a flag
let isFirstMove = true;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            // Dimensions and margins
            const width = SVG_WIDTH - MARGIN.left - MARGIN.right;
            const height = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

            // Set up the x and y scales
            const x = d3.scaleTime()
                .range([0, width]);
            const y = d3.scaleLinear()
                .range([height, 0]);

            // Create SVG element and append it to the chart container
            const svg = d3.select("#chart-container")
                .append("svg")
                    .attr("width", width + MARGIN.left + MARGIN.right)
                    .attr("height", height + MARGIN.top + MARGIN.bottom)
                .append("g")
                    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

            // Clan data
            var clanData = d3.group(data, d => d.clan_id);

            // Set the domains for the scales
            x.domain(d3.extent(data, d => new Date(d.timestamp)));
            y.domain([0, d3.max(data, d => +d.score)]);

            // Create a line generator function
            const line = d3.line()
                .x(d => x(new Date(d.timestamp)))
                .y(d => y(+d.score));

            // Bind data to SVG paths
            clanData.forEach(function(clan, id) {
                svg.append("path")
                    .datum(clan)
                    .attr("class", "line clan-" + id)
                    .attr("d", line)
                    .attr("fill", "none")
                    .style("stroke", LINE_COLOR);
                svg.append("circle")
                    .attr("class", "clan-circle clan-" + id)
                    .attr("r", 0)
                    .attr("fill", CIRCLE_FILL_COLOR)
                    .style("stroke", CIRCLE_STROKE_COLOR)
                    .attr("opacity", .70)
                    .style("pointer-events", "none")
            });


            // Tooltip
            const tooltipGroup = svg.append("g")
                .attr("class", "tooltip")
                .style("display", "none"); // Initially hidden

            // Rectangle for the tooltip
            tooltipGroup.append("rect")
                .attr("width", TOOLTIP.width)
                .attr("height", TOOLTIP.height)
                .attr("fill", TOOLTIP.color)
                .style("opacity", TOOLTIP.opacity);

            // Text for the tooltip
            const tooltipText = tooltipGroup.append("text")
                .attr("x", 10) // Horizontal padding inside the rect
                .attr("y", 25) // Vertical position inside the rect

            // Mouse move functions
            const listeningRect = svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("opacity", 0)

            listeningRect.on("mousemove", function(event){
                const [xCoord] = d3.pointer(event, this);
                const bisectDate = d3.bisector(d => new Date(d.timestamp)).left;
                const x0 = x.invert(xCoord);

                let tooltipContent = "";

                clanData.forEach(function(clanDataArray, clanId) {
                    const i = bisectDate(clanDataArray, x0, 1);
                    const d0 = clanDataArray[i - 1];
                    const d1 = clanDataArray[i] || clanDataArray[i - 1];
                    const d = x0 - new Date(d0.timestamp) > new Date(d1.timestamp) - x0 ? d1 : d0;
                    const circle = svg.select(".clan-circle.clan-" + clanId);
                    const newYPos = y(d.score);
                    const xPos = x(new Date(d.timestamp));

                    tooltipContent += `${clanId}: ${d.score}\n`;

                    if (isFirstMove) {
                        // For the first move, update position and radius without transition
                        circle.attr("cx", xPos)
                              .attr("cy", newYPos)
                              .attr("r", CIRCLE_RADIUS);

                        tooltipGroup
                            .style("display", "block")
                            .attr("transform", `translate(${xPos - TOOLTIP.left}, ${height/2 + TOOLTIP.bottom})`);
                          
                    } else {
                        // For subsequent moves, use transition
                        circle.transition()
                            .duration(TRANSITION_DURATION)
                            .attr("cx", xPos)
                            .attr("cy", newYPos)
                            .attr("r", CIRCLE_RADIUS);
                        tooltipGroup
                            .style("display", "block")
                            .transition()
                                .duration(TRANSITION_DURATION)
                                .attr("transform", `translate(${xPos - TOOLTIP.left}, ${height/2 - TOOLTIP.bottom})`); // Adjust as needed
                    }


                });

                tooltipText.selectAll("tspan").remove();

                tooltipContent.split("\n").forEach(function(line, index) {
                    tooltipText.append("tspan")
                        .attr("x", 10) // Horizontal position
                        .attr("y", 25 + (index * 20)) // Vertical position, adjust spacing as needed
                        .text(line);
                });

                if (isFirstMove){
                    isFirstMove = false;
                }
            });

            listeningRect.on("mouseleave", function() {
                tooltipGroup.style("display", "none");
            });
            
            // Add x-axis
            const xAxisGroup = svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x)
                    .ticks(d3.timeMonth.every(1))
                    .tickFormat(d3.timeFormat("%b %Y")));

            // Add y-axis
            const yAxisGroup = svg.append("g")
                .call(d3.axisLeft(y));

            xAxisGroup.selectAll("path").attr("class", "x-axis-path");
            xAxisGroup.selectAll("line").attr("class", "x-axis-tick");
            xAxisGroup.selectAll("text").attr("class", "x-axis-text");
            
            yAxisGroup.selectAll("path").attr("class", "y-axis-path");
            yAxisGroup.selectAll("line").attr("class", "y-axis-tick");
            yAxisGroup.selectAll("text").attr("class", "y-axis-text");

        })
        .catch(error => console.error('Error fetching data:', error));
});
