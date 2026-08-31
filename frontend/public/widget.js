/**
 * Mignon Web Widget (Standalone Embeddable AI Mini-App Engine)
 * Features: Instant Auto-Display Mode, Multi-turn Memory, Web Speech Voice & TTS, Dynamic UI Cards, Shadow DOM Isolation
 */
(function () {
  const SCRIPT_TAG = document.currentScript;
  const DEFAULT_API_URL = SCRIPT_TAG?.getAttribute("data-api-url") || window.__MIGNON_API_URL__ || "http://localhost:4000";

  function initAllWidgets() {
    const containers = document.querySelectorAll("[data-mignon-app], #mignon-widget, .mignon-widget");
    containers.forEach(el => {
      if (!el.__mignon_initialized) {
        el.__mignon_initialized = true;
        const appId = el.getAttribute("data-app-id") || el.getAttribute("data-mignon-app") || "app_flight_scout";
        const theme = el.getAttribute("data-theme") || "dark";
        const display = el.getAttribute("data-display") || null;
        const apiUrl = el.getAttribute("data-api-url") || DEFAULT_API_URL;
        mountWidget(el, { appId, theme, display, apiUrl, layout: "card" });
      }
    });

    if (SCRIPT_TAG && SCRIPT_TAG.getAttribute("data-mode") === "floating") {
      const appId = SCRIPT_TAG.getAttribute("data-app-id") || "app_world_clock";
      mountFloatingWidget({ appId, apiUrl: DEFAULT_API_URL });
    }
  }

  async function fetchAppMetadata(apiUrl, appId) {
    try {
      const res = await fetch(`${apiUrl}/api/v1/apps/${appId}`);
      if (!res.ok) throw new Error("Failed to load Mini-App metadata");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error("[Mignon Widget Error]", err);
      return null;
    }
  }

  function mountFloatingWidget({ appId, apiUrl }) {
    const floatingHost = document.createElement("div");
    floatingHost.id = "mignon-floating-host";
    document.body.appendChild(floatingHost);

    const shadow = floatingHost.attachShadow({ mode: "open" });
    let isOpen = false;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <style>
        .launcher-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.5), 0 8px 10px -6px rgba(14, 165, 233, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .launcher-btn:hover { transform: scale(1.08); }
        .modal-container {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 400px;
          max-width: calc(100vw - 48px);
          max-height: 620px;
          z-index: 999999;
          display: none;
          opacity: 0;
          transform: translateY(12px) scale(0.96);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .modal-container.open { display: block; opacity: 1; transform: translateY(0) scale(1); }
      </style>
      <button class="launcher-btn" id="launch-btn" title="Open AI Mini-App Assistant">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      </button>
      <div class="modal-container" id="modal-box"></div>
    `;

    shadow.appendChild(wrapper);
    const btn = shadow.getElementById("launch-btn");
    const modalBox = shadow.getElementById("modal-box");

    btn.addEventListener("click", () => {
      isOpen = !isOpen;
      if (isOpen) {
        modalBox.classList.add("open");
        if (!modalBox.hasChildNodes()) {
          mountWidget(modalBox, { appId, theme: "dark", apiUrl, layout: "floating" });
        }
      } else {
        modalBox.classList.remove("open");
      }
    });
  }

  async function mountWidget(targetEl, { appId, theme, display, apiUrl, layout }) {
    const shadow = targetEl.attachShadow ? targetEl.attachShadow({ mode: "open" }) : targetEl;
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    shadow.innerHTML = `
      <style>
        .loader {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 24px;
          background: #080c14;
          color: #94a3b8;
          border-radius: 18px;
          border: 1px solid #1e293b;
          text-align: center;
          font-size: 13px;
        }
      </style>
      <div class="loader">⚡ Loading AI Mini-App...</div>
    `;

    const app = await fetchAppMetadata(apiUrl, appId);
    if (!app) {
      shadow.innerHTML = `<div class="loader" style="color: #ef4444;">Unable to connect to Mini-App [${appId}]. Ensure backend is running.</div>`;
      return;
    }

    const isDirectDisplay = display === "direct" || app.theme?.displayMode === "direct";
    renderAppWidget(shadow, app, apiUrl, sessionId, isDirectDisplay);
  }

  function renderAppWidget(shadow, app, apiUrl, sessionId, isDirectDisplay) {
    const primaryColor = app.theme?.primaryColor || "#38bdf8";
    const badgeText = app.theme?.badge || "AI Powered";

    const defaultInputs = {};
    (app.inputs || []).forEach(inp => { defaultInputs[inp.id] = inp.default || ''; });

    const inputsHtml = (app.inputs || []).map(input => {
      if (input.type === "select") {
        const options = (input.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join("");
        return `
          <div class="form-group">
            <label class="form-label">${input.label}</label>
            <select class="form-control" name="${input.id}">
              ${options}
            </select>
          </div>
        `;
      }
      if (input.type === "textarea") {
        return `
          <div class="form-group">
            <label class="form-label">${input.label}</label>
            <div class="input-with-voice">
              <textarea class="form-control" name="${input.id}" rows="2" placeholder="${input.placeholder || ''}">${input.default || ''}</textarea>
              <button type="button" class="voice-btn" data-target="${input.id}" title="Speak by Voice">🎤</button>
            </div>
          </div>
        `;
      }
      return `
        <div class="form-group">
          <label class="form-label">${input.label}</label>
          <div class="input-with-voice">
            <input class="form-control" type="${input.type || 'text'}" name="${input.id}" value="${input.default || ''}" placeholder="${input.placeholder || ''}" ${input.required ? 'required' : ''} />
            <button type="button" class="voice-btn" data-target="${input.id}" title="Speak by Voice">🎤</button>
          </div>
        </div>
      `;
    }).join("");

    const container = document.createElement("div");
    container.className = "mignon-card";
    container.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .mignon-card {
          background: #080c14;
          color: #f8fafc;
          border-radius: 18px;
          border: 1px solid #1e293b;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
          overflow: hidden;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          max-width: 100%;
        }
        .header {
          padding: 14px 18px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .header-title-wrap { display: flex; align-items: center; gap: 8px; }
        .icon-box {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${primaryColor};
          font-weight: bold;
          font-size: 15px;
        }
        .title { font-size: 13.5px; font-weight: 700; color: #ffffff; }
        .badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(56, 189, 248, 0.12);
          color: ${primaryColor};
          border: 1px solid rgba(56, 189, 248, 0.3);
        }
        .body { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .desc { font-size: 12.5px; color: #94a3b8; line-height: 1.45; }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-label { font-size: 11.5px; font-weight: 600; color: #cbd5e1; }
        .input-with-voice { display: flex; align-items: center; gap: 6px; }
        .form-control {
          flex: 1;
          background: #131d31;
          border: 1px solid #23354f;
          color: #ffffff;
          padding: 8px 11px;
          border-radius: 8px;
          font-size: 12.5px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .form-control:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }
        .voice-btn {
          background: #1e293b;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 6px 9px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }
        .btn-submit {
          background: linear-gradient(135deg, ${primaryColor} 0%, #4f46e5 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 12.5px;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-submit:hover { opacity: 0.94; }
        .result-box {
          padding: 14px;
          background: #040711;
          border: 1px solid #1e293b;
          border-radius: 12px;
          display: ${isDirectDisplay ? 'block' : 'none'};
        }
        .result-box.active { display: block; animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .result-text {
          font-size: 13px;
          line-height: 1.55;
          color: #e2e8f0;
          white-space: pre-wrap;
          font-family: ${app.slug?.includes("fortune") ? "'JetBrains Mono', monospace" : "inherit"};
        }
        .tts-btn, .refresh-btn {
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          color: ${primaryColor};
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .action-bar {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #1e293b;
        }
        .act-btn {
          flex: 1;
          background: #1e293b;
          border: 1px solid #334155;
          color: #e2e8f0;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
        }
      </style>

      <div class="header">
        <div class="header-title-wrap">
          <div class="icon-box">⚡</div>
          <div class="title">${app.name}</div>
        </div>
        <span class="badge">${badgeText}</span>
      </div>

      <div class="body">
        ${!isDirectDisplay ? `<p class="desc">${app.description || ''}</p>` : ''}
        
        <form id="widget-form" style="display: ${isDirectDisplay ? 'none' : 'flex'}; flex-direction: column; gap: 12px;">
          ${inputsHtml}
          
          <button type="submit" class="btn-submit" id="submit-btn">
            <span>Execute with Gemini Agent</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>

        <div class="result-box ${isDirectDisplay ? 'active' : ''}" id="result-container">
          <div class="result-header">
            <span style="font-size: 11px; font-weight: 700; color: #38bdf8;">
              ${isDirectDisplay ? '🌟 Daily Quote / Fortune' : '⚡ Gemini Output'}
            </span>
            <div style="display: flex; gap: 6px;">
              ${isDirectDisplay ? `<button class="refresh-btn" id="refresh-quote-btn">🔄 Next Quote</button>` : ''}
              <button class="tts-btn" id="tts-btn">🔊 Listen</button>
            </div>
          </div>
          <div class="result-text" id="result-content">Loading quote directly...</div>
          <div id="dynamic-cards" style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;"></div>
          
          <div class="action-bar">
            <button class="act-btn" id="copy-btn">📋 Copy</button>
            <button class="act-btn" id="share-btn">🔗 Share</button>
          </div>
        </div>
      </div>
    `;

    shadow.innerHTML = "";
    shadow.appendChild(container);

    const form = shadow.getElementById("widget-form");
    const submitBtn = shadow.getElementById("submit-btn");
    const resultBox = shadow.getElementById("result-container");
    const resultContent = shadow.getElementById("result-content");
    const ttsBtn = shadow.getElementById("tts-btn");
    const copyBtn = shadow.getElementById("copy-btn");
    const refreshBtn = shadow.getElementById("refresh-quote-btn");

    async function executeApp(inputPayload) {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Executing Agent...</span>`;
      }
      resultContent.innerText = "Generating with Gemini Agent...";

      try {
        const res = await fetch(`${apiUrl}/api/v1/apps/${app.id}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: inputPayload, sessionId })
        });

        if (!res.ok) throw new Error("Execution returned an error");
        const data = await res.json();
        resultContent.innerText = data.result?.markdown || "Execution complete.";
        resultBox.classList.add("active");
      } catch (err) {
        resultContent.innerText = `⚠️ Error: ${err.message}`;
        resultBox.classList.add("active");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Execute with Gemini Agent</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        }
      }
    }

    // If direct display mode, auto-execute immediately upon loading!
    if (isDirectDisplay) {
      executeApp(defaultInputs);
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        executeApp(defaultInputs);
      });
    }

    // Form submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const inputs = {};
      formData.forEach((val, key) => { inputs[key] = val; });
      executeApp(inputs);
    });

    // TTS & Copy
    ttsBtn.addEventListener("click", () => {
      const textToSpeak = resultContent.innerText;
      if (!textToSpeak) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
    });

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(resultContent.innerText);
      copyBtn.innerText = "✓ Copied!";
      setTimeout(() => { copyBtn.innerText = "📋 Copy"; }, 2000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllWidgets);
  } else {
    initAllWidgets();
  }

  window.Mignon = {
    init: initAllWidgets,
    mount: (el, opts) => mountWidget(el, { apiUrl: DEFAULT_API_URL, ...opts })
  };
})();
