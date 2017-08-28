document.addEventListener('DOMContentLoaded', function () {

    function updateAuthUI() {
        $(".loggedIn").css("display", "block");
        $(".loggedOut").css("display", "none");
    }
    
    function updateDeAuthUI() {
        $(".loggedIn").css("display", "none");
        $(".loggedOut").css("display", "block");
    }

    chrome.storage.local.get("authenticated", function(obj) {
        console.log(obj);
    
        if (obj.authenticated) {
            updateAuthUI();
        }
    });
    
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.updateAuthUI == "updateAuthUI") {
                updateAuthUI();
            }
        }
    );
    
    // Event listeners for extension's main UI
    $("#login").on("click", function() {
        chrome.runtime.sendMessage({authorise: "Authorise"});
    });
    
    $("#showSavedWords").on("click", function() {
        chrome.tabs.create({url: "https://quizlet.com"});
    });
    
    $("#logout").on("click", function() {
        chrome.storage.local.set({"authenticated" : false});
        chrome.storage.local.set({"access_token" : ""});
        chrome.storage.local.set({"user_id" : ""});
        chrome.storage.local.set({"set_id" : -1});
        updateDeAuthUI();
    });
});