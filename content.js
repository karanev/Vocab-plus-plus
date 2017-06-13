vex.defaultOptions.className = 'vex-theme-wireframe';
vex.dialog.buttons.YES.text = 'SAVE';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.word + ": " + request.def);
    vex.dialog.confirm({
      unsafeMessage: "<b>" + request.word + ":</b>" + "<br>" + request.def,
      callback: function (value) {
          if (value) {
              word = request.word;
              definition = request.def;
              date = new Date();
              time = date.getTime();
              var obj = {};
              obj[word] = [definition, time];
              chrome.storage.sync.set(obj, function() {
              	console.log("Saved");
              });
          } else {
              console.log('Cancel')
          }
      }
	  });
    /*if (request.type == "defintion")
      sendResponse({type: "definition"});*/
});