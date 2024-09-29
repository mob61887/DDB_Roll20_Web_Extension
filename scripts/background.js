const browserAPI = self.browser || self.chrome;

browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^https:\/\/www\.dndbeyond\.com\/characters\/\d+$/.test(tab.url)) {
        let msg = {
            action: 'scrapeDNDBeyond',
            type: 'begin'
        };

        browserAPI.tabs.sendMessage(tabId, msg, (response) => {
            if (browserAPI.runtime.lastError) {
                console.error('Error sending message to content script:', browserAPI.runtime.lastError.message);
            } else {
                console.log('Response from content script:', response);
            }
        });
    }
});

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Service Worker received a message:', message);

    // Check the message type or action
    if (message.action === 'notification' && message.type === 'ddb_ContentLoaded') {
        console.log('Scraping request received from tab:', sender.tab.id);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const tabId = tabs[0].id;

                const tabMessage = { action: 'scrapeDNDBeyond', type: 'begin' };

                // Send the message to the content script running in the active tab
                chrome.tabs.sendMessage(tabId, tabMessage, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message to tab:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Response from content script:', response);
                        sendResponse({ status: 'Message sent to tab', response });
                    }
                });
            } else {
                console.error('No active tab found');
                sendResponse({ status: 'No active tab found' });
            }
        });
    }

    // Return true to indicate asynchronous response (if necessary)
    return true; // Keeps the message channel open for async response if needed
});

const msg = { 
    action: 'notification',
    type: 'ddb_ContentLoaded'
}
