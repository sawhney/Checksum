if (window == top) {
    chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
        var hashLinks = findHashLinks();
        getHashFromLinks(hashLinks, [], sendResponse);
    });
}

function findHashLinks() {
    var node = document.body;
    var done = false;
    var links = [].slice.apply(document.getElementsByTagName('a'));
    var hashLinks = [];
    for (var i = 0; i < links.length; i++) {
        var linkText = links[i].textContent;
        linkText.toLowerCase();
        if (linkText.indexOf('md5') > -1)
            hashLinks.push(links[i]);
    }
    return hashLinks;
}

function Hash(hashText, associatedLinks, a) {
    this.hashText = hashText;
    this.associatedLinks = associatedLinks;
    this.a = a;
}

function getHashFromLinks(hashLinks, fetchedHashes, sendResponse) {
    if (hashLinks.length > 0) {
        var xhr = new XMLHttpRequest();
        var link = hashLinks.pop();
        xhr.open("GET", link.href, true);
        xhr.onreadystatechange = makeResponseCallback(xhr, link, hashLinks, fetchedHashes, sendResponse);
        xhr.send();
    } else if (fetchedHashes.length > 0) {
        return sendResponse(fetchedHashes);
    } else {
        return sendResponse(null);
    }
}

function makeResponseCallback(xhr, link, hashLinks, fetchedHashes, sendResponse) {
    var re = new RegExp('[a-z0-9]{32}', 'i');
    return function() {
        if (xhr.readyState == 4) {
            var matchedText = re.exec(xhr.responseText)[0];
            if (matchedText) {
                var associatedLinks = getAssociatedLinks(link);
                console.log(associatedLinks);
                var newHash = new Hash(matchedText, associatedLinks, link);
                //TODO: fixcircular dependency in 'a'
                fetchedHashes.push(newHash);
            }
            getHashFromLinks(hashLinks, fetchedHashes, sendResponse);
        }
    };
}

function getAssociatedLinks(hashLink) {
    var parent = hashLink.parentElement;
    var associatedLinks = [];
    if (parent) {
        var childLinks = [].slice.apply(parent.getElementsByTagName('a'));
        if (childLinks) {
            for (var i=0; i < childLinks.length; i++) {
                if (childLinks[i].href !== hashLink.href)
                    associatedLinks.push(childLinks[i]);
            }
            if (associatedLinks.length > 0)
                return associatedLinks;
        }
    }
    return null;
}


