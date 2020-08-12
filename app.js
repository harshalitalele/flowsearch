function sendXMLReq(query, response) {
	var xhttp = new XMLHttpRequest();	xhttp.onreadystatechange = function() {		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
			document.getElementById('num-results').innerHTML = data.response.numFound;
			response(data.response.docs);
		};
	};
	xhttp.open("GET", "http://192.168.1.55:5000/query?q=" + query + "&rows=" + numRec + "&start=" + pageNo*numRec, true);
	xhttp.send();
}

let pageNo = 0,
	numRec = 10
	query = '*',
	resTable = null,
	labelOptions = {
		'Medical area of focus' : ['Surgery', 'Dermitology', 'Primary Care'],
		'Focus or goal' : ['Diagnosis', 'Management', 'Treatment including procedures', 'Lab tests'],
		'Setting for services' : ['Surgery', 'Urgent care', 'in patient', 'out patient'],
		'Professional level': ['Student', 'Resident', 'Clinician', 'Clinician extender', 'Nurse'],
		'Use case': ['point of care', 'case review', 'study']
	};

function goprev() {
	pageNo -= 1;
	sendXMLReq(query, function(data) {
		resTable.updateData(data);
	});
}

function gonext() {
	pageNo += 1;
	sendXMLReq(query, function(data) {
		resTable.updateData(data);
	});
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
	pageNo = 0;
	query = document.getElementById('search-box').value;
	sendXMLReq(query, function(data) {
		let fields = ['isbn', 'book', 'caption',/* 'text',*/ 'flowchart', 'MedFocus', 'tags'];
		resTable = new ResultsTable(data, fields, 'print-data', labelOptions, updateSolr);
	});
}

function updateSolr(id, updatedLabel) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
		}
	};
	xhttp.open("POST", "http://192.168.1.55:8983/solr/Diabetes/update/json?commitWithin=1000&overwrite=true&wt=json", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	let jsonToUpdate = {
		"id": id
	};
	for(let key in updatedLabel) {
		jsonToUpdate["MedFocus"] = { 'add': updatedLabel[key]}
	}
	xhttp.send(JSON.stringify([jsonToUpdate]));
}

function filterResults(elem) {
	console.log(elem.options);
	let selectedLabel = '';
	for(let op in elem.options) {
		if(elem.options[op].selected) {
			selectedLabel = elem.options[op].innerText;
		}
	}
	var xhttp = new XMLHttpRequest();	
	xhttp.onreadystatechange = function() {		
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
			document.getElementById('num-results').innerHTML = data.response.numFound;
			let fields = ['isbn', 'book', 'caption', /*'text',*/ 'flowchart', 'MedFocus'];
			resTable = new ResultsTable(data.response.docs, fields, 'print-data', labelOptions, updateSolr);
		};
	};
	xhttp.open("GET", "http://192.168.1.55:5000/query?q=*&fq=MedFocus%3A" + selectedLabel + "&rows=" + numRec + "&start=" + pageNo*numRec, true);
	xhttp.send();
}
