
# THINKBOT  

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


**ThinkBot** is a Chrome extension built to assist students and learners by automatically detecting multiple-choice questions (MCQs) on supported Learning Management System (LMS) pages and generating AI-powered answers in real time. Unlike traditional extensions that rely on predefined datasets, ThinkBot connects directly to popular large language models (LLMs) and delivers precise answers with short keyword-based explanations.

At its core, ThinkBot provides a seamless integration between modern AI models and LMS platforms. Once activated, it continuously scans the page, identifies questions along with their possible answer options, and forwards them to the chosen AI provider. The results are displayed in a movable, styled answer box that overlays the LMS interface without disturbing the original content.

---

## Key Capabilities

ThinkBot is designed with flexibility and reliability in mind. Users can configure their own API key and select from a broad list of supported models, including **Google Gemini**, **OpenAI GPT series**, **Anthropic Claude**, **Mistral**, **Mixtral**, **Meta LLaMA**, **Cohere Command R+**, **xAI Grok**, and **Amazon Titan**. This ensures that users are not limited to a single provider and can choose the model that best suits their requirements for speed, accuracy, or cost-effectiveness.

The extension provides a clean and intuitive popup panel, where users can enter their API key, choose the AI model, toggle the extension on or off, and manage settings. All preferences are saved locally within the browser using Chrome’s storage API, so they persist across sessions.

On the LMS page itself, ThinkBot injects a styled answer box that contains the selected model’s response. The box is fully draggable, allowing users to reposition it anywhere on the screen. Answers are presented with clear formatting: the best choice is highlighted, and reasoning is displayed with emphasized keywords to help learners understand the logic behind the answer rather than simply memorizing it.

Error handling is built into the extension. If an API key is missing, invalid, or if the provider returns an error, the user is notified with a clear message. The extension can be disabled at any time from the popup, ensuring that users have full control over when and how ThinkBot operates.

---

## How It Works

1. **Detection of Questions and Options**  
   ThinkBot uses content scripts to scan supported LMS pages for question blocks and answer options. The detection logic is designed to handle multiple page structures and is flexible enough to adapt to different LMS formats.

2. **Sending Queries to AI Providers**  
   Once a question and its options are extracted, the extension composes a structured prompt and sends it to the configured AI model through secure API requests. Each provider has a slightly different endpoint and request structure, which is handled internally by the background service worker.

3. **Receiving and Formatting Responses**  
   The AI-generated answer is parsed, formatted, and injected back into the page through a draggable overlay box. The formatting step ensures that answers are easy to read, while explanations highlight keywords for clarity.

4. **User Interaction**  
   Users interact mainly through the popup, which acts as the control panel. The popup interface allows for API key entry, model selection, and enabling/disabling the extension. A reload button is also available for quickly refreshing the current tab with updated settings.

---

## Installation

To install ThinkBot in development mode:

1. Clone or download this repository to your local machine.  
2. Open Google Chrome and navigate to `chrome://extensions/`.  
3. Enable **Developer Mode** from the top-right corner.  
4. Click **Load Unpacked** and select the project directory.  
5. The ThinkBot icon will appear in your extensions toolbar.  

---

## Using ThinkBot

After installation, click on the ThinkBot icon in the toolbar. From the popup, enter a valid API key for your preferred provider, select the model you wish to use, and enable the extension. Once configured, visit any supported LMS page. The extension will automatically detect MCQs, send them to the AI, and display an answer box with the model’s response.

Users can move the answer box to a convenient position on the screen. If needed, the extension can be paused or disabled entirely from the popup without uninstalling it.

---

## Technical Overview

- **Manifest v3**: Built with Chrome’s latest extension framework for performance and security.  
- **Content Scripts**: Responsible for detecting MCQs and injecting the answer box.  
- **Background Service Worker**: Handles API requests to external AI providers and manages responses.  
- **Popup UI**: Provides a user-friendly interface for managing settings.  
- **Persistent Storage**: Saves API keys and preferences locally using Chrome’s storage API.  

---

## Limitations and Disclaimer

ThinkBot is designed for educational purposes and as an aid for learning. The quality of answers depends entirely on the selected AI provider and model. The extension does not guarantee absolute accuracy and should not be used as a substitute for studying or professional advice. Users are encouraged to review and verify all AI-generated answers.

---

## License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this extension with proper credit.


## Credits

Created by **DINESHKARTHIK N** – 2025  
Feel free to contribute or fork the project!
