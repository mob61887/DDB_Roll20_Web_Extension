importScripts('./utils.js');

// Function to dynamically create and inject a button into the popup
function injectButton(buttonLabel, action) {
    if (action === null) return;
    // Create a new button element
    const button = document.createElement('button');
    
    // Set the button's text content based on the passed argument
    button.textContent = buttonLabel;
    
    // Set some basic styles for the button (optional)
    button.style.padding = '10px';
    button.style.marginTop = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    // Define what happens when the button is clicked (based on the passed argument)
    button.addEventListener('click', function() {
        action();  // Call the function passed as the argument
    });

    // Inject the button into the popup's DOM (append it to the body or a specific container)
    document.body.appendChild(button);
};

// Listen for messages from the background or content script
browserAPI.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === 'createButton') {
        injectButton(
            message.type === 'ddb_importChar?' ? 'Import Character' 
                : null
            , () => {
                browserAPI.runtime.sendMessage(
                    {
                        action: 'saveCharacter',
                        type: 'dndb_v1'
                    })
            }
        )
    }
});