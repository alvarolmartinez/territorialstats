// script.js

// Dummy data for visualization (replace with actual data)
const data = [
    { clan: 'Clan A', scores: [
        { timestamp: '2024-02-23T08:00:00', score: 100 },
        { timestamp: '2024-02-23T12:00:00', score: 95 },
        { timestamp: '2024-02-24T08:00:00', score: 90 }
    ]},
    { clan: 'Clan B', scores: [
        { timestamp: '2024-02-23T08:00:00', score: 85 },
        { timestamp: '2024-02-23T12:00:00', score: 80 },
        { timestamp: '2024-02-24T08:00:00', score: 75 }
    ]},
    // Add more clans and scores as needed
];

// Create a simple line chart using D3.js
const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", 800)
    .attr("height", 400);

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const x = d3.scaleTime()
    .domain([
        d3.min(data, d => d3.min(d.scores, s => new Date(s.timestamp))),
        d3.max(data, d => d3.max(d.scores, s => new Date(s.timestamp)))
    ])
    .range([margin.left, width - margin.right]);

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.max(d.scores, s => s.score))])
    .range([height - margin.bottom, margin.top]);

const line = d3.line()
    .x(d => x(new Date(d.timestamp)))
    .y(d => y(d.score));

data.forEach(clan => {
    svg.append("path")
        .datum(clan.scores)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
});

svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
