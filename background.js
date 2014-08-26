var hashes = {};
var availableHashes = null;
var selectedId = null;

function updateHashes(tabId) {
    chrome.tabs.sendRequest(tabId, {}, function(hashList) {
        if (!hashList) {
            chrome.pageAction.hide(tabId);
        } else {
            chrome.pageAction.show(tabId);
            hashes[tabId] = hashList;
            if (selectedId == tabId)
                updateSelected(tabId);
        }
    });
}

function updateSelected(tabId) {
    availableHashes = hashes[tabId];
    if (availableHashes)
        chrome.pageAction.setTitle({tabId:tabId, title:'yolo'});
}

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (change.status == "complete")
        updateHashes(tabId);
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
    selectedId = tabId;
    updateSelected(tabId);
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    updateHashes(tabs[0].id);
});
