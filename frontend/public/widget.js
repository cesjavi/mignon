/**
 * Mignon Web Widget (Standalone Embeddable AI Mini-App Engine)
 * Works via <script src=".../widget.js" data-app-id="..." data-api-url="..."></script>
 * or <div id="mignon-widget" data-app-id="..."></div>
 */
(function () {
  const SCRIPT_TAG = document.currentScript;
  const DEFAULT_API_URL = SCRIPT_TAG?.getAttribute("data-api-url") || window.__MIGNON_API_URL__ || "http://localhost:4000";

  function initAllWidgets() {
    // 1. Check for inline containers
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

    // 2. Check if script tag requests a floating launcher
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
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.4);
          border: none;
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
          bottom: 92px;
          right: 24px;
          width: 380px;
          max-width: calc(100vw - 48px);
          max-height: 600px;
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
      <button class="launcher-btn" id="launch-btn" title="Open AI Mini-App">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
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

    // Loading placeholder
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
      <div class="loader">Loading AI Mini-App...</div>
    `;

    const app = await fetchAppMetadata(apiUrl, appId);
    if (!app) {
      shadow.innerHTML = `<div class="loader" style="color: #ef4444;">Unable to connect to Mini-App [${appId}]. Ensure backend is running.</div>`;
      return;
    }

    renderAppWidget(shadow, app, apiUrl);
  }

  function renderAppWidget(shadow, app, apiUrl) {
    const primaryColor = app.theme?.primaryColor || "#3B82F6";
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
            <textarea class="form-control" name="${input.id}" rows="2" placeholder="${input.placeholder || ''}">${input.default || ''}</textarea>
          </div>
        `;
      }
      return `
        <div class="form-group">
          <label class="form-label">${input.label}</label>
          <input class="form-control" type="${input.type || 'text'}" name="${input.id}" value="${input.default || ''}" placeholder="${input.placeholder || ''}" ${input.required ? 'required' : ''} />
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
          background: #090d16;
          color: #f8fafc;
          border-radius: 16px;
          border: 1px solid #1e293b;
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
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
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${primaryColor};
          font-weight: bold;
          font-size: 16px;
        }
        .title {
          font-size: 14px;
          font-weight: 600;
          color: #f8fafc;
        }
        .badge {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.15);
          color: ${primaryColor};
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .desc {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.4;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 500;
          color: #cbd5e1;
        }
        .form-control {
          background: #1e293b;
          border: 1px solid #334155;
          color: #ffffff;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .form-control:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .btn-submit {
          background: linear-gradient(135deg, ${primaryColor} 0%, #4338ca 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s ease, transform 0.1s ease;
        }
        .btn-submit:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .result-box {
          margin-top: 12px;
          padding: 14px;
          background: #030712;
          border: 1px solid #1f2937;
          border-radius: 10px;
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
        .result-text {
          font-size: 13px;
          line-height: 1.5;
          color: #e2e8f0;
          white-space: pre-wrap;
        }
        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 11px;
          color: #64748b;
        }
        .custom-cards-wrap {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .flight-item {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .flight-price {
          font-weight: 700;
          color: #10b981;
          font-size: 15px;
        }
        .time-pill {
          background: #1e293b;
          padding: 6px 10px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
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
        <p class="desc">${app.description || 'Smart autonomous micro-agent powered by Gemini.'}</p>
        
        <form id="widget-form" style="display: flex; flex-direction: column; gap: 12px;">
          ${inputsHtml}
          
          <button type="submit" class="btn-submit" id="submit-btn">
            <span>Run with Gemini Agent</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>

        <div class="result-box" id="result-container">
          <div class="result-text" id="result-content"></div>
          <div id="dynamic-cards" class="custom-cards-wrap"></div>
          <div class="meta-pill" id="result-meta">
            ⚡ Powered by Gemini 3.5 Flash & Mignon Engine
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Executing Agent Tools...</span>`;
      resultBox.classList.remove("active");

      const formData = new FormData(form);
      const inputs = {};
      formData.forEach((val, key) => { inputs[key] = val; });

      try {
        const res = await fetch(`${apiUrl}/api/v1/apps/${app.id}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs })
        });

        if (!res.ok) throw new Error("Agent execution returned an error");
        const data = await res.json();

        resultContent.innerText = data.result?.markdown || "Execution complete.";
        dynamicCards.innerHTML = "";

        // If tool output contains flights, render flight cards
        if (data.result?.tool_data?.flights) {
          data.result.tool_data.flights.forEach(f => {
            const el = document.createElement("div");
            el.className = "flight-item";
            el.innerHTML = `
              <div>
                <div style="font-weight: 600; color: #fff;">${f.airline} <span style="color:#64748b; font-size:12px;">(${f.flight_number})</span></div>
                <div style="font-size: 11px; color: #94a3b8;">${f.departure} ➔ ${f.arrival} • ${f.duration} (${f.stop_details})</div>
              </div>
              <div class="flight-price">$${f.price_usd}</div>
            `;
            dynamicCards.appendChild(el);
          });
        }

        // If tool output contains world clock locations
        if (data.result?.tool_data?.locations) {
          data.result.tool_data.locations.forEach(loc => {
            const el = document.createElement("div");
            el.className = "time-pill";
            el.innerHTML = `
              <span>${loc.location}</span>
              <strong style="color: #38bdf8;">${loc.formattedTime}</strong>
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
        submitBtn.innerHTML = `<span>Run with Gemini Agent</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      }
    });
  }

  // Auto-run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllWidgets);
  } else {
    initAllWidgets();
  }

  // Expose global controller
  window.Mignon = {
    init: initAllWidgets,
    mount: (el, opts) => mountWidget(el, { apiUrl: DEFAULT_API_URL, ...opts })
  };
})();
