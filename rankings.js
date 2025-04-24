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
      
function makeTable(results) {
  window.tableData = results.data;
        
  var data = results.data;
  const newTable = document.createElement("table");
  
  // Create header row with sort arrows
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  
  // Define headers
  const headers = [
    { text: "Rank", onclick: "sortTable(0)" },
    { text: "Coaster", onclick: "sortTable(1)" },
    { text: "Park", onclick: "sortTable(2)" },
    { text: "Manufacturer", onclick: "sortTable(3)" },
    { text: "Type", onclick: "sortTable(4)" },
    { text: "Opening Year", onclick: "sortTable(5, true)", id: "statHeader" }
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
    
    // Create cells for each data point
    const cells = [
      { key: "RANK" },
      { key: "COASTER" },
      { key: "PARK" },
      { key: "MANUFACTURER" },
      { key: "TYPE" },
      { key: "YEAR" }
    ];
    
    cells.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = data[j][cell.key] || "";
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
    if (tds.length >= 6) {
      tds[0].style.width = '3%';
      tds[1].style.width = '25%';
      tds[2].style.width = '25%';
      tds[3].style.width = '25%';
      tds[4].style.width = '7%';
      tds[5].style.width = '15%';
    }
  }
        
  var coasterCount = data[9]?.AGGREGATE_STATS || "N/A";
  var parkCount = data[14]?.AGGREGATE_STATS || "N/A";
  
  var coasterCountEl = getElement("coasterCountElement");
  var parkCountEl = getElement("parkCountElement");
  
  if (coasterCountEl) coasterCountEl.innerHTML = coasterCount;
  if (parkCountEl) parkCountEl.innerHTML = parkCount;
  
  console.log(coasterCount);
  console.log(parkCount);
  
  filterTable();
  showElements();
}
      
function filterTable() {
  var input = getElement("coasterInput");
  var select = getElement("selectManu");
  var selectt = getElement("selectType");
  var table = getElement("coasterTable");
  
  if (!table || !input || !select || !selectt) return;
  
  var filter = input.value.toUpperCase();
  var selectedOption = select.options[select.selectedIndex].value.toUpperCase();
  var selecttedOption = selectt.options[selectt.selectedIndex].value.toUpperCase();
  
  var tr = table.getElementsByTagName("tr");
  
  for (var i = 0; i < tr.length; i++) {
    var tds = tr[i].getElementsByTagName("td");
    if (tds.length >= 5) {
      var td = tds[1]; // coaster name
      var te = tds[2]; // park name
      var tdManu = tds[3]; // manufacturer
      var tdType = tds[4]; // type
      
      var txtValue = td.textContent || td.innerText;
      var txtValue2 = te.textContent || te.innerText;
      var manuValue = tdManu.textContent || tdManu.innerText;
      var typeValue = tdType.textContent || tdType.innerText;
      
      if ((txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) && 
          (selectedOption === "ALL MANUFACTURERS" || manuValue.toUpperCase().indexOf(selectedOption) > -1) &&
          (selecttedOption === "WOOD & STEEL" || typeValue.toUpperCase().indexOf(selecttedOption) > -1)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}

// Add event listeners safely
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

// show and hide for cosmetics
function hideElements() {
  const elements = ['selectManu', 'selectType', 'coasterInput', 'selectStat'];
  elements.forEach(id => {
    const element = getElement(id);
    if (element) {
      element.style.display = 'none';
    }
  });
}
    
function showElements() {
  const elements = ['selectManu', 'selectType', 'coasterInput', 'selectStat'];
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
  const coasterInput = getElement("coasterInput");
  
  if (!selectManu || !selectType || !coasterInput) return;
  
  var selectedManufacturer = selectManu.value;
  var selectedType = selectType.value;
  var searchQuery = coasterInput.value;

  var queryParams = new URLSearchParams();

  if (selectedManufacturer !== "") {
    queryParams.set("m", selectedManufacturer);
  }
      
  if (selectedType !== "") {
    queryParams.set("t", selectedType);
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
  const coasterInput = getElement("coasterInput");
  
  if (!selectManu || !selectType || !coasterInput) return;
  
  var selectedManufacturer = urlParams.get("m");
  var selectedType = urlParams.get("t");
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
    if (tr[i].getElementsByTagName("td").length > 5) {
      var td = tr[i].getElementsByTagName("td")[5];
      var dataIndex = i - 1;
      
      if (dataIndex < window.tableData.length) {
        td.textContent = window.tableData[dataIndex][statKey] || "N/A";
      }
    }
  }
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
