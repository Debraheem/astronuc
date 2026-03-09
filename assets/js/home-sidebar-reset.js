(() => {
  function normalizePath(path) {
    const normalized = (path || "/")
      .replace(/index\.html$/, "")
      .replace(/\/+$/, "");
    return normalized || "/";
  }

  function getHomePath() {
    const siteTitleLink = document.querySelector(".site-title[href]");
    if (!siteTitleLink) return "/";
    try {
      return new URL(siteTitleLink.getAttribute("href"), window.location.origin).pathname;
    } catch (_err) {
      return "/";
    }
  }

  function collapseSidebar(sidebar) {
    const expanders = Array.from(sidebar.querySelectorAll("button.nav-list-expander"));
    expanders.forEach((button) => {
      const isExpanded =
        button.getAttribute("aria-expanded") === "true" || button.classList.contains("active");
      if (isExpanded) button.click();
    });

    // Fallback: if the theme re-opens groups automatically, force closed state.
    expanders.forEach((button) => {
      if (button.getAttribute("aria-expanded") !== "true") return;
      button.setAttribute("aria-expanded", "false");
      button.classList.remove("active");

      const item = button.closest(".nav-list-item");
      if (!item) return;
      item.classList.remove("active", "nav-list-item-active");

      const subList = Array.from(item.children).find(
        (child) => child.classList && child.classList.contains("nav-list")
      );
      if (!subList) return;
      subList.hidden = true;
      subList.style.display = "none";
    });
  }

  function resetHomeSidebarState() {
    const currentPath = normalizePath(window.location.pathname);
    const homePath = normalizePath(getHomePath());
    if (currentPath !== homePath) return;

    const sidebar = document.querySelector(".side-bar");
    if (!sidebar) return;
    collapseSidebar(sidebar);
  }

  function onReady() {
    resetHomeSidebarState();
    window.setTimeout(resetHomeSidebarState, 0);
    window.setTimeout(resetHomeSidebarState, 80);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  window.addEventListener("load", resetHomeSidebarState);
  window.addEventListener("pageshow", resetHomeSidebarState);
})();
