vex.defaultOptions.className = 'vex-theme-wireframe';
vex.dialog.buttons.YES.text = 'SAVE';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    wordSelected = request.word;
    definitionArray = request.def;
    definitionToShow = "<ul>";
    for (var i = 0; i < definitionArray.length; i++) {
      definitionToShow += "<li>" + definitionArray[i] + "</li>";
    }
    definitionToShow += "</ul>";
    // Remove html tags from top definition before saving
    definitionArray[0].replace(/(<([^>]+)>)/ig, '');
    vex.dialog.confirm({
      unsafeMessage: "<b>" + wordSelected + ":</b>" + "<br>" + definitionToShow,
      callback: function (value) {
          if (value) {
              chrome.runtime.sendMessage({
                saveDefinition : "SaveDefinition",
                word : wordSelected,
                // Only the top definition is saved
                definition : definitionArray[0]
              });
          } else {
              console.log('Cancel')
          }
      }
	});
    /*if (request.type == "defintion")
      sendResponse({type: "definition"});*/
});