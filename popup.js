document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    chrome.storage.sync.get(['nwcSecret', 'threshold', 'checkFrequency'], function(result) {
        document.getElementById('nwc-secret').value = result.nwcSecret || '';
        document.getElementById('threshold').value = result.threshold || '';
        document.getElementById('check-frequency').value = result.checkFrequency || '';
    });

    // Helper function to save a setting
    function saveSetting(key, value, statusElementId) {
        chrome.storage.sync.set({ [key]: value }, function() {
            const statusElement = document.getElementById(statusElementId);
            statusElement.textContent = 'Saved!';
            setTimeout(() => { statusElement.textContent = ''; }, 3000);
        });
    }

    // Save NWC Secret
    document.getElementById('save-nwc-secret').addEventListener('click', function() {
        const nwcSecret = document.getElementById('nwc-secret').value;
        saveSetting('nwcSecret', nwcSecret, 'nwc-secret-status');
    });

    // Save Threshold
    document.getElementById('save-threshold').addEventListener('click', function() {
        const threshold = parseInt(document.getElementById('threshold').value);
        saveSetting('threshold', threshold, 'threshold-status');
    });

    // Save Check Frequency
    document.getElementById('save-check-frequency').addEventListener('click', function() {
        const checkFrequency = parseInt(document.getElementById('check-frequency').value);
        saveSetting('checkFrequency', checkFrequency, 'check-frequency-status');
    });
});
