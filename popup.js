import { nwc } from "https://esm.sh/@getalby/sdk@3.7.0";

const NWC_SECRET = 'your-secret-here';
let client;

async function getBalance(client) {
    const balance = await client.getBalance();
    return balance.balance / 1000; // Convert millisatoshis to satoshis
}

async function updateBalance() {
    const balance = await getBalance(client);
    updateBalanceDisplay(balance);
}

function updateBalanceDisplay(balance) {
    const balanceElement = document.getElementById('balance');
    balanceElement.innerHTML = '<h2>Current Balance:</h2>' +
        '<p>' + balance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' sats</p>';
}

async function initPopup() {
    client = new nwc.NWCClient({nostrWalletConnectUrl: NWC_SECRET});
    await updateBalance();
    setInterval(updateBalance, 5000); // Update balance every 5 seconds
}

document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
    updateBalance();
    updateTransactions();
    setInterval(updateBalance, 5000); // Update balance every 5 seconds
    setInterval(updateTransactions, 10000); // Update transactions every 10 seconds
}

function updateBalance() {
    chrome.runtime.sendMessage({action: "getBalance"}, function(response) {
        const balanceElement = document.getElementById('balance');
        if (response.error) {
            balanceElement.innerHTML = '<h2>Error:</h2><p>' + response.error + '</p>';
        } else {
            balanceElement.innerHTML = '<h2>Current Balance:</h2>' +
                '<p>' + response.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' sats</p>';
        }
    });
}

function updateTransactions() {
    chrome.runtime.sendMessage({action: "getTransactions"}, function(response) {
        const transactionList = document.getElementById('transactionList');
        if (response.error) {
            transactionList.innerHTML = '<li>Error: ' + response.error + '</li>';
        } else {
            transactionList.innerHTML = '';
            response.forEach(tx => {
                const li = document.createElement('li');
                const amount = tx.amount / 1000; // Convert millisatoshis to satoshis
                li.textContent = `${tx.description || 'Transaction'}: ${amount.toLocaleString(undefined, {maximumFractionDigits: 0})} sats`;
                transactionList.appendChild(li);
            });
        }
    });
}