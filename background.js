function parseHanVietResponse(responseText) {
    var re = /Char:\d+:(.*?)=(.*?)\|/;
    var matches = responseText.match(re);
    var hanviet = matches[2];
    return hanviet;
}

var hanVietCache = {};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.character != undefined) {
            if (hanVietCache[request.character]) {
                sendResponse(hanVietCache[request.character]);
                return false;
            }

            var url = "http://www.vanlangsj.org/hanviet/ajax.php?methode=normal&query=" + request.character;
            fetch(url)
                .then(response => response.text())
                .then(text => parseHanVietResponse(text))
                .then(hanviet => {
                    hanVietCache[request.character] = hanviet;
                    sendResponse(hanviet);
                })
                .catch(error => console.log(error));
            return true;
        }
    }
)

// Send frequency report
const REPORT_INTERVAL = 60 * 1000; // 1 minute
setInterval(function() {
    var url = "http://localhost:80/hvreport";
    fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hanVietCache)
        })
        .catch(error => console.log(error));
}, REPORT_INTERVAL);
