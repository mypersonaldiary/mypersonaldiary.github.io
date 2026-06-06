// interface.js
const DIARY_NAME = "My Personal Diary";
const AUTHOR = "Oskars Zihmanis";

let entries = [];
let editingId = null;
// CHANGED: Storage key updated to MyPersonalDiary_entries
const STORAGE_KEY = 'MyPersonalDiary_entries';

let entriesContainer, formContainer, titleInput, contentInput, submitBtn, cancelBtn;

// Helper functions
function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadEntries() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        entries = parsed;
        return;
      }
    } catch(e) {}
  }
  const today = new Date().toISOString().slice(0,10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  entries = [
    { id: Date.now() + 1, date: yesterday, title: "First pages 📖", content: "Today I started my digital diary. The ink never smudges." },
    { id: Date.now() + 2, date: today, title: "Quiet thoughts 🌙", content: "Writing feels like talking to an old friend." }
  ];
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderEntries() {
  if (!entriesContainer) return;
  if (entries.length === 0) {
    entriesContainer.innerHTML = `<div class="empty-state">✨ No diary entries yet. Write your first memory. ✨</div>`;
    return;
  }
  let html = '';
  [...entries].sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
    html += `
      <div class="entry-card" data-id="${entry.id}">
        <div class="entry-header">
          <div><h3>${escapeHtml(entry.title)}</h3><span class="entry-date">📅 ${formatDate(entry.date)}</span></div>
          <div class="entry-actions">
            <button class="edit-entry" data-id="${entry.id}">✏️</button>
            <button class="delete-entry" data-id="${entry.id}">🗑️</button>
          </div>
        </div>
        <div class="entry-content">${escapeHtml(entry.content).replace(/\n/g, '<br>')}</div>
      </div>
    `;
  });
  entriesContainer.innerHTML = html;
}

function resetForm() {
  if (titleInput) titleInput.value = '';
  if (contentInput) contentInput.value = '';
  editingId = null;
  if (submitBtn) submitBtn.textContent = '📝 Add Entry';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function startEdit(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  editingId = id;
  titleInput.value = entry.title;
  contentInput.value = entry.content;
  submitBtn.textContent = '💾 Save Changes';
  cancelBtn.style.display = 'inline-block';
  formContainer.scrollIntoView({ behavior: 'smooth' });
}

function deleteEntry(id) {
  if (confirm('Delete this diary entry forever?')) {
    entries = entries.filter(e => e.id !== id);
    saveEntries();
    renderEntries();
    if (editingId === id) resetForm();
  }
}

function saveOrUpdate() {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title || !content) {
    alert('Please add a title and some content.');
    return;
  }
  const today = new Date().toISOString().slice(0,10);
  if (editingId !== null) {
    const index = entries.findIndex(e => e.id === editingId);
    if (index !== -1) {
      entries[index].title = title;
      entries[index].content = content;
      saveEntries();
      renderEntries();
      resetForm();
    }
  } else {
    entries.unshift({ id: Date.now(), date: today, title, content });
    saveEntries();
    renderEntries();
    resetForm();
  }
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f3efe7; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; padding: 2rem 1rem; line-height: 1.5; }
    .diary-container { max-width: 900px; margin: 0 auto; background: #fffef9; border-radius: 2rem; box-shadow: 0 20px 35px -12px rgba(0,0,0,0.1); padding: 2rem; }
    .diary-header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #f0e3d0; padding-bottom: 1rem; }
    .diary-header h1 { font-size: 2rem; font-weight: 600; color: #5c3e2b; }
    .credit { color: #b28b6f; font-size: 0.85rem; margin-top: 0.3rem; }
    .entry-form { background: #fefaf5; border-radius: 1.5rem; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #f2e5d8; }
    .entry-form h2 { font-size: 1.3rem; margin-bottom: 1rem; color: #6e4f36; }
    #entryTitle, #entryContent { width: 100%; padding: 0.8rem 1rem; margin-bottom: 1rem; border: 1px solid #e2d4c6; border-radius: 1rem; font-family: inherit; font-size: 1rem; background: white; }
    #entryTitle:focus, #entryContent:focus { outline: none; border-color: #c2a07e; box-shadow: 0 0 0 2px rgba(194,160,126,0.2); }
    .form-buttons { display: flex; gap: 0.8rem; }
    .form-buttons button { background: #d9c2a8; border: none; padding: 0.6rem 1.4rem; border-radius: 2rem; font-weight: 600; cursor: pointer; font-family: inherit; color: #3e2a1c; }
    .form-buttons button:hover { background: #c6ab8c; transform: scale(0.97); }
    #cancelEditBtn { background: #e7dccc; color: #6b4f36; display: none; }
    .entries-section h2 { font-size: 1.3rem; margin-bottom: 1rem; color: #6e4f36; }
    .entries-list { display: flex; flex-direction: column; gap: 1.2rem; max-height: 550px; overflow-y: auto; padding-right: 0.3rem; }
    .entry-card { background: white; border-radius: 1.2rem; padding: 1.2rem; border: 1px solid #efe0d2; }
    .entry-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; margin-bottom: 0.7rem; }
    .entry-header h3 { font-size: 1.2rem; font-weight: 600; color: #4f3522; }
    .entry-date { font-size: 0.75rem; color: #ad8f72; background: #fcf6ef; padding: 0.2rem 0.6rem; border-radius: 2rem; }
    .entry-actions { display: flex; gap: 0.6rem; }
    .entry-actions button { background: none; border: none; font-size: 1.1rem; cursor: pointer; opacity: 0.6; }
    .entry-actions button:hover { opacity: 1; }
    .entry-content { color: #4a3b2e; line-height: 1.5; white-space: pre-wrap; }
    .empty-state { text-align: center; padding: 2rem; background: #fefaf5; border-radius: 1.5rem; color: #b28b6f; }
    .diary-footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #c7aa8c; border-top: 1px solid #f0e3d0; padding-top: 1.2rem; }
    @media (max-width: 600px) { .diary-container { padding: 1.2rem; } .entry-header { flex-direction: column; gap: 0.5rem; } }
  `;
  document.head.appendChild(style);
}

function buildUI() {
  const root = document.getElementById('diary-root');
  if (!root) return;
  root.innerHTML = `
    <div class="diary-container">
      <header class="diary-header">
        <h1>📔 ${DIARY_NAME}</h1>
        <p class="credit">by ${AUTHOR}</p>
      </header>
      <div class="entry-form" id="entryForm">
        <h2>✍️ New memory</h2>
        <input type="text" id="entryTitle" placeholder="Title...">
        <textarea id="entryContent" rows="4" placeholder="Write your thoughts..."></textarea>
        <div class="form-buttons">
          <button id="submitEntryBtn">📝 Add Entry</button>
          <button id="cancelEditBtn">Cancel</button>
        </div>
      </div>
      <div class="entries-section">
        <h2>📖 Your diary</h2>
        <div id="entriesList" class="entries-list"></div>
      </div>
      <footer class="diary-footer">
        2026 OskarsZihmanis all rights reserved, My Personal Diary Is a digital product made by Oskars Zihmanis and is licensed under <a href="https://github.io">My Personal Diary</a> © 2026 by <a href="https://github.io">Oskars Zihmanis</a> is licensed under <a href="https://creativecommons.org">CC BY-NC-ND 4.0</a>
      </footer>
    </div>
  `;
}

function ui(message) {
  injectStyles();
  buildUI();

  formContainer = document.getElementById('entryForm');
  entriesContainer = document.getElementById('entriesList');
  titleInput = document.getElementById('entryTitle');
  contentInput = document.getElementById('entryContent');
  submitBtn = document.getElementById('submitEntryBtn');
  cancelBtn = document.getElementById('cancelEditBtn');

  loadEntries();
  renderEntries();

  if (submitBtn) submitBtn.addEventListener('click', saveOrUpdate);
  if (cancelBtn) cancelBtn.addEventListener('click', resetForm);

  if (entriesContainer) {
    entriesContainer.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-entry');
      const deleteBtn = e.target.closest('.delete-entry');
      
      if (editBtn) {
        const id = parseInt(editBtn.getAttribute('data-id'), 10);
        startEdit(id);
      } else if (deleteBtn) {
        const id = parseInt(deleteBtn.getAttribute('data-id'), 10);
        deleteEntry(id);
      }
    });
  }

  return `UI successfully initialized. Message received: "${message}"`;
}

module.exports = { ui };
