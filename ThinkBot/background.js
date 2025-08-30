async function parseApiError(response) {
  let errorDetails = `HTTP status ${response.status}`;
  try {
    const errorData = await response.json();
    errorDetails = errorData?.error?.message || JSON.stringify(errorData);
  } catch (parseError) {
    try {
      errorDetails = await response.text() || errorDetails;
    } catch {}
  }
  return errorDetails;
}

async function callAI(model, apiKey, prompt) {
  let url, body, headers;

  if (model.startsWith("gemini")) {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    headers = { "Content-Type": "application/json" };
    body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    });
  }

  else if (model.startsWith("gpt-")) {
    url = "https://api.openai.com/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
  }

  else if (model.startsWith("claude-")) {
    url = "https://api.anthropic.com/v1/messages";
    headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    };
    body = JSON.stringify({
      model,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    });
  }

  else if (model.startsWith("mixtral") || model.startsWith("mistral")) {
    url = "https://api.mistral.ai/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }]
    });
  }

  else if (model.startsWith("llama")) {
    url = "https://api.together.xyz/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }]
    });
  }

  else if (model.startsWith("command-")) {
    url = "https://api.cohere.ai/v1/chat";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model,
      message: prompt
    });
  }

  else if (model.startsWith("grok")) {
    url = "https://api.x.ai/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }]
    });
  }

  else if (model.startsWith("amazon-titan")) {
    url = "https://bedrock-runtime.us-east-1.amazonaws.com/model-invoke";
    headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model,
      input: prompt
    });
  }

  else {
    throw new Error(`Unsupported model: ${model}`);
  }

  const response = await fetch(url, { method: "POST", headers, body });
  if (!response.ok) {
    const err = await parseApiError(response);
    throw new Error(err);
  }
  const data = await response.json();

  if (model.startsWith("gemini")) {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  if (model.startsWith("gpt-") || model.startsWith("mixtral") || model.startsWith("mistral") || model.startsWith("llama") || model.startsWith("grok")) {
    return data.choices?.[0]?.message?.content || "";
  }
  if (model.startsWith("claude-")) {
    return data.content?.[0]?.text || "";
  }
  if (model.startsWith("command-")) {
    return data.text || "";
  }
  if (model.startsWith("amazon-titan")) {
    return data.outputText || "";
  }

  return "No response parsed.";
}

async function fetchAnswerForMCQ(questionData) {
  if (!questionData?.question || !questionData.options?.length) {
    return { answer: "Error: Invalid or incomplete MCQ data received.", model: "" };
  }

  const optionsString = questionData.options.join('\n');
  const prompt = `Given the following multiple-choice question and options:\n\nQuestion:\n${questionData.question}\n\nOptions:\n${optionsString}\n\nChoose the single best answer strictly from the options.\n\nFormat:\nAnswer: [Full option]\nExplanation: [Short reasoning with **keywords**].`;

  try {
    const { apiKey, model, enabled } = await new Promise(resolve => {
      chrome.storage.local.get(["apiKey", "model", "enabled"], resolve);
    });

    if (!enabled) return { answer: "ThinkBot\n\nExtension is OFF. Enable it in popup.", model };
    if (!apiKey) return { answer: "Error: No API key set. Please enter it in the popup.", model };

    const answer = await callAI(model, apiKey, prompt);
    return { answer: answer.trim(), model };
  } catch (err) {
    return { answer: `Error: ${err.message}`, model: "" };
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchAnswer") {
    fetchAnswerForMCQ(request.data)
      .then(({ answer, model }) => {
        chrome.storage.local.get(["modelLabel"], (stored) => {
          sendResponse({
            success: true,
            answer,
            model,
            modelLabel: stored.modelLabel || model
          });
        });
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
      
    return true; 
  }
});



chrome.runtime.onInstalled.addListener(() => {
  console.log("ThinkBot extension installed/updated.");
});
console.log("ThinkBot background script running.");


