# NWC Party Zaps Extension

A Chrome extension that triggers confetti and notifications for Nostr Wallet Connect (NWC) transactions above a set threshold.
99.99% of the work is done by AI. I have no idea what I am doing 😂

- Listens for NWC transactions in the background.
- Triggers a confetti animation for transactions above a configurable threshold.
- Displays a temporary notification showing the received amount in sats.
- Fallback confetti animation if the main confetti library is unavailable.
- Customizable confetti colors and animation parameters.

## How it Works

The extension injects a content script into web pages, which communicates with the extension's background script. When a transaction is detected, the content script creates a fun confetti explosion.

## Installation

1. Clone the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Configuration
Click the extension and enter NWC connection secret and desired settings.
