// TODO: add faint line to tooltip, implement range, implement choosing clans, implement colors
 

// Constants
const TRANSITION_DURATION = 50;
const CIRCLE_RADIUS = 2;
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 500;
const MARGIN = {top: 70, right: 40, bottom: 40, left: 40};
const CHART_BACKGROUND = {padding: 40, color: "black"}
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

            svg.insert("rect", ":first-child") // Inserting as the first child to ensure it's in the background
                .attr("x", -CHART_BACKGROUND.padding)
                .attr("y", -CHART_BACKGROUND.padding)
                .attr("width", SVG_WIDTH - MARGIN.left - MARGIN.right + 2 * CHART_BACKGROUND.padding)
                .attr("height", SVG_HEIGHT - MARGIN.top - MARGIN.bottom + 2 * CHART_BACKGROUND.padding)
                .attr("fill", CHART_BACKGROUND.color) 
                .attr("rx", 15) // Horizontal corner radius
                .attr("ry", 15); // Vertical corner radius

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

            // Faint cursor line
            const cursorLine = svg.append("line")
                .attr("class", "cursor-line")
                .attr("y1", 0)
                .attr("y2", height)
                .style("stroke", "grey")
                .style("opacity", 0.5)
                .style("display", "none"); // Initially hidden

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
                        // Circles
                        circle.attr("cx", xPos)
                              .attr("cy", newYPos)
                              .attr("r", CIRCLE_RADIUS);
                        // Tooltip
                        tooltipGroup
                            .style("display", "block")
                            .attr("transform", `translate(${xPos - TOOLTIP.left}, ${height/2 + TOOLTIP.bottom})`);
                        
                        // Cursor line
                        cursorLine
                            .attr("x1", xCoord)
                            .attr("x2", xCoord)
                            .style("display", null);
                          
                    } else {
                        // For subsequent moves, use transition
                        // Circles
                        circle.transition()
                            .duration(TRANSITION_DURATION)
                            .attr("cx", xPos)
                            .attr("cy", newYPos)
                            .attr("r", CIRCLE_RADIUS);
                        // Tooltip
                        tooltipGroup
                            .style("display", "block")
                            .transition()
                                .duration(TRANSITION_DURATION)
                                .attr("transform", `translate(${xPos - TOOLTIP.left}, ${height/2 - TOOLTIP.bottom})`);

                        // Cursor line
                        cursorLine.transition()
                            .duration(TRANSITION_DURATION)
                            .attr("x1", xPos)
                            .attr("x2", xPos)
                            .style("display", "block");
                    }
                });

                tooltipText.selectAll("tspan").remove();

                tooltipContent.split("\n").forEach(function(line, index) {
                    tooltipText.append("tspan")
                        .attr("x", 10)
                        .attr("y", 25 + (index * 20)) 
                        .text(line);
                });

                if (isFirstMove){
                    isFirstMove = false;
                }
            });

            listeningRect.on("mouseleave", function() {

                tooltipGroup.style("display", "none");
                cursorLine.style("display", "none");

                clanData.forEach(function(clanDataArray, clanId) {
                    var circle = svg.select(".clan-circle.clan-" + clanId);
                    circle.attr("r",0)

                })
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


            // Textbox input
            var clanNames = ["AFGHANISTAN", "BARBADOS", "COLOMBIA", "BARCELONA", "AFRICA", "AFEAR", "AFRODISIACO", "AFILAR", "AF1", "AF2", "AF3"]; 
            var input = document.getElementById('autocompleteInput');

            input.addEventListener('input', function() {
                var currentValue = this.value;
                closeAllLists();
                if (!currentValue) { return false; }
                var listDiv, itemDiv, i;
                listDiv = document.createElement("DIV");
                listDiv.setAttribute("id", this.id + "autocomplete-list");
                listDiv.setAttribute("class", "autocomplete-items");
                this.parentNode.appendChild(listDiv);
        
                for (i = 0; i < clanNames.length; i++) {
                    if (clanNames[i].substring(0, currentValue.length).toUpperCase() === currentValue.toUpperCase()) {
                      itemDiv = document.createElement("DIV");
                      itemDiv.innerHTML = "<strong>" + clanNames[i].substring(0, currentValue.length) + "</strong>";
                      itemDiv.innerHTML += clanNames[i].substring(currentValue.length);
                      itemDiv.innerHTML += "<input type='hidden' value='" + clanNames[i] + "'>";
                      itemDiv.addEventListener("click", function() {
                          input.value = this.getElementsByTagName("input")[0].value;
                          closeAllLists();
                      });
                      listDiv.appendChild(itemDiv);
                    }
                  }
                currentFocus = -1;
            });

            function closeAllLists(except) {
                var items = document.getElementsByClassName("autocomplete-items");
                for (var i = 0; i < items.length; i++) {
                    if (except != items[i] && except != input) {
                        items[i].parentNode.removeChild(items[i]);
                    }
                }
            }
        
            document.addEventListener("click", function (e) {
                closeAllLists(e.target);
            });

            let currentFocus = -1;

            input.addEventListener("keydown", function(e) {
                var autocompleteList = document.getElementById(this.id + "autocomplete-list");
                if (autocompleteList) autocompleteList = autocompleteList.getElementsByTagName("div");
                if (e.key == "ArrowDown") {
                    currentFocus++;
                    addActive(autocompleteList);
                } else if (e.key == "ArrowUp") {
                    currentFocus--;
                    addActive(autocompleteList);
                } else if (e.key == "Enter") {
                    e.preventDefault();
                    if (currentFocus > -1) {
                        if (autocompleteList) autocompleteList[currentFocus].click();
                    }
                }
            });
            
            // Rest of your functions like addActive, removeActive, etc.
            

            function addActive(autocompleteList) {
                if (!autocompleteList) return false;
                removeActive(autocompleteList);
                if (currentFocus >= autocompleteList.length) currentFocus = 0;
                if (currentFocus < 0) currentFocus = (autocompleteList.length - 1);
                // Add class "autocomplete-active" to the active item
                autocompleteList[currentFocus].classList.add("autocomplete-active");
            }

            function removeActive(autocompleteList) {
                // Remove the "active" class from all autocomplete items
                for (var i = 0; i < autocompleteList.length; i++) {
                    autocompleteList[i].classList.remove("autocomplete-active");
                }
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});
