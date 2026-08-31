/**
 * Mignon Web Widget (Standalone Embeddable AI Mini-App Engine)
 * Features: Pure Result Only Mode, Instant Auto-Display, Interactive Form, Voice & TTS, Shadow DOM Isolation
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

    const app = await fetchAppMetadata(apiUrl, appId);
    if (!app) {
      shadow.innerHTML = `<div style="font-family: sans-serif; color: #ef4444; padding: 12px; font-size: 13px;">Unable to load Mini-App [${appId}].</div>`;
      return;
    }

    const effectiveMode = display || app.theme?.displayMode || "form";
    renderAppWidget(shadow, app, apiUrl, sessionId, effectiveMode);
  }

  function renderAppWidget(shadow, app, apiUrl, sessionId, displayMode) {
    const primaryColor = app.theme?.primaryColor || "#38bdf8";
    const badgeText = app.theme?.badge || "AI Powered";
    const isResultOnly = displayMode === "result_only" || displayMode === "minimal";
    const isDirect = displayMode === "direct";
    const isAutoRun = isResultOnly || isDirect;

    const defaultInputs = {};
    (app.inputs || []).forEach(inp => { defaultInputs[inp.id] = inp.default || ''; });

    const inputsHtml = (app.inputs || []).map(input => {
      if (input.type === "select") {
        const options = (input.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join("");
        return `
          <div class="form-group">
            <label class="form-label">${input.label}</label>
            <select class="form-control" name="${input.id}">${options}</select>
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
    container.className = isResultOnly ? "mignon-result-only" : "mignon-card";
    container.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Standard Card */
        .mignon-card {
          background: #080c14;
          color: #f8fafc;
          border-radius: 18px;
          border: 1px solid #1e293b;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          max-width: 100%;
        }

        /* Result Only / Pure Minimal View */
        .mignon-result-only {
          background: #040711;
          color: #f8fafc;
          border-radius: 14px;
          border: 1px solid #1e293b;
          padding: 16px;
          font-size: 14px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .header {
          padding: 14px 18px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
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
        }
        .title { font-size: 13.5px; font-weight: 700; color: #ffffff; }
        .badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
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
        }
        .voice-btn {
          background: #1e293b;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 6px 9px;
          border-radius: 8px;
          cursor: pointer;
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
        .result-box {
          padding: 14px;
          background: #040711;
          border: 1px solid #1e293b;
          border-radius: 12px;
          display: ${isAutoRun ? 'block' : 'none'};
        }
        .result-box.active { display: block; animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .result-text {
          font-size: 13.5px;
          line-height: 1.55;
          color: #e2e8f0;
          white-space: pre-wrap;
          font-family: ${app.slug?.includes("fortune") ? "'JetBrains Mono', monospace" : "inherit"};
        }
        
        .result-only-bar {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          margin-top: 8px;
        }
        
        .mini-btn {
          background: #1e293b;
          border: 1px solid #334155;
          color: #cbd5e1;
          font-size: 11px;
          padding: 3px 7px;
          border-radius: 6px;
          cursor: pointer;
        }
        .mini-btn:hover { background: #334155; color: #fff; }
      </style>

      ${isResultOnly ? `
        <!-- Pure Result Only View -->
        <div class="result-text" id="result-content">Loading...</div>
        <div id="dynamic-cards"></div>
        <div class="result-only-bar">
          <button class="mini-btn" id="refresh-btn" title="Refresh Output">🔄</button>
          <button class="mini-btn" id="tts-btn" title="Listen">🔊</button>
          <button class="mini-btn" id="copy-btn" title="Copy">📋</button>
        </div>
      ` : `
        <!-- Standard Card View -->
        <div class="header">
          <div class="header-title-wrap">
            <div class="icon-box">⚡</div>
            <div class="title">${app.name}</div>
          </div>
          <span class="badge">${badgeText}</span>
        </div>

        <div class="body">
          ${!isDirect ? `<p class="desc">${app.description || ''}</p>` : ''}
          
          <form id="widget-form" style="display: ${isDirect ? 'none' : 'flex'}; flex-direction: column; gap: 12px;">
            ${inputsHtml}
            <button type="submit" class="btn-submit" id="submit-btn">
              <span>Execute with Gemini Agent</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <div class="result-box ${isDirect ? 'active' : ''}" id="result-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #38bdf8;">${isDirect ? '🌟 Quote / Result' : '⚡ Gemini Output'}</span>
              <div style="display: flex; gap: 6px;">
                ${isDirect ? `<button class="mini-btn" id="refresh-btn">🔄 Next</button>` : ''}
                <button class="mini-btn" id="tts-btn">🔊 Listen</button>
                <button class="mini-btn" id="copy-btn">📋 Copy</button>
              </div>
            </div>
            <div class="result-text" id="result-content">Loading...</div>
            <div id="dynamic-cards" style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;"></div>
          </div>
        </div>
      `}
    `;

    shadow.innerHTML = "";
    shadow.appendChild(container);

    const form = shadow.getElementById("widget-form");
    const submitBtn = shadow.getElementById("submit-btn");
    const resultBox = shadow.getElementById("result-container");
    const resultContent = shadow.getElementById("result-content");
    const ttsBtn = shadow.getElementById("tts-btn");
    const copyBtn = shadow.getElementById("copy-btn");
    const refreshBtn = shadow.getElementById("refresh-btn");

    async function executeApp(inputPayload) {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Executing Agent...</span>`;
      }
      resultContent.innerText = "Generating...";

      try {
        const res = await fetch(`${apiUrl}/api/v1/apps/${app.id}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: inputPayload, sessionId })
        });

        if (!res.ok) throw new Error("Execution returned an error");
        const data = await res.json();
        resultContent.innerText = data.result?.markdown || "Execution complete.";
        if (resultBox) resultBox.classList.add("active");
      } catch (err) {
        resultContent.innerText = `⚠️ Error: ${err.message}`;
        if (resultBox) resultBox.classList.add("active");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Execute with Gemini Agent</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        }
      }
    }

    // Auto-run if direct or result_only
    if (isAutoRun) {
      executeApp(defaultInputs);
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        executeApp(defaultInputs);
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const inputs = {};
        formData.forEach((val, key) => { inputs[key] = val; });
        executeApp(inputs);
      });
    }

    if (ttsBtn) {
      ttsBtn.addEventListener("click", () => {
        const textToSpeak = resultContent.innerText;
        if (!textToSpeak) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        window.speechSynthesis.speak(utterance);
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(resultContent.innerText);
        copyBtn.innerText = "✓";
        setTimeout(() => { copyBtn.innerText = "📋"; }, 2000);
      });
    }
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
