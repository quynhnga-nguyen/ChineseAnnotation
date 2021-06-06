// Saves options to chrome.storage
function saveOptions() {
  var useLocalhost = document.getElementById("useLocalhost").checked;
  chrome.storage.sync.set({
    useLocalhost: useLocalhost,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get({
    useLocalhost: false,
  }, function(items) {
    console.log(items);
    document.getElementById("useLocalhost").checked = items.useLocalhost;
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  restoreOptions();
  document.getElementById("save").addEventListener("click",
      saveOptions);
});
