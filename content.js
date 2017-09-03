vex.defaultOptions.className = 'vex-theme-wireframe';

chrome.runtime.onMessage.addListener(
    function(request, response, sendResponse) {
        if (request.type == "Message") {
            vex.dialog.buttons.YES.text = 'OK';
            vex.dialog.alert(request.message);
        }
    }
);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "ShowDefinition") {
        vex.dialog.buttons.YES.text = 'SAVE';
        wordSelected = request.word;
        definitionArray = request.def;
        if (definitionArray.length == 0) {
            vex.dialog.buttons.YES.text = 'OK';
            vex.dialog.alert("Sorry, unable to find definition. But, you can add the flashcard manually on https://quizlet.com");
            return;
        }
        definitionToShow = "<ul>";
        for (var i = 0; i < definitionArray.length; i++) {
          definitionToShow += "<li>" + definitionArray[i] + "</li>";
        }
        definitionToShow += "</ul>";
        if (definitionArray[1]) {
            definitionToSave = definitionArray[0] + "; " + definitionArray[1];
        } else {
            definitionToSave = definitionArray[0];
        }
        // Remove html tags from top definition before saving
        definitionToSave.replace(/(<([^>]+)>)/ig, '');
        vex.dialog.confirm({
          unsafeMessage: "<b>" + wordSelected + ":</b>" + "<br>" + definitionToShow,
          callback: function (value) {
              if (value) {
                  chrome.runtime.sendMessage({
                    saveDefinition : "SaveDefinition",
                    word : wordSelected,
                    // Only the top definition is saved
                    definition : definitionToSave
                  });
              } else {
                  console.log('Cancel')
              }
          }
        });
    }
});