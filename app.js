const chapters = window.BOOK_CHAPTERS || [];
const main = document.querySelector("#main");
const contents = document.querySelector("#contents");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menu-button");
const searchInput = document.querySelector("#search");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function allTopics() {
  return chapters.flatMap((chapter) => chapter.topics.map((topic) => ({ chapter, topic })));
}

function renderContents(query = "") {
  const needle = query.trim().toLowerCase();
  contents.innerHTML = chapters.map((chapter) => {
    const matches = chapter.topics.filter((topic) =>
      [chapter.title, topic.title, topic.summary, topic.takeaway].join(" ").toLowerCase().includes(needle)
    );
    if (needle && !matches.length) return "";
    return `
      <section class="toc-chapter">
        <p><span>${chapter.number}</span>${escapeHtml(chapter.title)}</p>
        ${matches.map((topic) => `<a href="#${topic.id}" data-topic="${topic.id}">${escapeHtml(topic.title)}</a>`).join("")}
      </section>`;
  }).join("") || `<p class="empty-search">No notes found.<br>Try another phrase.</p>`;
  markActiveLink();
}

function renderHome() {
  main.innerHTML = document.querySelector("#home-template").innerHTML;
  const topics = allTopics();
  document.querySelector("#chapter-count").textContent = chapters.length;
  document.querySelector("#topic-count").textContent = topics.length;
  const start = document.querySelector("#start-reading");
  start.href = topics.length ? `#${topics[0].topic.id}` : "#home";
  document.title = "Engineering Foundations";
}

function renderTopic(chapter, topic) {
  const topics = allTopics();
  const current = topics.findIndex((item) => item.topic.id === topic.id);
  const previous = topics[current - 1];
  const next = topics[current + 1];
  main.innerHTML = `
    <article class="note-page">
      <header class="note-header">
        <div class="breadcrumb"><a href="#home">Home</a><span>/</span>${escapeHtml(chapter.day)}<span>/</span>Chapter ${chapter.number}</div>
        <p class="eyebrow">${escapeHtml(chapter.subtitle)}</p>
        <h1>${escapeHtml(topic.title)}</h1>
        <p class="note-summary">${escapeHtml(topic.summary)}</p>
        <div class="source-tag">From <code>${escapeHtml(chapter.source)}</code></div>
      </header>

      <aside class="big-idea">
        <span>The big idea</span>
        <p>${escapeHtml(topic.takeaway)}</p>
      </aside>

      ${topic.sections.map((section, index) => `
        <section class="note-section">
          <div class="section-number">${String(index + 1).padStart(2, "0")}</div>
          <div>
            <h2>${escapeHtml(section.heading)}</h2>
            ${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
            ${section.code ? `<div class="code-frame"><div class="code-label">Java</div><pre><code>${escapeHtml(section.code)}</code></pre></div>` : ""}
          </div>
        </section>`).join("")}

      <section class="revision-card">
        <p class="eyebrow">Revision checklist</p>
        <h2>Ask these questions</h2>
        <ol>${topic.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      </section>

      <section class="self-check">
        <p class="eyebrow">Active recall</p>
        <h2>Check your understanding</h2>
        ${topic.questions.map((question) => `
          <details>
            <summary>${escapeHtml(question.prompt)}</summary>
            <p>${escapeHtml(question.answer)}</p>
          </details>`).join("")}
      </section>

      <nav class="page-nav" aria-label="Previous and next topic">
        ${previous ? `<a href="#${previous.topic.id}"><span>← Previous</span>${escapeHtml(previous.topic.title)}</a>` : `<a href="#home"><span>← Back</span>Book cover</a>`}
        ${next ? `<a class="next" href="#${next.topic.id}"><span>Next →</span>${escapeHtml(next.topic.title)}</a>` : `<div class="end-mark"><span>End of notes—for now.</span>More questions become more chapters.</div>`}
      </nav>
    </article>`;
  document.title = `${topic.title} · Engineering Foundations`;
}

function route() {
  const id = location.hash.slice(1) || "home";
  const match = allTopics().find(({ topic }) => topic.id === id);
  if (id === "home" || !match) renderHome();
  else renderTopic(match.chapter, match.topic);
  markActiveLink();
  sidebar.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

function markActiveLink() {
  const id = location.hash.slice(1);
  document.querySelectorAll("[data-topic]").forEach((link) => link.classList.toggle("active", link.dataset.topic === id));
}

menuButton.addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

document.querySelector("#theme-button").addEventListener("click", () => {
  const dark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("book-theme", dark ? "dark" : "light");
});

searchInput.addEventListener("input", (event) => renderContents(event.target.value));
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
});

if (localStorage.getItem("book-theme") === "dark") document.documentElement.classList.add("dark");
renderContents();
window.addEventListener("hashchange", route);
route();
