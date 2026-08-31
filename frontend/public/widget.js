/**
 * Mignon Web Widget (Standalone Embeddable AI Mini-App Engine)
 * Features: Multi-turn Memory, Web Speech Voice Input & TTS, Dynamic UI Cards, Shadow DOM Isolation
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
        const apiUrl = el.getAttribute("data-api-url") || DEFAULT_API_URL;
        mountWidget(el, { appId, theme, apiUrl, layout: "card" });
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
        .launcher-btn:hover {
          transform: scale(1.08);
        }
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
        .modal-container.open {
          display: block;
          opacity: 1;
          transform: translateY(0) scale(1);
        }
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

  async function mountWidget(targetEl, { appId, theme, apiUrl, layout }) {
    const shadow = targetEl.attachShadow ? targetEl.attachShadow({ mode: "open" }) : targetEl;
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    shadow.innerHTML = `
      <style>
        .loader {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 24px;
          background: #0f172a;
          color: #94a3b8;
          border-radius: 16px;
          border: 1px solid #1e293b;
          text-align: center;
          font-size: 14px;
        }
      </style>
      <div class="loader">⚡ Loading AI Mini-App...</div>
    `;

    const app = await fetchAppMetadata(apiUrl, appId);
    if (!app) {
      shadow.innerHTML = `<div class="loader" style="color: #ef4444;">Unable to connect to Mini-App [${appId}]. Ensure backend is running.</div>`;
      return;
    }

    renderAppWidget(shadow, app, apiUrl, sessionId);
  }

  function renderAppWidget(shadow, app, apiUrl, sessionId) {
    const primaryColor = app.theme?.primaryColor || "#38bdf8";
    const badgeText = app.theme?.badge || "AI Powered";

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
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
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
          padding: 16px 20px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .header-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .icon-box {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${primaryColor};
          font-weight: bold;
          font-size: 16px;
        }
        .title {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }
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
        .body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .desc {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.45;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .input-with-voice {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .form-control {
          flex: 1;
          background: #131d31;
          border: 1px solid #23354f;
          color: #ffffff;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 13px;
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
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.15s ease;
        }
        .voice-btn.recording {
          background: #ef4444;
          color: #fff;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .btn-submit {
          background: linear-gradient(135deg, ${primaryColor} 0%, #4f46e5 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          padding: 11px 16px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s ease, transform 0.1s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .btn-submit:hover {
          opacity: 0.94;
          transform: translateY(-1px);
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .result-box {
          margin-top: 10px;
          padding: 16px;
          background: #040711;
          border: 1px solid #1e293b;
          border-radius: 12px;
          display: none;
        }
        .result-box.active {
          display: block;
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        }
        .tts-btn {
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
        .custom-cards-wrap {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .flight-item {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .flight-price {
          font-weight: 800;
          color: #10b981;
          font-size: 15px;
        }
        .action-bar {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 10px;
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
        .act-btn:hover {
          background: #334155;
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
        <p class="desc">${app.description || 'Smart autonomous micro-agent powered by Gemini 3.5 Flash.'}</p>
        
        <form id="widget-form" style="display: flex; flex-direction: column; gap: 12px;">
          ${inputsHtml}
          
          <button type="submit" class="btn-submit" id="submit-btn">
            <span>Execute with Gemini Agent</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>

        <div class="result-box" id="result-container">
          <div class="result-header">
            <span style="font-size: 11px; font-weight: 700; color: #38bdf8;">⚡ Gemini 3.5 Flash Agent Output</span>
            <button class="tts-btn" id="tts-btn">🔊 Listen</button>
          </div>
          <div class="result-text" id="result-content"></div>
          <div id="dynamic-cards" class="custom-cards-wrap"></div>
          
          <div class="action-bar" id="action-bar">
            <button class="act-btn" id="copy-btn">📋 Copy Summary</button>
            <button class="act-btn" id="share-btn">🔗 Share Output</button>
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
    const dynamicCards = shadow.getElementById("dynamic-cards");
    const ttsBtn = shadow.getElementById("tts-btn");
    const copyBtn = shadow.getElementById("copy-btn");

    // Voice Dictation setup
    const voiceButtons = shadow.querySelectorAll(".voice-btn");
    voiceButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetName = btn.getAttribute("data-target");
        const targetInput = shadow.querySelector(`[name="${targetName}"]`);
        if (!targetInput) return;

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
          alert("Speech recognition is not supported in this browser.");
          return;
        }

        const recognition = new SpeechRec();
        recognition.lang = "es-ES";
        recognition.interimResults = false;

        btn.classList.add("recording");
        recognition.start();

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          targetInput.value = transcript;
          btn.classList.remove("recording");
        };

        recognition.onerror = () => {
          btn.classList.remove("recording");
        };

        recognition.onend = () => {
          btn.classList.remove("recording");
        };
      });
    });

    // TTS voice playback
    ttsBtn.addEventListener("click", () => {
      const textToSpeak = resultContent.innerText;
      if (!textToSpeak) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
    });

    // Copy action
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(resultContent.innerText);
      copyBtn.innerText = "✓ Copied!";
      setTimeout(() => { copyBtn.innerText = "📋 Copy Summary"; }, 2000);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Executing Agent Tool Chain...</span>`;
      resultBox.classList.remove("active");

      const formData = new FormData(form);
      const inputs = {};
      formData.forEach((val, key) => { inputs[key] = val; });

      try {
        const res = await fetch(`${apiUrl}/api/v1/apps/${app.id}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs, sessionId })
        });

        if (!res.ok) throw new Error("Agent execution returned an error");
        const data = await res.json();

        resultContent.innerText = data.result?.markdown || "Execution complete.";
        dynamicCards.innerHTML = "";

        if (data.result?.tool_data?.flights) {
          data.result.tool_data.flights.forEach(f => {
            const el = document.createElement("div");
            el.className = "flight-item";
            el.innerHTML = `
              <div>
                <div style="font-weight: 700; color: #fff;">${f.airline} <span style="color:#64748b; font-size:12px;">(${f.flight_number})</span></div>
                <div style="font-size: 11px; color: #94a3b8;">${f.departure} ➔ ${f.arrival} • ${f.duration} (${f.stop_details})</div>
              </div>
              <div class="flight-price">$${f.price_usd}</div>
            `;
            dynamicCards.appendChild(el);
          });
        }

        resultBox.classList.add("active");
      } catch (err) {
        resultContent.innerText = `⚠️ Error: ${err.message}`;
        resultBox.classList.add("active");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Execute with Gemini Agent</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      }
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
