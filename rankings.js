let sortDirections = {
  rank: 1, 
  stat: 1
};

function sortTable(columnIndex, isStat = false) {
  const table = document.getElementById('coasterTable');
  const rows = Array.from(table.getElementsByTagName('tr')).slice(1); // Skip header row
  
 
  const direction = isStat ? 
    (sortDirections.stat = -sortDirections.stat) : 
    (sortDirections.rank = -sortDirections.rank);

  rows.sort((a, b) => {
    const aValue = a.getElementsByTagName('td')[columnIndex].textContent.trim();
    const bValue = b.getElementsByTagName('td')[columnIndex].textContent.trim();
    
    // Handle numeric sorting
    const numA = parseFloat(aValue);
    const numB = parseFloat(bValue);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return (numA - numB) * (isStat ? sortDirections.stat : sortDirections.rank);
    }
    

    return aValue.localeCompare(bValue) * (isStat ? sortDirections.stat : sortDirections.rank);
  });


  const tbody = table.getElementsByTagName('tbody')[0] || table;
  rows.forEach(row => tbody.appendChild(row));
}

// show the loader (default on, turns off once the table loads fully)
document.getElementById("loader").style.display = "block";
      
var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1t3_wkdWKvjc4ShfH19wA3XxdOACtt6-elpsVk1Y9krs/pub?output=csv';

function init() {
  Papa.parse(public_spreadsheet_url, {
    download: true,
    header: true,
    complete: makeTable
  })
}

window.addEventListener('DOMContentLoaded', init)
      
function makeTable(results) {
 
  window.tableData = results.data;
        
  var data = results.data
  const newTable = document.createElement("table");
  newTable.innerHTML = `
    <thead>
      <th onclick="sortTable(0)">Rank 
        <span class="sort-arrow">▼</span>
      </th>
      <th onclick="sortTable(1)">Coaster</th>
      <th onclick="sortTable(2)">Park</th>
      <th onclick="sortTable(3)">Manufacturer</th>
      <th onclick="sortTable(4)">Type</th>
      <th id="statHeader" onclick="sortTable(5, true)">Opening Year 
        <span class="sort-arrow">▼</span>
      </th>
    </thead>
    <tbody></tbody>
  `;

  var j = 0;
  while (j < data.length){
    const newRow = document.createElement("tr");
    const tdRank = document.createElement("td");
    const tdCoaster = document.createElement("td");
    const tdPark = document.createElement("td");
    const tdManu = document.createElement("td");
    const tdType = document.createElement("td");
    const tdStat = document.createElement("td");
    tdRank.textContent = data[j].RANK;
    tdCoaster.textContent = data[j].COASTER;
    tdPark.textContent = data[j].PARK;    
    tdManu.textContent = data[j].MANUFACTURER;
    tdType.textContent = data[j].TYPE;
    tdStat.textContent = data[j].YEAR;
    newRow.appendChild(tdRank);
    newRow.appendChild(tdCoaster);
    newRow.appendChild(tdPark);
    newRow.appendChild(tdManu);
    newRow.appendChild(tdType);
    newRow.appendChild(tdStat);
    newTable.querySelector('tbody').appendChild(newRow);
    j++;
  }

  const coasterTable = document.getElementById('coasterTableDiv');
  coasterTable.appendChild(newTable);
  newTable.setAttribute("id", "coasterTable");

  document.getElementsByTagName('td')[0].style.width = '3%';
  document.getElementsByTagName('td')[1].style.width = '25%';
  document.getElementsByTagName('td')[2].style.width = '25%';
  document.getElementsByTagName('td')[3].style.width = '25%';
  document.getElementsByTagName('td')[4].style.width = '7%';
  document.getElementsByTagName('td')[4].style.width = '15%';
        
  var coasterCount = data[9].AGGREGATE_STATS;
  var parkCount = data[14].AGGREGATE_STATS;
  var coasterCountEl = document.getElementById("coasterCountElement");
  var parkCountEl = document.getElementById("parkCountElement");
  coasterCountEl.innerHTML = coasterCount;
  parkCountEl.innerHTML = parkCount;
  console.log(coasterCount);
  console.log(parkCount);
  filterTable();
  showElements();
}
      
function filterTable() {
  var input, filter, table, tr, td, te, i, txtValue, txtValue2, select, selectt;
  input = document.getElementById("coasterInput");
  filter = input.value.toUpperCase();
  select = document.getElementById("selectManu");
  selectedOption = select.options[select.selectedIndex].value.toUpperCase();
  selectt = document.getElementById("selectType");
  selecttedOption = selectt.options[selectt.selectedIndex].value.toUpperCase();
  table = document.getElementById("coasterTable");
  tr = table.getElementsByTagName("tr");
  
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1]; // coaster name
    te = tr[i].getElementsByTagName("td")[2]; // park name
    if (td || te) {
      txtValue = td.textContent || td.innerText;
      txtValue2 = te.textContent || te.innerText;
      if ((txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) && 
          (selectedOption === "ALL MANUFACTURERS" || tr[i].getElementsByTagName("td")[3].textContent.toUpperCase().indexOf(selectedOption) > -1) &&
          (selecttedOption === "WOOD & STEEL" || tr[i].getElementsByTagName("td")[4].textContent.toUpperCase().indexOf(selecttedOption) > -1)) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}

// event listener for the input and select elements
document.getElementById("coasterInput").addEventListener("keyup", filterTable);
document.getElementById("selectManu").addEventListener("change", filterTable);
document.getElementById("selectType").addEventListener("change", filterTable);

// show and hide for cosmetics
function hideElements() {
  document.getElementById('selectManu').style.display = 'none';
  document.getElementById('selectType').style.display = 'none';
  document.getElementById('coasterInput').style.display = 'none';
  document.getElementById("selectStat").style.display = "none";
}
    
function showElements() {
  document.getElementById('selectManu').style.display = 'inline-block';
  document.getElementById('selectType').style.display = 'inline-block';
  document.getElementById('coasterInput').style.display = 'inline-block';
  document.getElementById("selectStat").style.display = "inline-block";
  document.getElementById("loader").style.display = "none";
}

function updateURLParams() {
  var selectedManufacturer = document.getElementById("selectManu").value;
  var selectedType = document.getElementById("selectType").value;
  var searchQuery = document.getElementById("coasterInput").value;

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
  var urlParams = new URLSearchParams(window.location.search);
  var selectedManufacturer = urlParams.get("m");
  var selectedType = urlParams.get("t");
  var searchQuery = urlParams.get("s");
      
  if (selectedManufacturer && Array.from(selectManu.options).some(option => option.value === selectedManufacturer)) {
    selectManu.value = selectedManufacturer;
  } else {
    selectManu.value = "";
    urlParams.delete("m");
  }
      
  if (selectedType && Array.from(selectType.options).some(option => option.value === selectedType)) {
    selectType.value = selectedType;
  } else {
    selectType.value = "";
    urlParams.delete("t");
  }
      
  if (searchQuery) {
    coasterInput.value = searchQuery;
  } else {
    urlParams.delete("s");
  }

  var queryString = queryParams.toString();
            
  if (queryString !== "") {
    history.replaceState(null, null, "?" + queryString);
  } else {
    history.replaceState(null, null, window.location.pathname);
  }
      
  filterTable();
}

document.getElementById("coasterInput").addEventListener("keyup", function () {
  filterTable();
  updateURLParams();
});

document.getElementById("selectManu").addEventListener("change", function () {
  filterTable();
  updateURLParams();
});

document.getElementById("selectType").addEventListener("change", function () {
  filterTable();
  updateURLParams();
});

document.getElementById("selectStat").addEventListener("change", function () {
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
      
function updateStatColumn(statKey) {
  var table = document.getElementById("coasterTable");
  var tr = table.getElementsByTagName("tr");

  var statTitles = {
    "YEAR": "Opening Year",
    "INVER": "Inversions",
    "HIGHT": "Height (ft)",
    "SPED": "Speed (mph)",
    "DROP": "Drop (ft)"
  };

  // Update the header with the correct title
  var statHeader = document.getElementById("statHeader");
  statHeader.textContent = statTitles[statKey] || "Opening Year";

  // Use the global tableData instead of undefined data
  for (var i = 1; i < tr.length; i++) {
    var td = tr[i].getElementsByTagName("td")[5];
    td.textContent = window.tableData[i - 1][statKey] || "N/A"; 
  }
}

// applies url search terms when the page loads
window.addEventListener('DOMContentLoaded', function () {
  applyURLParams();
});

// hide the elements when the page loads and replace with the loader
window.onload = function() {
  hideElements();
};
