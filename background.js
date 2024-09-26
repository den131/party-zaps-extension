import { nwc } from "https://esm.sh/@getalby/sdk@3.7.0";

const NWC_SECRET = 'nostr+walletconnect://a3b4e8afed8d60d6c120b9744970ad3f7c48f6722e5483376b1d7f91c7a112fb?relay=wss://relay.getalby.com/v1&secret=6f9afdde522bf4b918de6f29244d90dcd8e28aa78cbc01038b597f40f5338ad7';
let lastKnownBalance = null;
let client;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkBalance', { periodInMinutes: 0.1 }); // Check every 6 seconds
  initNWC();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkBalance') {
    checkBalanceChange();
  }
});

async function initNWC() {
  client = new nwc.NWCClient({nostrWalletConnectUrl: NWC_SECRET});
  try {
    lastKnownBalance = await getBalance();
    console.log("NWC initialized successfully. Initial balance:", lastKnownBalance);
  } catch (error) {
    console.error("Error initializing NWC:", error);
  }
}

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
  try {
    const currentBalance = await getBalance();
    console.log("Checking balance. Current:", currentBalance, "Last known:", lastKnownBalance);
    if (lastKnownBalance !== null && currentBalance > lastKnownBalance) {
      const difference = currentBalance - lastKnownBalance;
      console.log("Balance increased. Triggering confetti for amount:", difference);
      triggerConfetti(difference);
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