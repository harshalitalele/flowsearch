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
	constructor(data, fields, elementId, labelOptions) {
		// Clear if already in table
		document.getElementById(elementId).innerHTML = '';
		this.tableFields = [];
		this.srNo = 0;
		// display method pass in the element id
		this.labelOptions = labelOptions;
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
					let imgElem = allCols[colIn].children[0];
					imgElem.src = "diabetes-new/" + record['id'] + '.jpeg';
				} else if(key == 'tags') {
					//
				} else {
					let col = key in record ? record[key] : this.srNo++,
					colElem = allCols[colIn];
					
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
				selectElem = document.createElement('select');
			selectElem.style.width = "200px";
			selectElem.setAttribute('multiple', true);
			spanElem.innerHTML = selectLabel;
			let optionsArr = this.labelOptions[selectLabel];
			for(let optionLabel in optionsArr) {
				let optionElem = document.createElement('option');
				optionElem.value = optionsArr[optionLabel];
				optionElem.innerHTML = optionsArr[optionLabel];
				selectElem.appendChild(optionElem);
			}
			tagElem.appendChild(selectElem);
		}		
		return tagElem;
	}

	displayTable(fields, elemId, numRec) {
		// Create table and headers		
		let tableElem = document.createElement('table'),
			rowElem = document.createElement('tr'),
			headerElem = document.createElement('th');
		this.tableId = elemId + '-table';
		tableElem.setAttribute('id', this.tableId);
		
		// First serial number column
		headerElem.innerHTML = 'Sr no';
		rowElem.appendChild(headerElem);
		this.tableFields.push('Sr no');
		// Other columns
		for(let titleIn in fields) {
			let title = fields[titleIn];
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
					imgElem.height = "250";
					imgElem.width = "250";
					colElem.appendChild(imgElem);
				} else if(this.tableFields[j] == 'tags') {
					let tagElem = this.addTagsElem();
					colElem.appendChild(tagElem);
				}
				rowElem.appendChild(colElem);
			}
			tableElem.appendChild(rowElem);
		}
		// append table to the parent element
		document.getElementById(elemId).appendChild(tableElem);
	}
}