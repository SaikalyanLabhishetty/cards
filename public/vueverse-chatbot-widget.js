(function () {
  var ROOT_ID = "vueverse-chatbot-widget-root";
  var CLOSE_EVENT = "vueverse-chatbot:close-request";
  var GLOBAL_FLAG = "__vueverseChatbotWidgetLoaded";
  var STYLE_ID = "vueverse-chatbot-widget-style";

  if (window[GLOBAL_FLAG]) {
    return;
  }
  window[GLOBAL_FLAG] = true;

  var script = document.currentScript;
  var dataset = script && script.dataset ? script.dataset : {};

  var requestedBaseUrl = dataset.baseUrl || "";
  var requestedPosition = dataset.position || "";
  var requestedTitle = dataset.title || "";
  var requestedOpen = dataset.open || "";

  var title = requestedTitle || "Ask Vueverse AI";
  var openOnLoad = requestedOpen === "true";

  var scriptOrigin = "";
  try {
    scriptOrigin =
      script && script.src ? new URL(script.src, window.location.href).origin : "";
  } catch {
    scriptOrigin = "";
  }

  var baseInput = requestedBaseUrl || scriptOrigin;
  if (!baseInput) {
    return;
  }

  var baseUrl = "";
  var allowedOrigin = "";
  try {
    var parsedBase = new URL(baseInput, window.location.href);
    baseUrl = (parsedBase.origin + parsedBase.pathname).replace(/\/+$/, "");
    allowedOrigin = parsedBase.origin;
  } catch {
    return;
  }

  if (document.getElementById(ROOT_ID)) {
    return;
  }

  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "@keyframes vueverseChatbotDotBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.8)}}";
    document.head.appendChild(style);
  }

  var position = requestedPosition === "left" ? "left" : "right";
  var embedUrl = baseUrl + "/vueverse-bot/embed";

  var root = document.createElement("div");
  root.id = ROOT_ID;
  root.style.position = "fixed";
  root.style.bottom = "16px";
  root.style.zIndex = "2147483000";
  root.style.display = "flex";
  root.style.flexDirection = "column";
  root.style.gap = "10px";
  root.style.maxWidth = "min(92vw, 380px)";
  root.style[position] = "16px";
  root.style.fontFamily =
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  root.style.alignItems = position === "left" ? "flex-start" : "flex-end";

  var panel = document.createElement("div");
  panel.style.display = "none";
  panel.style.width = "min(92vw, 380px)";
  panel.style.height = "min(78vh, 620px)";
  panel.style.border = "1px solid rgba(57, 155, 112, 0.35)";
  panel.style.borderRadius = "16px";
  panel.style.overflow = "hidden";
  panel.style.background = "#FFFFFF";
  panel.style.boxShadow = "0 20px 60px rgba(57, 155, 112, 0.25)";

  var frame = document.createElement("iframe");
  frame.src = embedUrl;
  frame.title = "Vueverse assistant";
  frame.style.width = "100%";
  frame.style.height = "100%";
  frame.style.border = "0";
  frame.setAttribute("loading", "lazy");
  frame.setAttribute("allow", "clipboard-write");

  var launcher = document.createElement("button");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.style.display = "inline-flex";
  launcher.style.alignItems = "center";
  launcher.style.gap = "8px";
  launcher.style.border = "1px solid rgba(47, 129, 93, 0.85)";
  launcher.style.background = "linear-gradient(135deg, #399B70 0%, #2f815d 100%)";
  launcher.style.color = "#FFFFFF";
  launcher.style.padding = "10px 14px";
  launcher.style.borderRadius = "9999px";
  launcher.style.fontSize = "14px";
  launcher.style.fontWeight = "700";
  launcher.style.cursor = "pointer";
  launcher.style.boxShadow = "0 12px 26px rgba(57, 155, 112, 0.35)";

  var dot = document.createElement("span");
  dot.style.width = "8px";
  dot.style.height = "8px";
  dot.style.borderRadius = "9999px";
  dot.style.background = "#FFFFFF";
  dot.style.flexShrink = "0";
  dot.style.animation = "vueverseChatbotDotBlink 1.1s ease-in-out infinite";

  var launcherLabel = document.createElement("span");
  launcherLabel.textContent = title;

  launcher.appendChild(dot);
  launcher.appendChild(launcherLabel);

  panel.appendChild(frame);
  root.appendChild(panel);
  root.appendChild(launcher);
  document.body.appendChild(root);

  var isOpen = false;

  function syncLauncher() {
    launcherLabel.textContent = isOpen ? "Close chat" : title;
    launcher.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function openWidget() {
    isOpen = true;
    panel.style.display = "block";
    syncLauncher();
  }

  function closeWidget() {
    isOpen = false;
    panel.style.display = "none";
    syncLauncher();
  }

  function toggleWidget() {
    if (isOpen) {
      closeWidget();
      return;
    }
    openWidget();
  }

  launcher.addEventListener("click", toggleWidget);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen) {
      closeWidget();
    }
  });

  window.addEventListener("message", function (event) {
    if (event.origin !== allowedOrigin) {
      return;
    }

    var data = event.data;
    if (!data || typeof data !== "object") {
      return;
    }

    if (data.type === CLOSE_EVENT) {
      closeWidget();
    }
  });

  syncLauncher();

  if (openOnLoad) {
    openWidget();
  }
})();
