/*
To Do:
1. By default, take all the fields in first row of data
2. Add proper comments
3. Clean <tr>'s if data[i] is not present
4. Update Sr No properly on previous click
5. Make images field customizable (Remove hardcoding of the field 'flowchart')
6. Update tags in Solr - https://lucene.apache.org/solr/guide/6_6/updating-parts-of-documents.html#:~:text=Solr%20supports%20several%20modifiers%20that,that%20needs%20to%20be%20updated.
*/
class ResultsTable {
	tableId;
	tableFields;
	srNo;
	labelOptions;
	labelCats = ['Medical_area', 'Focus', 'Services', 'Professional_level', 'Use_case'];
	constructor(data, fields, elementId, labelOptions, labelUpdateCallback) {
		// Clear if already in table
		document.getElementById(elementId).innerHTML = '';
		this.tableFields = [];
		this.srNo = 0;
		// display method pass in the element id
		this.labelOptions = labelOptions;
		this.labelUpdateCallback = labelUpdateCallback;
		this.displayTable(fields, elementId, data.length);
		// Define num of records and fields this table will display
		this.updateData(data);
	}

	updateData(data) {
		// just update data to predefined fields and records
		let tableElem = document.getElementById(this.tableId),
			allRows = tableElem.children;
		let i = 0;
		while(i < allRows.length) {
			if(i == 0) {
				i++;
				continue;
			}
			let record = data[i-1] ? data[i-1] : {},
				rowElem = allRows[i],
				allCols = rowElem.children;
			
			for(let colIn in this.tableFields) {
				let key = this.tableFields[colIn];
				if(key == 'flowchart') {
					let imgElem = allCols[colIn].children[0],
						imgSrc = "diabetes-new/" + record['id'] + ".jpeg",
						errorChecked = {jpg: false, png: false};
					imgElem.src = imgSrc;
					imgElem.onerror = function() {
						if(!errorChecked.jpg) {
							errorChecked.jpg = true;
							imgSrc = "diabetes-new/" + record['id'] + ".jpg";
							this.src = imgSrc;
						} else if(!errorChecked.png) {
							errorChecked.png = true;
							imgSrc = "diabetes-new/" + record['id'] + ".png";
							this.src = imgSrc;
						} 
					};
					imgElem.style.cursor = 'pointer';
					imgElem.addEventListener('click', function() {
						window.open(imgSrc);
					});

				} else if(key == 'tags') {
					continue;
				} else if(key == 'Sr no') {
					let col = this.srNo++,
						colElem = allCols[colIn];
					
					colElem.innerHTML = col;
				} else if(key == 'Labels') {
					let col = '',
						colElem = allCols[colIn];
					for(let catIn in this.labelCats) {
						let cat = this.labelCats[catIn];
						if(record[cat] != undefined) 
							col += '<b>' + cat + '</b>: ' + record[cat] + '\n';
					}
					colElem.innerHTML = col;
				} else {
					let col = record[key],
						colElem = allCols[colIn];
					if(col == undefined) {
						col = "";
					}
					colElem.innerHTML = col;
				}
			}
			i++;
		}
	}

	addTagsElem() {
		let tagElem = document.createElement('div');
		for(let selectLabel in this.labelOptions) {
			let spanElem = document.createElement('span'),
				selectElem = document.createElement('select'),
				labelElem = document.createElement('label');
			labelElem.innerHTML = '<b>' + selectLabel + '</b>';
			selectElem.setAttribute('name', selectLabel);
			selectElem.style.width = "200px";
			selectElem.setAttribute('multiple', true);
			let optionsArr = this.labelOptions[selectLabel];
			for(let optionLabel in optionsArr) {
				let optionElem = document.createElement('option');
				optionElem.value = optionsArr[optionLabel];
				optionElem.innerHTML = optionsArr[optionLabel];
				selectElem.appendChild(optionElem);
			}
			let self = this;
			selectElem.addEventListener('change', function(e) {
				let id = e.target.parentElement.parentElement.parentElement.children[1].innerText,
					labelGroupName = e.target.name,
					labelValues = [],
					updateJson = {};
				for(let valIn in e.target.options) {
					let val = e.target.options[valIn];
					if(val.selected) {
						labelValues.push(val.innerText);
					}
				}
				updateJson[labelGroupName] = labelValues[0];
				self.labelUpdateCallback(id, updateJson);
			});
			tagElem.appendChild(labelElem);
			tagElem.appendChild(selectElem);
			tagElem.appendChild(document.createElement("br"));
		}		
		return tagElem;
	}

	displayTable(fields, elemId, numRec) {
		// Create table and headers		
		let tableElem = document.createElement('table'),
			rowElem = document.createElement('tr'),
			headerElem = document.createElement('th');
		tableElem.border = '1';
		this.tableId = elemId + '-table';
		tableElem.setAttribute('id', this.tableId);
		
		// First serial number column
		headerElem.innerHTML = 'Sr no';
		rowElem.appendChild(headerElem);
		this.tableFields.push('Sr no');
		// Other columns
		for(let titleIn in fields) {
			let title = fields[titleIn];
			if(title == 'id') {
				this.tableFields.push(title);
				continue;
			}
			headerElem = document.createElement('th');
			headerElem.innerHTML = title;
			rowElem.appendChild(headerElem);
			this.tableFields.push(title);
		}
		tableElem.appendChild(rowElem);
		for(let i = 0; i < numRec; i++) {
			rowElem = document.createElement('tr');
			for(let j in this.tableFields) {
				let colElem = document.createElement('td');
				if(this.tableFields[j] == 'flowchart') {
					let imgElem = document.createElement('img');
					imgElem.height = "450";
					imgElem.width = "450";
					colElem.appendChild(imgElem);
				} else if(this.tableFields[j] == 'tags') {
					let tagElem = this.addTagsElem();
					colElem.appendChild(tagElem);
				} else if(this.tableFields[j] == 'id') {
					colElem.style.display = 'none';
				}
				if(this.tableFields[j] == 'captions') {
					colElem.style.width = '300px';
				}
				rowElem.appendChild(colElem);
			}
			tableElem.appendChild(rowElem);
		}
		// append table to the parent element
		document.getElementById(elemId).appendChild(tableElem);
	}
}