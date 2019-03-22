(function(DOMParser) {  
    "use strict";  
    var DOMParser_proto = DOMParser.prototype  
      , real_parseFromString = DOMParser_proto.parseFromString;

    // Firefox/Opera/IE throw errors on unsupported types  
    try {  
        // WebKit returns null on unsupported types  
        if ((new DOMParser).parseFromString("", "text/html")) {  
            // text/html parsing is natively supported  
            return;  
        }  
    } catch (ex) {}  

    DOMParser_proto.parseFromString = function(markup, type) {  
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {  
            var doc = document.implementation.createHTMLDocument("")
              , doc_elt = doc.documentElement
              , first_elt;

            doc_elt.innerHTML = markup;
            first_elt = doc_elt.firstElementChild;

            if (doc_elt.childElementCount === 1
                && first_elt.localName.toLowerCase() === "html") {  
                doc.replaceChild(first_elt, doc_elt);  
            }  

            return doc;  
        } else {  
            return real_parseFromString.apply(this, arguments);  
        }  
    };  
}(DOMParser));

function getHanVietSync(character) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://hvdic.thivien.net/whv/" + character, false); // true for asynchronous 
    xmlHttp.send(null);

    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    	var hanviet = "";
    	var xpath = "//div[@class='info']//div//span[@class='hvres-goto-link']/text()";
    	var responseDOM = new DOMParser().parseFromString(xmlHttp.responseText, 'text/html');
    	var nodes = responseDOM.evaluate(xpath, responseDOM, null, XPathResult.ANY_TYPE, null);

    	var results = nodes. iterateNext();
    	while (results) {
    		hanviet += results.nodeValue + " ";
    		results = nodes.iterateNext();
    	}

    	hanviet += "| ";

    	return hanviet;
    }
}


function annotateHanViet(){
	console.log("in visible");
   	var characters = [];
	var annotationXpath = "//div[@id='mandarinspot-tip-hz']/x-mspot/text()";
	var nodes = document.evaluate(annotationXpath, document, null, XPathResult.ANY_TYPE, null);
	var results = nodes.iterateNext();
	console.log("result:");
	console.log(results);

	if (results) {
		var text = results.nodeValue;
		for (var i = 0; i < text.length; i++) {
			characters.push(text.charAt(i));
		}
	}

	var hanviet = "";
	for (var i = 0; i < characters.length && characters[i] != "[" && characters[i] != " "; i++) {
		console.log("char:");
		console.log(characters[i]);
		hanviet += getHanVietSync(characters[i]);
		console.log("hanviet:");
		console.log(hanviet);
	}

	var annotation = document.getElementById("mandarinspot-tip");
	var hanvietDiv = document.createElement("div");
	hanvietDiv.innerHTML = hanviet;
	console.log(hanvietDiv);
	annotation.appendChild(hanvietDiv);
}


mandarinspot.annotate();

var mandarinspotNode = document.getElementById("mandarinspot-tip");
var currentVisibility = 'hidden';

var observer = new MutationObserver(function() {
	if (mandarinspotNode.style.visibility == 'visible' && currentVisibility == 'hidden') {
		currentVisibility = 'visible';
		annotateHanViet();
	}

	if (mandarinspotNode.style.visiblity != 'visible') {
		currentVisibility = 'hidden';
	}
});
observer.observe(mandarinspotNode, { attributes: true, childList: false });
