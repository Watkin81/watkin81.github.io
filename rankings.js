let sortDirections = {
  rank: 1, 
  stat: 1
};

function sortTable(columnIndex, isStat = false) {
  const table = document.getElementById('coasterTable');
  if (!table) return; // Exit if table doesn't exist yet
  
  const tbody = table.getElementsByTagName('tbody')[0];
  if (!tbody) return; // Exit if tbody doesn't exist
  
  const rows = Array.from(tbody.getElementsByTagName('tr'));
  
  // Update sort direction
  const direction = isStat ? 
    (sortDirections.stat = -sortDirections.stat) : 
    (sortDirections.rank = -sortDirections.rank);
  
  // Update sort arrow indicators - with additional error checking
  const headers = table.querySelectorAll('th');
  if (headers && headers.length > 0) {
    headers.forEach(header => {
      const arrow = header.querySelector('.sort-arrow');
      if (arrow) {
        arrow.style.display = 'none';
      }
    });
    
    if (columnIndex < headers.length) {
      const currentHeader = headers[columnIndex];
      const arrow = currentHeader.querySelector('.sort-arrow');
      if (arrow) {
        arrow.style.display = 'inline';
        arrow.textContent = (isStat ? sortDirections.stat : sortDirections.rank) > 0 ? '▲' : '▼';
      }
    }
  }

  rows.sort((a, b) => {
    const aValue = a.getElementsByTagName('td')[columnIndex].textContent.trim();
    const bValue = b.getElementsByTagName('td')[columnIndex].textContent.trim();
    
    // Special handling for N/A values - always send them to the bottom
    const isANA = aValue === 'N/A';
    const isBNA = bValue === 'N/A';
    
    if (isANA && isBNA) return 0;
    if (isANA) return 1; // Always put N/A at the bottom
    if (isBNA) return -1;
    
    // Handle numeric sorting
    const numA = parseFloat(aValue);
    const numB = parseFloat(bValue);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return (numA - numB) * direction;
    }
    
    // Text sorting
    return aValue.localeCompare(bValue) * direction;
  });

  // Reappend rows in the new sorted order
  rows.forEach(row => {
    tbody.appendChild(row);
  });

  if (window.tableData) {
    const sortedData = [];
    rows.forEach(row => {
      const dataIndex = parseInt(row.getAttribute('data-index'));
      if (!isNaN(dataIndex) && dataIndex < window.tableData.length) {
        sortedData.push(window.tableData[dataIndex]);
      }
    });
  
    window.tableData = sortedData;
    rows.forEach((row, index) => {
      row.setAttribute('data-index', index);
    });
  }
}

// Safely get DOM element with error handling
function getElement(id) {
  const element = document.getElementById(id);
  return element;
}

// Try to show the loader, but handle errors if it doesn't exist
try {
  const loader = getElement("loader");
  if (loader) {
    loader.style.display = "block";
  }
} catch (e) {
  console.log("Loader element not found");
}
      
var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1t3_wkdWKvjc4ShfH19wA3XxdOACtt6-elpsVk1Y9krs/pub?output=csv';

function init() {
  Papa.parse(public_spreadsheet_url, {
    download: true,
    header: true,
    complete: makeTable
  });
}

window.addEventListener('DOMContentLoaded', init);

// Turns "United States of America" into "United States" for display purposes (table + bar chart).
// Everything else passes through unchanged.
function abbreviateCountry(name) {
  if (!name) return name;
  var trimmed = name.trim();
  if (trimmed.toLowerCase() === "united states of america") {
    return "United States";
  }
  return trimmed;
}

// Turns "330 Coasters" into "330 coasters" so the combined summary line reads lowercase.
function lowerCountLabel(text) {
  if (!text || text === "N/A") return text;
  return text.replace(/^(\d+)\s+(\S+)/, function (_, num, word) {
    return num + ' ' + word.toLowerCase();
  });
}
      
function makeTable(results) {
  window.tableData = results.data;
        
  var data = results.data;
  const newTable = document.createElement("table");
  
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  
  // Define headers
  const headers = [
    { text: "Rank", onclick: "sortTable(0)" },
    { text: "Coaster", onclick: "sortTable(1)" },
    { text: "Park", onclick: "sortTable(2)" },
    { text: "Manufacturer", onclick: "sortTable(3)" },
    { text: "Type", onclick: "sortTable(4)" },
    { text: "Country", onclick: "sortTable(5)" },
    { text: "Opening Year", onclick: "sortTable(6, true)", id: "statHeader" }
  ];
  
  // Create header cells
  headers.forEach((header, index) => {
    const th = document.createElement("th");
    th.textContent = header.text + " ";
    th.setAttribute("onclick", header.onclick);
    if (header.id) {
      th.setAttribute("id", header.id);
    }
    
    const sortArrow = document.createElement("span");
    sortArrow.className = "sort-arrow";
    sortArrow.textContent = "▼";
    sortArrow.style.display = index === 0 ? "inline" : "none";
    
    th.appendChild(sortArrow);
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  newTable.appendChild(thead);
  
  // Create tbody element
  const tbody = document.createElement("tbody");
  newTable.appendChild(tbody);

  // Populate table rows
  for (var j = 0; j < data.length; j++) {
    const newRow = document.createElement("tr");
    newRow.setAttribute('data-index', j);
    
    // Create cells for each data point
    const cells = [
      { key: "RANK" },
      { key: "COASTER" },
      { key: "PARK" },
      { key: "MANUFACTURER" },
      { key: "TYPE" },
      { key: "Country", format: abbreviateCountry },
      { key: "YEAR" }
    ];
    
    cells.forEach(cell => {
      const td = document.createElement("td");
      var value = data[j][cell.key] || "";
      if (cell.format && value) {
        value = cell.format(value);
      }
      td.textContent = value;
      newRow.appendChild(td);
    });
    
    tbody.appendChild(newRow);
  }

  const coasterTableDiv = getElement('coasterTableDiv');
  if (coasterTableDiv) {
    coasterTableDiv.appendChild(newTable);
    newTable.setAttribute("id", "coasterTable");

    // Set column widths if we have cells
    const tds = document.getElementsByTagName('td');
    if (tds.length >= 7) {
      tds[0].style.width = '3%';
      tds[1].style.width = '22%';
      tds[2].style.width = '22%';
      tds[3].style.width = '20%';
      tds[4].style.width = '6%';
      tds[5].style.width = '12%';
      tds[6].style.width = '15%';
    }
  }
        
  var coasterCount = data[9]?.AGGREGATE_STATS || "N/A";
  var parkCount = data[14]?.AGGREGATE_STATS || "N/A";
  var countryCount = data[24]?.AGGREGATE_STATS || "N/A";
  
  var coasterCountEl = getElement("coasterCountElement");
  
  if (coasterCountEl) {
    coasterCountEl.innerHTML = [coasterCount, parkCount, countryCount]
      .map(lowerCountLabel)
      .join(' | ');
  }
  
  console.log(coasterCount, parkCount, countryCount);
  
  filterTable();
  showElements();
}
      
function filterTable() {
  var input = getElement("coasterInput");
  var select = getElement("selectManu");
  var selectt = getElement("selectType");
  var selectc = getElement("selectCountry");
  var table = getElement("coasterTable");
  
  if (!table || !input || !select || !selectt || !selectc) return;
  
  var filter = input.value.toUpperCase();
  var selectedOption = select.options[select.selectedIndex].value.toUpperCase();
  var selecttedOption = selectt.options[selectt.selectedIndex].value.toUpperCase();
  var selectedCountry = selectc.options[selectc.selectedIndex].value.toUpperCase();
  
  var tr = table.getElementsByTagName("tr");
  
  for (var i = 0; i < tr.length; i++) {
    var tds = tr[i].getElementsByTagName("td");
    if (tds.length >= 6) {
      var td = tds[1]; // coaster name
      var te = tds[2]; // park name
      var tdManu = tds[3]; // manufacturer
      var tdType = tds[4]; // type
      var tdCountry = tds[5]; // country
      
      var txtValue = td.textContent || td.innerText;
      var txtValue2 = te.textContent || te.innerText;
      var manuValue = tdManu.textContent || tdManu.innerText;
      var typeValue = tdType.textContent || tdType.innerText;
      var countryValue = tdCountry.textContent || tdCountry.innerText;
      
      if ((txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) && 
          (selectedOption === "ALL MANUFACTURERS" || manuValue.toUpperCase().indexOf(selectedOption) > -1) &&
          (selecttedOption === "WOOD & STEEL" || typeValue.toUpperCase().indexOf(selecttedOption) > -1) &&
          (selectedCountry === "ALL COUNTRIES" || countryValue.toUpperCase().indexOf(selectedCountry) > -1)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }

  updateStats();
}

// Build the simple stats + bar chart panel based on whatever rows are currently visible
function updateStats() {
  var table = getElement("coasterTable");
  var panel = getElement("statsPanel");
  if (!table || !panel || !window.tableData) return;

  var tbody = table.getElementsByTagName('tbody')[0];
  if (!tbody) return;

  var rows = Array.from(tbody.getElementsByTagName('tr')).filter(function (row) {
    return row.style.display !== "none";
  });

  var years = [], heights = [], speeds = [], drops = [];
  var countryCounts = {};
  var typeCounts = {};

  rows.forEach(function (row) {
    var idx = parseInt(row.getAttribute('data-index'));
    if (isNaN(idx) || !window.tableData[idx]) return;
    var d = window.tableData[idx];

    var y = parseFloat(d.YEAR); if (!isNaN(y)) years.push(y);
    var h = parseFloat(d.HIGHT); if (!isNaN(h)) heights.push(h);
    var s = parseFloat(d.SPED); if (!isNaN(s)) speeds.push(s);
    var dr = parseFloat(d.DROP); if (!isNaN(dr)) drops.push(dr);

    var c = abbreviateCountry(d.Country) || "Unknown";
    countryCounts[c] = (countryCounts[c] || 0) + 1;

    var t = (d.TYPE || "").trim() || "Unknown";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  function avg(arr, decimals) {
    if (arr.length === 0) return "N/A";
    var d = typeof decimals === "number" ? decimals : 1;
    return (arr.reduce(function (a, b) { return a + b; }, 0) / arr.length).toFixed(d);
  }

  var html = '<div class="statsRow">';
  html += statBox("Coasters Shown", rows.length);
  html += statBox("Avg Opening Year", avg(years, 0));
  html += statBox("Avg Height (ft)", avg(heights, 1));
  html += statBox("Avg Speed (mph)", avg(speeds, 1));
  html += statBox("Avg Drop (ft)", avg(drops, 1));
  html += '</div>';

  html += buildBarChart("By Country", countryCounts);
  html += buildBarChart("By Type", typeCounts);

  panel.innerHTML = html;
}

function statBox(label, value) {
  return '<div class="statBox"><span class="statValue">' + value + '</span><span class="statLabel">' + label + '</span></div>';
}

function buildBarChart(title, counts) {
  var entries = Object.keys(counts).map(function (k) { return [k, counts[k]]; });
  entries.sort(function (a, b) { return b[1] - a[1]; });

  if (entries.length === 0) {
    return '';
  }

  var max = entries.reduce(function (m, e) { return Math.max(m, e[1]); }, 1);

  var html = '<div class="barChart"><h4>' + title + '</h4>';
  entries.forEach(function (entry) {
    var label = entry[0];
    var count = entry[1];
    var pct = (count / max) * 100;
    html += '<div class="barRow">';
    html += '<span class="barLabel">' + label + '</span>';
    html += '<div class="barTrack"><div class="barFill" style="width:' + pct + '%;"></div></div>';
    html += '<span class="barCount">' + count + '</span>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

// Add event listeners
function addEventListenerSafely(id, event, handler) {
  const element = getElement(id);
  if (element) {
    element.addEventListener(event, handler);
  }
}

// Add event listeners with error handling
addEventListenerSafely("coasterInput", "keyup", function() {
  filterTable();
  updateURLParams();
});

addEventListenerSafely("selectManu", "change", function() {
  filterTable();
  updateURLParams();
});

addEventListenerSafely("selectType", "change", function() {
  filterTable();
  updateURLParams();
});

addEventListenerSafely("selectCountry", "change", function() {
  filterTable();
  updateURLParams();
});

addEventListenerSafely("selectStat", "change", function() {
  var selectedStat = this.value;
  
  switch (selectedStat) {
    case "inversions":
      updateStatColumn("INVER");
      break;
    case "height":
      updateStatColumn("HIGHT");
      break;
    case "speed":
      updateStatColumn("SPED");
      break;
    case "drop":
      updateStatColumn("DROP");
      break;
    default:
      updateStatColumn("YEAR");
  }
});

// Copies key visual properties (font, border, padding, etc.) from one dropdown to another so
// dynamically-added selects (like Country) look identical to the ones already styled by rankings.css.
function matchDropdownStyle(referenceId, targetId) {
  var reference = getElement(referenceId);
  var target = getElement(targetId);
  if (!reference || !target) return;

  var computed = window.getComputedStyle(reference);
  var props = [
    'fontFamily', 'fontSize', 'fontWeight', 'color',
    'backgroundColor', 'border', 'borderRadius', 'padding',
    'margin', 'height', 'boxShadow', 'cursor', 'appearance'
  ];

  props.forEach(function (prop) {
    try {
      target.style[prop] = computed[prop];
    } catch (e) {
      // Ignore unsupported properties on older browsers
    }
  });
}

// show and hide for cosmetics
function hideElements() {
  const elements = ['selectManu', 'selectType', 'selectCountry', 'coasterInput', 'selectStat'];
  elements.forEach(id => {
    const element = getElement(id);
    if (element) {
      element.style.display = 'none';
    }
  });
}
    
function showElements() {
  matchDropdownStyle('selectManu', 'selectCountry');

  const elements = ['selectManu', 'selectType', 'selectCountry', 'coasterInput', 'selectStat'];
  elements.forEach(id => {
    const element = getElement(id);
    if (element) {
      element.style.display = 'inline-block';
    }
  });
  
  const loader = getElement("loader");
  if (loader) {
    loader.style.display = "none";
  }
}

function updateURLParams() {
  const selectManu = getElement("selectManu");
  const selectType = getElement("selectType");
  const selectCountry = getElement("selectCountry");
  const coasterInput = getElement("coasterInput");
  
  if (!selectManu || !selectType || !selectCountry || !coasterInput) return;
  
  var selectedManufacturer = selectManu.value;
  var selectedType = selectType.value;
  var selectedCountry = selectCountry.value;
  var searchQuery = coasterInput.value;

  var queryParams = new URLSearchParams();

  if (selectedManufacturer !== "") {
    queryParams.set("m", selectedManufacturer);
  }
      
  if (selectedType !== "") {
    queryParams.set("t", selectedType);
  }

  if (selectedCountry !== "") {
    queryParams.set("c", selectedCountry);
  }
      
  if (searchQuery !== "") {
    queryParams.set("s", searchQuery);
  }
            
  var queryString = queryParams.toString();
            
  if (queryString !== "") {
    history.replaceState(null, null, "?" + queryString);
  } else {
    history.replaceState(null, null, window.location.pathname);
  }
}

function applyURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  
  const selectManu = getElement("selectManu");
  const selectType = getElement("selectType");
  const selectCountry = getElement("selectCountry");
  const coasterInput = getElement("coasterInput");
  
  if (!selectManu || !selectType || !selectCountry || !coasterInput) return;
  
  var selectedManufacturer = urlParams.get("m");
  var selectedType = urlParams.get("t");
  var selectedCountry = urlParams.get("c");
  var searchQuery = urlParams.get("s");
      
  if (selectedManufacturer && Array.from(selectManu.options).some(option => option.value === selectedManufacturer)) {
    selectManu.value = selectedManufacturer;
  } else {
    selectManu.value = "";
  }
      
  if (selectedType && Array.from(selectType.options).some(option => option.value === selectedType)) {
    selectType.value = selectedType;
  } else {
    selectType.value = "";
  }

  if (selectedCountry && Array.from(selectCountry.options).some(option => option.value === selectedCountry)) {
    selectCountry.value = selectedCountry;
  } else {
    selectCountry.value = "";
  }
      
  if (searchQuery) {
    coasterInput.value = searchQuery;
  }
      
  filterTable();
}
      
function updateStatColumn(statKey) {
  var table = getElement("coasterTable");
  if (!table) return;
  
  var tr = table.getElementsByTagName("tr");
  if (!tr || tr.length === 0) return;

  var statTitles = {
    "YEAR": "Opening Year",
    "INVER": "Inversions",
    "HIGHT": "Height (ft)",
    "SPED": "Speed (mph)",
    "DROP": "Drop (ft)"
  };

  // Update the header with the correct title
  var statHeader = getElement("statHeader");
  if (statHeader) {
    // Save any existing arrow
    const existingArrow = statHeader.querySelector('.sort-arrow');
    
    // Set the new title
    statHeader.textContent = statTitles[statKey] || "Opening Year";
    statHeader.textContent += " ";
    
    // Create new arrow or reuse existing
    const arrow = existingArrow || document.createElement("span");
    arrow.className = "sort-arrow";
    arrow.textContent = "▼";
    arrow.style.display = "inline";
    
    // Only append if it's not already there
    if (!existingArrow) {
      statHeader.appendChild(arrow);
    }
  }

  // Ensure tableData exists
  if (!window.tableData) return;

  // Update the table cells
  for (var i = 1; i < tr.length; i++) {
    if (tr[i].getElementsByTagName("td").length > 6) {
      var td = tr[i].getElementsByTagName("td")[6];
      var dataIndex = parseInt(tr[i].getAttribute('data-index'));
      
      if (!isNaN(dataIndex) && dataIndex < window.tableData.length) {
        td.textContent = window.tableData[dataIndex][statKey] || "N/A";
      }
    }
  }

  updateStats();
}

// Apply URL params when DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
  try {
    applyURLParams();
  } catch (e) {
    console.error("Error applying URL params:", e);
  }
});

// Hide elements when page loads
window.onload = function() {
  try {
    hideElements();
  } catch (e) {
    console.error("Error hiding elements:", e);
  }
};
