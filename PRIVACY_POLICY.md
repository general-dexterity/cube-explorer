# Privacy Policy for Cube Explorer

**Last Updated: July 2025**

## Overview

Cube Explorer ("the Extension") is a Chrome DevTools extension designed to help developers debug and analyze Cube.js API requests. This privacy policy explains how the Extension handles user data.

## Data Collection and Usage

### What We Collect

The Extension collects and processes the following data **locally on your device**:

1. **Network Request Data**: HTTP requests and responses to/from Cube.js API endpoints that you configure, including:
   - Request URLs and headers
   - Query parameters and payloads
   - Response data and error messages
   - Request timing and performance metrics

2. **User Preferences**: Settings you configure within the Extension, including:
   - Custom Cube.js API endpoint URLs
   - Auto-capture preferences
   - UI preferences

### What We DON'T Collect

- Personal identification information
- Browsing history outside of Cube.js API requests
- Cookies or authentication tokens
- Data from websites other than configured Cube.js endpoints
- Any data when the DevTools panel is closed

## Data Storage

- **Temporary Data**: Captured requests (limited to last 100) are stored in memory only while DevTools is open. This data is automatically cleared when you close DevTools.
- **Persistent Data**: Your settings (URLs to monitor and auto-capture preference) are saved using Chrome's sync storage API, which may synchronize across devices if you're signed into Chrome.
- **No External Storage**: No data is ever sent to external servers or third parties.

## Data Sharing

**We do not share, sell, or transmit any data to third parties.** All processing happens locally in your browser.

## Permissions Explained

### Storage Permission
Used exclusively to save your extension preferences (monitored URLs and auto-capture setting) using Chrome's sync storage API.

### Host Permissions (`<all_urls>`)
Required to intercept network requests to any URL. The Extension only monitors requests that match the Cube.js endpoints you explicitly configure in the settings.

### DevTools Page Permission
Allows the Extension to add a panel to Chrome DevTools where you can view and analyze Cube.js requests.

## Data Security

- All data remains on your local device
- No network connections are made by the Extension itself
- No analytics or tracking code is included
- The Extension is open source and can be audited

## User Control

You have complete control over your data:
- Clear all captured requests using the trash icon in the Extension
- Remove configured URLs from the settings at any time
- Disable auto-capture to manually control when requests are monitored
- Uninstall the Extension to remove all associated data

## Children's Privacy

This Extension is a developer tool not directed at children under 13. We do not knowingly collect information from children.

## Changes to This Policy

Any changes to this privacy policy will be reflected in the Extension's update notes and on this page with an updated revision date.

## Contact

For questions or concerns about this privacy policy or the Extension's data practices, please:
- Open an issue on our GitHub repository: https://github.com/general-dexterity/cube-explorer
- Email: contact+cube-explorer@general-dexterity.com

By using Cube Explorer, you acknowledge that you have read and understood this privacy policy.
