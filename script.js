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

// Utility function for getting GET params
function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.authorise == "Authorise" )
        {
            chrome.identity.launchWebAuthFlow(
                {'url': 'https://quizlet.com/authorize?client_id=xabUE2TbhW&response_type=code&scope=read%20write_set&state=AreYouSerious',
                'interactive': true},
                function(redirect_url) {
                    error = findGetParameter("error", redirect_url);
                    if (error == null) {
                        console.log("User allowed");
                        state = findGetParameter("state", redirect_url);
                        if (state != "AreYouSerious") {
                            console.log("Possible CSRF attack, state recieved is different");
                        } else {
                            code = findGetParameter("code", redirect_url);
                            $.ajax({
                                method: "POST",
                                url: "https://api.quizlet.com/oauth/token",
                                data: {
                                    "grant_type":    "authorization_code",
                                    "code":          code,
                                    "redirect_uri":  "https://haddmjhkgepkcficbheckaomffmkcjfg.chromiumapp.org/quizlet",
                                },
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader ("Authorization", "Basic eGFiVUUyVGJoVzphYThVWGtlWGZrRXFERTl3dmU0c2dQ");
                                },
                                success: function(response) {
                                    if (!response.error) {
                                        access_token = response.access_token;
                                        user_id = response.user_id;
                                        chrome.storage.local.set({"authenticated" : true});
                                        chrome.storage.local.set({"access_token" : access_token});
                                        chrome.storage.local.set({"user_id" : user_id});
                                        chrome.runtime.sendMessage({updateAuthUI : "updateAuthUI"});
                                    } else {
                                        console.log(response.error_description)
                                    }
                                },
                            });
                        }
                    } else {
                        console.log(error);
                    }
                }
            ); 
        }
    }
);