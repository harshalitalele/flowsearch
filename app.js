function sendXMLReq(query, response) {
	var xhttp = new XMLHttpRequest();	xhttp.onreadystatechange = function() {		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
			document.getElementById('num-results').innerHTML = data.response.numFound;
			response(data.response.docs);
		};
	};
	lastQueryUrl = "http://192.168.1.55:5000/query?q=" + query + "&rows=" + numRec + "&start=" + pageNo*numRec;
	xhttp.open("GET", lastQueryUrl, true);
	xhttp.send();
}

let pageNo = 0,
	numRec = 10
	query = '*',
	resTable = null,
	labelOptions = {
		'Medical_area' : ['Surgery', 'Dermatology', 'Primary Care'],
		'Focus' : ['Diagnosis', 'Management', 'Treatment including procedures', 'Lab tests'],
		'Services' : ['Surgery', 'Urgent care', 'In_patient', 'Out_patient'],
		'Professional_level': ['Student', 'Resident', 'Clinician', 'Clinician extender', 'Nurse'],
		'Use_case': ['Point_of_care', 'Case review', 'Study']
	}, advFilters = true,
	lastQueryUrl = '';
addFilters();
showHideFilters();

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

function addFilters() {
	let filterElem = document.getElementById('adv-filters');
	for(let opt in labelOptions) {
		let divElem = document.createElement('div'),
			catElem = document.createElement('div');
		catElem.style.fontSize = '18px';
		catElem.style.fontWeight = 'bold';
		catElem.innerHTML = opt;
		divElem.appendChild(catElem);
		for(let labelIn in labelOptions[opt]) {
			let checkElem = document.createElement('input'),
				labelElem = document.createElement('label');
			labelElem.style.margin = "3px";
			labelElem.style.padding = "3px";
			labelElem.style.backgroundColor = "lightgrey";
			labelElem.innerHTML = labelOptions[opt][labelIn];
			checkElem.setAttribute('type', 'checkbox');
			checkElem.setAttribute('name', opt);
			checkElem.setAttribute('value', labelOptions[opt][labelIn]);
			labelElem.appendChild(checkElem);
			divElem.appendChild(labelElem);
		}

		filterElem.appendChild(divElem);
	}
}

function showHideFilters(isShow) {
	advFilters = isShow ? isShow : !advFilters;
	if(advFilters) {
		document.getElementById('adv-filters').style.display = "block";
	} else {
		document.getElementById('adv-filters').style.display = "none";
	}
}

function getResults() {
	pageNo = 0;
	query = document.getElementById('search-box').value;
	sendXMLReq(query, function(data) {
		let fields = ['id', 'isbn', 'book', 'caption',/* 'text',*/ 'flowchart', 'Labels', 'tags'];
		resTable = new ResultsTable(data, fields, 'print-data', labelOptions, updateSolr);
	});
	showHideFilters(false);
}

function updateSolr(id, updatedLabel) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim()),
				msgElem = document.getElementById('msg');
			msgElem.innerHTML = "Labels updated";
			setTimeout(function() {
				msgElem.innerHTML = "";
			}, 2000);
		}
	};
	xhttp.open("POST", "http://192.168.1.55:8983/solr/Diabetes/update/json?commitWithin=1000&overwrite=true&wt=json", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	let jsonToUpdate = {
		"id": id
	};
	for(let key in updatedLabel) {
		jsonToUpdate[key] = { 'add': updatedLabel[key]}
	}
	xhttp.send(JSON.stringify([jsonToUpdate]));
	showHideFilters(false);
}

function filterResults(elem) {
	let query = '';
	for(let labelCat in labelOptions) {
		$("input:checkbox[name=" + labelCat + "]:checked").each(function(){
		    if(query != '') {
		    	query += ' OR ';
		    }
		    query += labelCat + ':' + $(this).val();
		});
	}

	var xhttp = new XMLHttpRequest();	
	xhttp.onreadystatechange = function() {		
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
			document.getElementById('num-results').innerHTML = data.response.numFound;
			let fields = ['id', 'isbn', 'book', 'caption', /*'text',*/ 'flowchart', 'Labels'];
			resTable = new ResultsTable(data.response.docs, fields, 'print-data', labelOptions, updateSolr);
		};
	};
	lastQueryUrl = "http://192.168.1.55:8983/solr/Diabetes/select?q=" + query + "&rows=" + numRec + "&start=" + pageNo*numRec;
	xhttp.open("GET", lastQueryUrl, true);
	xhttp.send();
	showHideFilters(false);
}

function downloadResults() {
	let rows = [];
	var xhttp = new XMLHttpRequest();	xhttp.onreadystatechange = function() {		
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			let data = JSON.parse(xhttp.responseText.trim());
			//data.response.docs
			//filename and labels array
			for(let docIn in data.response.docs) {
				let labels = '',
					doc = data.response.docs[docIn];
				for(let cat in labelOptions) {
					if(doc[cat] != undefined) {
						labels += doc[cat] + ",";
					}
				}
				rows.push([doc.id, labels]);
			}
			let csvContent = "data:text/tsv;charset=utf-8," 
			    + rows.map(e => e.join("\t")).join("\n");

			var encodedUri = encodeURI(csvContent);
			var link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", "test.tsv");
			document.body.appendChild(link);

			link.click();
		};
	};
	xhttp.open("GET", lastQueryUrl, true);
	xhttp.send();
}
