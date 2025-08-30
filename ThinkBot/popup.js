document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const modelSelect = document.getElementById("model");
  const enabledToggle = document.getElementById("enabled");
  const saveBtn = document.getElementById("saveBtn");
  const reloadBtn = document.getElementById("reloadPage");
  const status = document.getElementById("status");

  chrome.storage.local.get(["apiKey", "model", "enabled"], (data) => {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.model) modelSelect.value = data.model;
    enabledToggle.checked = data.enabled ?? true;
  });

saveBtn.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();
  const modelValue = modelSelect.value;
  const modelLabel = modelSelect.options[modelSelect.selectedIndex].text; 
  const enabled = enabledToggle.checked;

  if (!apiKey) {
    status.textContent = "API Key required!";
    status.style.color = "red";
    return;
  }

  chrome.storage.local.set({ apiKey, model: modelValue, modelLabel, enabled }, () => {
    status.textContent = "Settings saved!";
    status.style.color = "green";
    setTimeout(() => (status.textContent = ""), 2000);
  });
});


  enabledToggle.addEventListener("change", () => {
    const enabled = enabledToggle.checked;
    chrome.storage.local.set({ enabled });
  });

  reloadBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.reload(tabs[0].id);
        window.close();
      }
    });
  });
});
