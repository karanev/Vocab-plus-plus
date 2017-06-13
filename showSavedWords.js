document.getElementById("aTagToday").addEventListener("click", function() {
	showTable("definitionsTableToday");
	setActive("aTagToday");
});
document.getElementById("aTagYesterday").addEventListener("click", function() {
	showTable("definitionsTableYesterday");
	setActive("aTagYesterday");
});
document.getElementById("aTagLastWeek").addEventListener("click", function() {
	showTable("definitionsTableLastWeek");
	setActive("aTagLastWeek");
});
document.getElementById("aTagLastMonth").addEventListener("click", function() {
	showTable("definitionsTableLastMonth");
	setActive("aTagLastMonth");
});
document.getElementById("aTagAll").addEventListener("click", function() {
	showTable("definitionsTableAll");
	setActive("aTagAll");
});

function createRow(wordToSet, definitionToSet) {
    var row = document.createElement('tr');
    var wordCol = document.createElement('td');
    var definitionCol = document.createElement('td');
    wordCol.innerHTML = wordToSet;
	definitionCol.innerHTML = definitionToSet;
    row.appendChild(wordCol);
    row.appendChild(definitionCol);
    return row;
}

chrome.storage.sync.get(null, 
	function(result)
	{
		var word;
		var now = new Date();
		now.setHours(0, 0, 0);
		for (word in result) {
			[definition, time] = result[word];
			var savedDate = new Date(time);
			savedDate.setHours(0, 0, 0);
			var oneDay = 24*60*60*1000;
			var diffDays = Math.round((now.getTime() - savedDate.getTime())/(oneDay));
			document.getElementById("definitionsTableAll").appendChild(createRow(word, definition));
			if (diffDays <= 31 && diffDays >= 1) {
				document.getElementById("definitionsTableLastMonth").appendChild(createRow(word, definition));
			}
			if (diffDays <= 7 && diffDays >= 1) {
				document.getElementById("definitionsTableLastWeek").appendChild(createRow(word, definition));
			}
			if (diffDays == 1) {
				document.getElementById("definitionsTableYesterday").appendChild(createRow(word, definition));
			}
			if (diffDays == 0) {
				document.getElementById("definitionsTableToday").appendChild(createRow(word, definition));
			}
		}
	}
);

function showTable(id){
  document.getElementById('definitionsTableAll').style.display='none';
  document.getElementById('definitionsTableLastMonth').style.display='none';
  document.getElementById('definitionsTableLastWeek').style.display='none';
  document.getElementById('definitionsTableYesterday').style.display='none';
  document.getElementById('definitionsTableToday').style.display='none';
  document.getElementById(id).style.display='table';
}

function setActive(id) {
	document.getElementById('aTagToday').classList.remove("active");
	document.getElementById('aTagYesterday').classList.remove("active");
	document.getElementById('aTagLastWeek').classList.remove("active");
	document.getElementById('aTagLastMonth').classList.remove("active");
	document.getElementById('aTagAll').classList.remove("active");
	document.getElementById(id).classList.add("active");
}