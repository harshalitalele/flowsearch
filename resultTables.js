/*
To Do:
1. By default, take all the fields in first row of data
*/
class ResultsTable {
	tableId;
	tableFields;
	constructor(data, fields, elementId) {
		// Clear if already in table
		document.getElementById(elementId).innerHTML = '';
		this.tableFields = [];
		// display method pass in the element id
		this.displayTable(fields, elementId);
		// Define num of records and fields this table will display
		this.updateData(data);
	}

	updateData(data) {
		// just update data to predefined fields and records
		let tableElem = document.getElementById(this.tableId);
		let i = 0;
		for(let recordIn in data) {
			let record = data[recordIn];
			let rowElem = document.createElement('tr');
			let colElem = document.createElement('td');
			colElem.innerHTML = i;
			rowElem.appendChild(colElem);
			for(let colIn in this.tableFields) {
				let key = this.tableFields[colIn],
					col = record[key],
					colElem = document.createElement('td');
				colElem.innerHTML = col;
				rowElem.appendChild(colElem);
			}
			tableElem.appendChild(rowElem);
			i++;
		}
	}

	displayTable(fields, elemId) {
		// Create table and headers		
		let tableElem = document.createElement('table');
		this.tableId = elemId + '-table';
		tableElem.setAttribute('id', this.tableId);
		let headerElem = document.createElement('th');
		headerElem.innerHTML = 'Sr no';
		tableElem.appendChild(headerElem);
		for(let titleIn in fields) {
			let title = fields[titleIn];
			headerElem = document.createElement('th');
			headerElem.innerHTML = title;
			tableElem.appendChild(headerElem);
			this.tableFields.push(title);
		}
		// append table to the parent element
		document.getElementById(elemId).appendChild(tableElem);
	}
}