function sendXMLReq(query, response) {
var xhttp = new XMLHttpRequest();	xhttp.onreadystatechange = function() {		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
			response(data.response);
		};
	};
	xhttp.open("GET", "http://192.168.1.55:5000/query?q=" + query + "&rows=5", true);
	xhttp.send();
}

let pageNo = 0;

function createTableElem(infoArr, numRec) {
	let tableElem = document.createElement('table');
	let i = 0;
	for(let recordIn in infoArr) {
		let record = infoArr[recordIn];
		let rowElem = document.createElement('tr');
		for(let colIn in record) {
			let col = record[colIn];
			let colElem = document.createElement('td');
			colElem.innerHTML = col;
			rowElem.appendChild(colElem);
		}
		tableElem.appendChild(rowElem);
		i++;
		if(i == numRec) {
			break;
		}
	}
	return tableElem;
}

function getResults() {
	let query = document.getElementById('search-box').value;
	sendXMLReq(query, function(data) {
		document.getElementById('num-results').innerHTML = data.numFound;
		let fields = ['id', 'book', 'text'],
			resTable = new ResultsTable(data.docs, fields, 'print-data');
	});
}