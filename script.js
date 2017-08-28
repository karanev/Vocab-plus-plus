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
  getDefinitions (info.selectionText, function (definitionArray) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type:"definition", word:info.selectionText, def:definitionArray}/*, function(response) {
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

function createSet(access_token) {
    $.ajax({
        method: "POST",
        // Fix it later for make async call as async is deprecated
        async: false,
        url: "https://api.quizlet.com/2.0/sets",
        data: {
            "title" : "Vocab++",
            "terms[]" : ["Vocab++", "Quizlet"],
            "definitions[]" : ["Chrome extension", "Excellent flashcard website"],
            "lang_terms" : "en",
            "lang_definitions" : "en"
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + access_token);
        },
        success: function(response) {
            console.log(response.id);
            return response.id;
        },
    });
}

function setSetId(user_id, access_token) {
    // Check if set already already exists
    user = {};
    user.setId = -1;
    $.ajax({
        method: "GET",
        url: "https://api.quizlet.com/2.0/users/" + user_id + "/sets",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: function(arrayOfFlashcards) {
            arrayOfFlashcards.forEach(function (flashcard) {
                if (flashcard["title"] == "Vocab++") {
                    user.setId = flashcard["id"];
                }
            });
            if (user.setId == -1) {
                user.setId = createSet(access_token);
            }
            console.log(user.setId);
            chrome.storage.local.set({"set_id" : user.setId});
        },
    });
}

function saveDefinition(word, definition, set_id, access_token) {
    console.log(set_id);
    console.log(access_token);
    $.ajax({
        method: "POST",
        url: "https://api.quizlet.com/2.0/sets/" + set_id + "/terms",
        data: {
            "term" : word,
            "definition" : definition
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: function(response) {
            console.log(response);
        },
    });
}

function addToQuizlet(word, definition) {
    chrome.storage.local.get("authenticated", function(obj) {
        if (!obj.authenticated) {
            // authenticate then save
        } else {
            // save the word and definition
            user = {};
            chrome.storage.local.get("user_id", function(idObj) {
                user.user_id = idObj.user_id;
                chrome.storage.local.get("access_token", function(tokenObj) {
                    user.access_token = tokenObj.access_token;
                    chrome.storage.local.get("set_id", function(setIdObj) {
                        user.set_id = setIdObj.set_id;
                        saveDefinition(word, definition, user.set_id, user.access_token);
                    });
                });
            });
        }
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.saveDefinition == "SaveDefinition") {
            addToQuizlet(request.word, request.definition);
        }
    }
);

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
                                        setSetId(user_id, access_token);
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