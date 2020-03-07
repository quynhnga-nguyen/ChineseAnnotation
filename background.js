function parseHanVietResponse(responseText) {
    var hanviet = "";
    var xpath = "//div[@class='info']//div//span[@class='hvres-goto-link']/text()";
    var responseDOM = new DOMParser().parseFromString(responseText, 'text/html');
    var nodes = responseDOM.evaluate(xpath, responseDOM, null, XPathResult.ANY_TYPE, null);

    var results = nodes. iterateNext();
    while (results) {
        hanviet += results.nodeValue + " ";
        results = nodes.iterateNext();
    }
    return hanviet;
}

function parseHanVietResponse2(responseText) {
    var re = /Char:\d+:(.*?)=(.*?)\|/;
    var matches = responseText.match(re);
    var hanviet = matches[2];
    return hanviet;
}

hanVietCache = {};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.character != undefined) {
            if (hanVietCache[request.character]) {
                console.log('Getting character from cache: ' + request.character);
                sendResponse(hanVietCache[request.character]);
                return false;
            }

            // var url = "https://hvdic.thivien.net/whv/" + request.character;
            var url = "http://www.vanlangsj.org/hanviet/ajax.php?methode=normal&query=" + request.character;
            fetch(url)
                .then(response => response.text())
                .then(text => parseHanVietResponse2(text))
                .then(hanviet => {
                    hanVietCache[request.character] = hanviet;
                    sendResponse(hanviet);
                })
                .catch(error => console.log(error));
            return true;
        }
    }
)