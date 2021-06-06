// Saves options to chrome.storage
function save_options() {
  var useLocalhost = document.getElementById('use-localhost').checked;
  chrome.storage.sync.set({
    useLocalhost: useLocalhost,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    useLocalhost: false,
  }, function(items) {
    console.log(items);
    document.getElementById('use-localhost').checked = items.useLocalhost;
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  restore_options();
  document.getElementById('save').addEventListener('click',
      save_options);
});
