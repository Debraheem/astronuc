(() => {
  function textOf(node) {
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function buildSidebarToc() {
    const sidebar = document.querySelector(".side-bar");
    const content = document.querySelector(".main-content");
    if (!sidebar || !content) return;

    const activeLink = sidebar.querySelector(".nav-list .nav-list-link.active");
    if (!activeLink) return;

    const activeItem = activeLink.closest(".nav-list-item");
    if (!activeItem) return;

    const existing = activeItem.querySelector(".sidebar-page-toc");
    if (existing) existing.remove();

    const headings = Array.from(content.querySelectorAll("h2, h3")).filter((h) => {
      if (!h.id) return false;
      if (h.classList.contains("no_toc")) return false;
      return textOf(h).length > 0;
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

    activeItem.appendChild(toc);

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
