function sendXMLReq(query, response) {
var xhttp = new XMLHttpRequest();	xhttp.onreadystatechange = function() {		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
			response(data.response);
		};
	};
	xhttp.open("GET", "http://192.168.1.55:5000/query?q=" + query, true);
	xhttp.send();
}

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
		let records = [];
		for(let res in data.docs) {
			let tempRecord = [];
			tempRecord.push(data.docs[res].id);
			tempRecord.push(data.docs[res].book);
			tempRecord.push(data.docs[res].text);
			records.push(tempRecord);
		}

		$(document).ready(function() {
		    $('#example').DataTable( {
		        data: records,
		        columns: [
		            { title: "id" },
		            { title: "book" },
		            { title: "text" }
		        ]
		    } );
		} );
		/*document.getElementById('num-results').innerHTML = data.numFound;
		let tableElem = createTableElem(data.docs, 10);
		document.getElementById('print-data').innerHTML = "";
		document.getElementById('print-data').appendChild(tableElem);*/
	});
}