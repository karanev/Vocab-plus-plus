var baseUrl = "https://owlbot.info/api/v1/dictionary/";

function getDefinitions (theWord, callback) {
  var url = baseUrl + theWord.toLowerCase();
  var jxhr = $.ajax ({
    url: url,
    dataType: "text" ,
    timeout: 5000,
    success: function (data, status) { 
      var array = JSON.parse (data);
      console.log(data);
      definitionArray = [];
      for (var i = 0; i < array.length; i++) {
        definitionArray.push(array[i].defenition);
      }
      callback (definitionArray);
    },
    error: function (status) {
      console.log ("getDefinitions: url == " + url + ", error == " + JSON.stringify (status, undefined, 4));
    }
  });
}

function defineWord(info, tab) {
  console.log("Word " + info.selectionText + " was selected.");
  definition = "<ul>";
  getDefinitions (info.selectionText, function (definitions) {
    for (var i = 0; i < definitions.length; i++) {
      definition += "<li>" + definitions[i] + "</li>";
    }
    definition += "</ul>";
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type:"definition", word:info.selectionText, def:definition}/*, function(response) {
        if(response.type == "definition"){
          console.log('definiton received');
        }
      }*/);
    });
  });
}

chrome.contextMenus.create({
  title: "Define: %s", 
  contexts:["selection"], 
  onclick: defineWord,
});