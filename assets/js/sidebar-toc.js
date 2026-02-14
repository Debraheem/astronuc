(() => {
  function textOf(node) {
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[`~!@#$%^&*()+=[\]{}|\\;:'",.<>/?]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function samePath(a, b) {
    const norm = (s) => s.replace(/\/+$/, "") || "/";
    return norm(a) === norm(b);
  }

  function buildSidebarToc() {
    const sidebar = document.querySelector(".side-bar");
    const content = document.querySelector(".main-content");
    if (!sidebar || !content) return;

    const currentPath = window.location.pathname;
    const navLinks = Array.from(sidebar.querySelectorAll(".nav-list a.nav-list-link[href]"));
    const activeLink =
      navLinks.find((a) => {
        try {
          const u = new URL(a.getAttribute("href"), window.location.origin);
          return samePath(u.pathname, currentPath);
        } catch (_err) {
          return false;
        }
      }) || sidebar.querySelector(".nav-list .nav-list-link.active");
    if (!activeLink) return;

    const activeItem = activeLink.closest(".nav-list-item");
    if (!activeItem) return;

    const existing = sidebar.querySelectorAll(".sidebar-page-toc");
    existing.forEach((node) => node.remove());

    const seenIds = new Set();
    const headings = Array.from(content.querySelectorAll("h2, h3")).filter((h) => {
      if (h.classList.contains("no_toc")) return false;
      const txt = textOf(h);
      if (!txt) return false;
      if (!h.id) {
        let base = slugify(txt) || "section";
        let id = base;
        let i = 2;
        while (seenIds.has(id) || document.getElementById(id)) {
          id = `${base}-${i}`;
          i += 1;
        }
        h.id = id;
      }
      seenIds.add(h.id);
      return true;
    });
    if (!headings.length) return;

    const toc = document.createElement("ul");
    toc.className = "nav-list sidebar-page-toc";

    let h2Count = 0;
    let h3Count = 0;

    headings.forEach((h) => {
      const li = document.createElement("li");
      li.className = "nav-list-item sidebar-page-toc-item";
      const level = h.tagName.toLowerCase();
      if (level === "h3") li.classList.add("sidebar-page-toc-item-h3");

      let prefix = "";
      if (level === "h2") {
        h2Count += 1;
        h3Count = 0;
        prefix = `${h2Count}.`;
      } else if (level === "h3") {
        if (h2Count === 0) h2Count = 1;
        h3Count += 1;
        prefix = `${h2Count}.${h3Count}`;
      }

      const a = document.createElement("a");
      a.className = "nav-list-link";
      a.href = `#${h.id}`;
      a.textContent = `${prefix} ${textOf(h)}`.trim();

      li.appendChild(a);
      toc.appendChild(li);
    });

    const anchorPoint =
      activeLink.nextElementSibling && activeLink.nextElementSibling.classList.contains("nav-list-expander")
        ? activeLink.nextElementSibling
        : activeLink;
    anchorPoint.insertAdjacentElement("afterend", toc);

    const tocLinks = Array.from(toc.querySelectorAll("a.nav-list-link"));
    const linkById = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));

    function setActive(id) {
      tocLinks.forEach((a) => a.classList.toggle("active", decodeURIComponent(a.hash.slice(1)) === id));
    }

    function syncActive() {
      const y = window.scrollY + 140;
      let currentId = headings[0].id;

      for (const h of headings) {
        if (h.offsetTop <= y) currentId = h.id;
        else break;
      }

      if (linkById.has(currentId)) setActive(currentId);
    }

    window.addEventListener("scroll", syncActive, { passive: true });
    syncActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildSidebarToc);
  } else {
    buildSidebarToc();
  }
})();
