document.addEventListener('DOMContentLoaded', function() {
    // Variable declarations
    const input = document.getElementById('autocompleteInput');
    let clanNamesLoaded = false;
    let clanNames = [];
    let currentFocus = -1;

    // Utility functions
    function closeAllLists(except) {
        const items = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < items.length; i++) {
            if (except !== items[i] && except !== input) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }

    function getAutocompleteList() {
        const list = document.getElementById(input.id + "autocomplete-list");
        return list ? list.getElementsByTagName("div") : null;
    }

    function addActive(autocompleteList) {
        if (!autocompleteList) return false;
        removeActive(autocompleteList);
        if (currentFocus >= autocompleteList.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (autocompleteList.length - 1);
        autocompleteList[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(autocompleteList) {
        for (let i = 0; i < autocompleteList.length; i++) {
            autocompleteList[i].classList.remove("autocomplete-active");
        }
    }

    function updateAutocomplete() {
        var currentValue = input.value;
        closeAllLists();
        if (!currentValue) { return false; }
        var listDiv, itemDiv, i;
        listDiv = document.createElement("DIV");
        listDiv.setAttribute("id", this.id + "autocomplete-list");
        listDiv.setAttribute("class", "autocomplete-items");
        input.parentNode.appendChild(listDiv);
        if (clanNamesLoaded) {
            for (i = 0; i < clanNames.length; i++) {
                if (clanNames[i].substring(0, currentValue.length).toUpperCase() === currentValue.toUpperCase()) {
                    itemDiv = document.createElement("DIV");
                    itemDiv.innerHTML = "<strong>" + clanNames[i].substring(0, currentValue.length) + "</strong>";
                    itemDiv.innerHTML += clanNames[i].substring(currentValue.length);
                    itemDiv.innerHTML += "<input type='hidden' value='" + clanNames[i] + "'>";
                    itemDiv.addEventListener("click", function() {
                        input.value = this.getElementsByTagName("input")[0].value;
                        addChosenClan(autocompleteList[currentFocus].innerText)
                        closeAllLists();
                    });
                    itemDiv.addEventListener("mouseover", function(e) {
                        var index = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
                        currentFocus = index;
                        addActive(autocompleteList);
                    });
        
                    listDiv.appendChild(itemDiv);
                }
            }
            const autocompleteList = getAutocompleteList();
            if (autocompleteList && autocompleteList.length > 0) {
                currentFocus = 0;
                addActive(autocompleteList);
            } else {
                currentFocus = -1;
            }
        } else {
            itemDiv = document.createElement("DIV");
            itemDiv.innerHTML = "Loading clan names...";
            listDiv.appendChild(itemDiv);
        }


    }


    function addChosenClan(clan_name) {
        const chosenClans = document.getElementById('chosenClans');
        const clanDiv = document.createElement('div');
        clanDiv.className = 'chosen-clan';
        clanDiv.textContent = clan_name;

        const removeButton = document.createElement('button');
        removeButton.onclick = function() {
            removeClanFromChart(clanDiv.innerText);
            chosenClans.removeChild(clanDiv);
        };

        clanDiv.appendChild(removeButton);
        chosenClans.appendChild(clanDiv);
        updateClansChart(clan_name);
    }

    function initializeChart() {
        const ctx = document.getElementById('clansChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: { datasets: [] }, // Start with no datasets
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
                        },
                        title: {
                            display: true,
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: true,
                elements: {
                    line: {
                        tension: 0.5
                    },
                    point: {
                        radius: 0.5 
                    }
                },
            }
        });
    
        function updateClansChart(clan_id) {
            const url = `/clan_history?clan_id=${encodeURIComponent(clan_id)}`;
        
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Downsample the data
                    const minInterval = 1000000; // 1 minute in milliseconds, adjust as needed
                    let lastTimestamp = null;
                    const downsampledData = data.filter(item => {
                        if (lastTimestamp === null || new Date(item.timestamp) - new Date(lastTimestamp) >= minInterval) {
                            lastTimestamp = item.timestamp;
                            return true;
                        }
                        return false;
                    }).map(item => ({
                        x: item.timestamp,
                        y: item.score
                    }));
        
                    const newDataset = {
                        label: `${clan_id}`,
                        data: downsampledData,
                        borderColor: someFunctionToGetColor(),
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fill: false,
                    };
        
                    chart.data.datasets.push(newDataset);
                    chart.update();
                })
                .catch(error => {
                    console.error('Error fetching clan history for clan ID ' + clan_id, error);
                });
        }
        

        function removeClanFromChart(clan_id) {
            const datasetIndex = chart.data.datasets.findIndex(dataset => dataset.label === `${clan_id}`);
            if (datasetIndex !== -1) {
                chart.data.datasets.splice(datasetIndex, 1);
                chart.update();
            }
        }
    
        function someFunctionToGetColor() {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgb(${r}, ${g}, ${b})`;
        }
    
        return { chart, updateClansChart, removeClanFromChart };
    };

    // Fetching clan names and setting up autocomplete
    fetch('/clan_names')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            clanNamesLoaded = true;
            clanNames = data.map(item => item.clan_id);
            updateAutocomplete();
        })
        .catch(error => {
            console.error('Error fetching clan names', error);
        });

    // Event listeners
    input.addEventListener('input', updateAutocomplete);

    input.addEventListener("keydown", function(e) {
        const autocompleteList = getAutocompleteList();
        if (e.key === "ArrowDown") {
            currentFocus++;
            addActive(autocompleteList);
        } else if (e.key === "ArrowUp") {
            currentFocus--;
            addActive(autocompleteList);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (currentFocus > -1 && autocompleteList) {
                autocompleteList[currentFocus].click();
            }
        }
    });

    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });

    const { chart, updateClansChart, removeClanFromChart } = initializeChart();
});


