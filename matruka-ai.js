(function () {
  "use strict";
  const DEFAULT_MODEL = "gemini-2.5-flash";
  const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

  function getApiKey() {
    return null;
  }

  function saveApiKey() {
    return null;
  }

  function hasKey() {
    return Boolean(getApiKey());
  }

  function mountKeyPanel() {
    return;
  }

  function showInlineStatus(panel, message) {
    let status = panel.querySelector(".status-pill");
    if (!status) {
      status = document.createElement("span");
      status.className = "status-pill";
      panel.appendChild(status);
    }
    status.textContent = message;
    window.setTimeout(function () {
      status.remove();
    }, 2200);
  }

  function showLoading(target, message) {
    target.innerHTML = `<div class="loading-row"><i class="fas fa-circle-notch fa-spin"></i><span>${escapeHtml(message || "Working with Gemini...")}</span></div>`;
  }

  function showError(target, message) {
    target.innerHTML = `<div class="notice"><i class="fas fa-triangle-exclamation"></i><span>${escapeHtml(message)}</span></div>`;
  }

  async function fileToPart(file) {
    if (!file) return null;
    const dataUrl = await new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64 = String(dataUrl).split(",")[1];
    return {
      inlineData: {
        mimeType: file.type || "application/octet-stream",
        data: base64
      }
    };
  }

  async function generateText(prompt, options) {
    const opts = options || {};

    const parts = [{ text: prompt }];
    if (opts.file) {
      if (opts.file.size > 18 * 1024 * 1024) {
        throw new Error("This file is too large for direct browser upload. Please use a smaller image or PDF under 18 MB.");
      }
      parts.push(await fileToPart(opts.file));
    }

    const payload = {
      contents: [{ role: "user", parts: parts }],
      generationConfig: {
        temperature: typeof opts.temperature === "number" ? opts.temperature : 0.35,
        topP: 0.9,
        maxOutputTokens: opts.maxOutputTokens || 4096,
        thinkingConfig: {
          thinkingBudget: typeof opts.thinkingBudget === "number" ? opts.thinkingBudget : 0
        }
      }
    };

    if (opts.systemInstruction) {
      payload.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
    }

    const response = await fetch("/api/call", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    payload: payload,
    model: opts.model || DEFAULT_MODEL
  })
});

    const data = await response.json().catch(function () { return null; });
    if (!response.ok) {
      const apiMessage = data && data.error && data.error.message ? data.error.message : response.statusText;
      throw new Error(apiMessage || "Gemini request failed.");
    }

    const text = extractText(data);
    const finishReason = data && data.candidates && data.candidates[0] ? data.candidates[0].finishReason : "";
    if (!text) throw new Error("Gemini returned an empty response." + (finishReason ? " Finish reason: " + finishReason : ""));
    if (finishReason === "MAX_TOKENS") {
      return text + "\n\nNote: Gemini stopped because the output token limit was reached. Try again or shorten the request.";
    }
    return text;
  }

  function extractText(data) {
    const candidates = data && data.candidates ? data.candidates : [];
    return candidates
      .map(function (candidate) {
        return (((candidate.content || {}).parts || [])
          .map(function (part) { return part.text || ""; })
          .join("\n"));
      })
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  function renderMarkdown(text) {
    const lines = String(text || "").replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").split(/\r?\n/);
    const html = [];
    let inList = false;

    lines.forEach(function (raw) {
      const line = raw.trim();
      if (!line) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        return;
      }

      if (/^#{2,3}\s+/.test(line)) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        html.push(`<h3>${escapeHtml(line.replace(/^#{2,3}\s+/, ""))}</h3>`);
        return;
      }

      if (/^[-*]\s+/.test(line)) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        html.push(`<li>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</li>`);
        return;
      }

      if (/^\d+\.\s+/.test(line)) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        html.push(`<li>${escapeHtml(line.replace(/^\d+\.\s+/, ""))}</li>`);
        return;
      }

      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<p>${escapeHtml(line)}</p>`);
    });

    if (inList) html.push("</ul>");
    return `<div class="ai-answer">${html.join("")}</div>`;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function fallbackCropAdvice(data) {
    const soil = String(data.soilType || "").toLowerCase();
    if (soil.includes("clay")) {
      return "## Recommended Crops\n- Rice\n- Cabbage\n- Mustard\n## Fertility Plan\n- Add compost before puddling\n- Use potassium after soil testing\n## Yield Note\n- Expect better output with drainage control and timely transplanting";
    }
    if (soil.includes("sandy")) {
      return "## Recommended Crops\n- Groundnut\n- Millet\n- Carrot\n## Fertility Plan\n- Add organic matter often\n- Use drip irrigation where possible\n## Yield Note\n- Sandy soil needs frequent light irrigation and mulch";
    }
    return "## Recommended Crops\n- Wheat\n- Tomato\n- Maize\n## Fertility Plan\n- Use compost and nitrogen in split doses\n- Keep pH near 6.5 to 7.2 where possible\n## Yield Note\n- Rotate legumes to protect long-term soil health";
  }

  window.MatrukaAI = {
    DEFAULT_MODEL: DEFAULT_MODEL,
    getApiKey: getApiKey,
    saveApiKey: saveApiKey,
    hasKey: hasKey,
    mountKeyPanel: mountKeyPanel,
    generateText: generateText,
    renderMarkdown: renderMarkdown,
    escapeHtml: escapeHtml,
    showLoading: showLoading,
    showError: showError,
    fallbackCropAdvice: fallbackCropAdvice
  };
})();






