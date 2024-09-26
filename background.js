import { nwc } from "https://esm.sh/@getalby/sdk@3.7.0";

let lastKnownBalance = null;
let client;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed. Initializing NWC.");
  initNWC();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.nwcSecret || changes.checkFrequency)) {
    console.log("NWC secret or check frequency changed. Reinitializing NWC.");
    initNWC();
  }
});

async function initNWC() {
  chrome.storage.sync.get(['nwcSecret', 'checkFrequency'], async function(result) {
    if (result.nwcSecret) {
      client = new nwc.NWCClient({nostrWalletConnectUrl: result.nwcSecret});
      try {
        lastKnownBalance = await getBalance();
        console.log("NWC initialized successfully. Initial balance:", lastKnownBalance);
        
        // Set up the alarm with the saved check frequency
        const checkFrequency = result.checkFrequency || 6; // Default to 6 seconds if not set
        console.log(`Setting up alarm to check balance every ${checkFrequency} seconds`);
        chrome.alarms.create('checkBalance', { periodInMinutes: checkFrequency / 60 });
      } catch (error) {
        console.error("Error initializing NWC:", error);
      }
    } else {
      console.log("NWC secret not set. Please set it in the extension popup.");
    }
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkBalance') {
    console.log("Alarm triggered, checking balance");
    checkBalanceChange();
  }
});

async function getBalance(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const balance = await client.getBalance();
      console.log("Retrieved balance:", balance.balance / 1000);
      return balance.balance / 1000; // Convert millisatoshis to satoshis
    } catch (error) {
      console.error(`Error getting balance (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
}

async function checkBalanceChange() {
  console.log("Checking balance change...");
  try {
    const currentBalance = await getBalance();
    console.log("Current balance:", currentBalance, "Last known balance:", lastKnownBalance);
    if (lastKnownBalance !== null && currentBalance > lastKnownBalance) {
      const difference = currentBalance - lastKnownBalance;
      chrome.storage.sync.get(['threshold'], function(result) {
        const threshold = result.threshold || 0; // Default to 0 if not set
        if (difference >= threshold) {
          console.log("Balance increased above threshold. Triggering confetti for amount:", difference);
          triggerConfetti(difference);
        }
      });
    }
    lastKnownBalance = currentBalance;
  } catch (error) {
    console.error("Error checking balance change:", error);
  }
}

function triggerConfetti(amount) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      console.log("Attempting to send confetti trigger to tab:", tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, {action: "triggerConfetti", amount: amount}, function(response) {
        if (chrome.runtime.lastError) {
          console.error("Error sending message to tab:", chrome.runtime.lastError.message);
        } else if (response && response.success) {
          console.log("Confetti trigger sent successfully and acknowledged by content script");
        } else {
          console.log("Confetti trigger sent, but no success confirmation received");
        }
      });
    } else {
      console.log("No active tab found to trigger confetti");
    }
  });
}

// Simulate receive transaction
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "simulateReceive") {
    console.log("Simulating receive transaction in background script");
    const simulatedAmount = 1000; // 1000 sats
    triggerConfetti(simulatedAmount);
    sendResponse({success: true});
  } else if (request.action === "getBalance") {
    getBalance().then(sendResponse).catch(error => sendResponse({error: error.message}));
    return true;
  } else if (request.action === "getTransactions") {
    getTransactions().then(sendResponse).catch(error => sendResponse({error: error.message}));
    return true;
  }
});

async function getTransactions(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const transactions = await client.getTransactions();
      return transactions.slice(0, 5);  // Return only the 5 most recent transactions
    } catch (error) {
      console.error(`Error getting transactions (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
}
