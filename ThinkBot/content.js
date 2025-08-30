function getQuestionAndOptions() {
    const questionSelectors = [
        '.que .qtext',
        '.assessment-question .question-content',
        '.QuestionArea .question-text',
        'div[role="main"] .text_content',
        '#question-text',
    ];
    const optionSelectors = [
        '.que .answer .r0',
        '.que .answer .r1',
        '.que .answer .specificOptionClass',
        '.answer-option',
        'li.choice-item',
        'label.mcq-option',
        'div.abc-option-class > span'
    ];

    let questionText = null, options = [], questionElement = null;

    for (const selector of questionSelectors) {
        questionElement = document.querySelector(selector);
        if (questionElement?.innerText) {
            questionText = questionElement.innerText.trim();
            break;
        }
    }
    if (!questionText || !questionElement) return null;

    let searchContext = document;
    const questionContainer = questionElement.closest('.que, .question_container, .assessment-question, .question-entry');
    if (questionContainer) searchContext = questionContainer;

    searchContext.querySelectorAll(optionSelectors.join(', ')).forEach(optionEl => {
        const optionText = optionEl.innerText.trim();
        if (optionText && !options.includes(optionText)) options.push(optionText);
    });

    if (options.length === 0 && questionContainer) {
        const answerBlock = questionContainer.querySelector('.answer, .answer_choices, .question-options, .control');
        if (answerBlock) {
            answerBlock.querySelectorAll('div, li, label').forEach(potentialOption => {
                const optionText = potentialOption.innerText.trim();
                if (optionText && optionText.length < 200 && optionText.length > 1 &&
                    !questionText.includes(optionText) &&
                    !options.includes(optionText) &&
                    !potentialOption.querySelector('input[type="submit"], button')
                ) {
                    if (potentialOption.tagName === 'LABEL') options.push(optionText);
                    else if (!potentialOption.querySelector('input[type="radio"], input[type="checkbox"]')) {
                        options.push(optionText);
                    }
                }
            });
        }
    }
    if (options.length < 2) return null;

    return { question: questionText, options: options };
}

function showAnswerBox(initialContentHtml = "Loading...", modelName = "") {
  let box = document.getElementById("lmsGeminiAnswerBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "lmsGeminiAnswerBox";
    box.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 350px;
      max-height: 450px;
      overflow-y: auto;
      z-index: 99999;
      background: linear-gradient(145deg, #ffffff, #f0f0f0);
      border: 1px solid #8b0000;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.25);
      font-size: 14px;
      line-height: 1.6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      user-select: none;
      white-space: normal;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      background: #8b0000;
      color: #fff;
      padding: 6px 10px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      border-radius: 10px 10px 0 0;
    `;
    header.innerHTML = `<span id="lmsHelperTitle">ThinkBot${modelName ? "(" + modelName + ")" : ""}</span>`;

    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✖";
    closeBtn.style.cssText = "cursor: pointer; font-size: 16px; font-weight: bold;";
    closeBtn.onclick = () => box.remove();
    header.appendChild(closeBtn);

    const content = document.createElement("div");
    content.id = "lmsGeminiAnswerContent";
    content.style.cssText = "padding: 12px;";

    box.appendChild(header);
    box.appendChild(content);
    document.body.appendChild(box);

    let isDragging = false, startX, startY, initialX, initialY;
    header.onmousedown = (e) => {
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = box.getBoundingClientRect();
      initialX = rect.left; initialY = rect.top;
      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp);
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      let newX = initialX + e.clientX - startX;
      let newY = initialY + e.clientY - startY;
      newX = Math.max(5, Math.min(newX, window.innerWidth - box.offsetWidth - 5));
      newY = Math.max(5, Math.min(newY, window.innerHeight - box.offsetHeight - 5));
      box.style.left = `${newX}px`; box.style.top = `${newY}px`;
      box.style.right = 'auto'; box.style.bottom = 'auto';
    };
    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }

  const titleSpan = document.getElementById("lmsHelperTitle");
  if (titleSpan) {
    titleSpan.textContent = `ThinkBot${modelName ? "  (" + modelName + ")" : ""}`;
  }

  const contentBox = document.getElementById("lmsGeminiAnswerContent");
  if (contentBox) contentBox.innerHTML = initialContentHtml;
}

function formatResponseText(rawText) {
    if (typeof rawText !== 'string') {
        return `<span style="color: red;">Error: Invalid response format received.</span>`;
    }

    if (rawText.toLowerCase().includes("error:") || rawText.toLowerCase().includes("quota")) {
        return `<span style="color: red; font-weight: bold;">${rawText}</span>`;
    }

    let answerPart = rawText, explanationPart = "";
    const explanationIndex = rawText.toLowerCase().indexOf("explanation:");
    if (explanationIndex !== -1) {
        const boundary = rawText.substring(explanationIndex, explanationIndex + "Breakdown:".length);
        const parts = rawText.split(boundary, 2);
        answerPart = parts[0].replace(/Answer:/i, '').trim();
        explanationPart = parts[1]?.trim() || "";
    } else {
        const lines = rawText.replace(/Answer:/i, '').trim().split('\n');
        answerPart = lines[0]?.trim() || rawText;
        explanationPart = lines.slice(1).join('\n').trim();
    }

    let colorIndex = 0;
    const bgColors = ['#fbeaea', '#fdecec'];   
    const textColors = ['#660000', '#990000']; 

    try {
        explanationPart = explanationPart.replace(/\*\*(.*?)\*\*/g, (match, keyword) => {
            const bgColor = bgColors[colorIndex % bgColors.length];
            const textColor = textColors[colorIndex % textColors.length];
            colorIndex++;
            const sanitizedKeyword = keyword.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return `<span style="background-color: ${bgColor}; color: ${textColor}; 
                     padding: 1px 4px; border-radius: 4px; font-weight: bold; 
                     display: inline-block; margin: 0 1px;">${sanitizedKeyword}</span>`;
        });
    } catch (e) {}

    const sanitizedAnswerPart = answerPart.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return `<b>Answer:</b> ${sanitizedAnswerPart}` + 
           (explanationPart ? `<br><br><b>Breakdown:</b> ${explanationPart}` : "");
}

(async function () {
  await new Promise(resolve => setTimeout(resolve, 600));
  try {
      const { enabled } = await chrome.storage.local.get("enabled");
      if (!enabled) {
          console.log('Extension is OFF. Enable it in popup.');
          return; 
      } 

      const mcqData = getQuestionAndOptions();
      if (mcqData) {
          showAnswerBox("🔍 Analyzing question...");
          try {
              const response = await chrome.runtime.sendMessage({ action: "fetchAnswer", data: mcqData });
             if (response?.success) {
                const formattedHtml = formatResponseText(response.answer);
                showAnswerBox(formattedHtml, response.modelLabel || response.model);
                }else {
                  const errorMessage = response?.error || "Unknown error from background script.";
                  showAnswerBox(`<span style="color: red;"><b>Error:</b> ${errorMessage}</span>`);
              }
          } catch (error) {
              let displayError = error.message || "Unknown communication error.";
              if (displayError.includes("Could not establish connection") || displayError.includes("Receiving end does not exist")) {
                  displayError = "Could not connect to the background script. Please ensure the extension is enabled correctly and try reloading the page.";
              }
              showAnswerBox(`<span style="color: red;"><b>Connection Error:</b> ${displayError}</span>`);
          }
      }

  } catch (error) {}
 
})();

