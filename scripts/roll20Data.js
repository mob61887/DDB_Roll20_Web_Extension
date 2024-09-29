importScripts('./utils.js');

(function() {
    // Request the character data from the background script
    chrome.runtime.sendMessage({ type: 'getData' }, (response) => {
        const characterData = response.data;
        if (characterData) {
            console.log('Character data received from background script:', characterData);
            
            // Populate Roll20 character sheet (modify the selectors as necessary)
            document.querySelector('#character-name').value = characterData.name;
            document.querySelector('#character-class').value = characterData.class;
            document.querySelector('#character-level').value = characterData.level;
            
            // Populate stats (modify according to the actual Roll20 input fields)
            for (const [statName, statValue] of Object.entries(characterData.stats)) {
                const statInput = document.querySelector(`#stat-${statName}`); // Adjust selector
                if (statInput) {
                    statInput.value = statValue;
                }
            }
        } else {
            console.log('No character data available.');
        }
    });
})();
