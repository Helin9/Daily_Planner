/**
 * Daybook — a small local-first daily planner.
 * All state is persisted to localStorage so the plan survives a page reload.
 * No frameworks, no build step — just DOM + localStorage.
 */
// this is an example of a comment 
const STORAGE_KEY = 'daybook-tasks';
const FOCUS_KEY = 'daybook-focus';
const START_HOUR = 6;   // 6 AM
const END_HOUR = 23;    // 11 PM

const timelineEl = document.getElementById('timeline');
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskTimeSelect = document.getElementById('taskTime');
const taskCategorySelect = document.getElementById('taskCategory');
const focusInput = document.getElementById('focusInput');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const dateValueEl = document.getElementById('dateValue');
const statTotal = document.getElementById('statTotal');
const statDone = document.getElementById('statDone');
const statPercent = document.getElementById('statPercent');

/** @typedef {{id: string, title: string, hour: number, category: string, done: boolean}} Task */

/** @returns {Task[]} */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved tasks, starting fresh.', err);
    return [];
  }
}

/** @param {Task[]} tasks */
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatHour(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

function populateTimeOptions() {
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const option = document.createElement('option');
    option.value = String(hour);
    option.textContent = formatHour(hour);
    taskTimeSelect.appendChild(option);
  }
}

function renderDate() {
  const today = new Date();
  dateValueEl.textContent = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function renderStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  statTotal.textContent = String(total);
  statDone.textContent = String(done);
  statPercent.textContent = `${percent}%`;
}

function renderTimeline(tasks) {
  timelineEl.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-day';
    empty.textContent = 'Nothing planned yet — add your first task above.';
    timelineEl.appendChild(empty);
  }

  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const hourTasks = tasks.filter((t) => t.hour === hour);
    const row = document.createElement('div');
    row.className = hourTasks.length === 0 ? 'hour-row hour-row--empty' : 'hour-row';

    const label = document.createElement('span');
    label.className = 'hour-label';
    label.textContent = formatHour(hour);

    const tasksWrap = document.createElement('div');
    tasksWrap.className = 'hour-tasks';

    hourTasks.forEach((task) => {
      tasksWrap.appendChild(buildTaskCard(task));
    });

    row.appendChild(label);
    row.appendChild(tasksWrap);
    timelineEl.appendChild(row);
  }
}

/** @param {Task} task */
function buildTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card category-${task.category}${task.done ? ' done' : ''}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.done;
  checkbox.setAttribute('aria-label', `Mark "${task.title}" as done`);
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete';
  deleteBtn.textContent = '✕';
  deleteBtn.setAttribute('aria-label', `Delete "${task.title}"`);
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  card.appendChild(checkbox);
  card.appendChild(title);
  card.appendChild(deleteBtn);
  return card;
}

function render() {
  const tasks = loadTasks();
  renderTimeline(tasks);
  renderStats(tasks);
}

function generateId() {
  // crypto.randomUUID() requires a secure context (https/localhost) and
  // silently fails when the file is opened directly via file://, so we
  // use a plain, dependency-free ID generator instead.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function addTask(title, hour, category) {
  const tasks = loadTasks();
  tasks.push({
    id: generateId(),
    title: title.trim(),
    hour,
    category,
    done: false,
  });
  saveTasks(tasks);
  render();
}

function toggleTask(id) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks(tasks);
    render();
  }
}

function deleteTask(id) {
  const tasks = loadTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
  render();
}

function clearCompleted() {
  const tasks = loadTasks().filter((t) => !t.done);
  saveTasks(tasks);
  render();
}

function restoreFocus() {
  const savedFocus = localStorage.getItem(FOCUS_KEY);
  if (savedFocus) focusInput.value = savedFocus;
}

// --- Event listeners ---

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  const hour = Number(taskTimeSelect.value);
  const category = taskCategorySelect.value;

  if (!title) return;

  addTask(title, hour, category);
  taskTitleInput.value = '';
  taskTitleInput.focus();
});

clearDoneBtn.addEventListener('click', clearCompleted);

focusInput.addEventListener('input', () => {
  localStorage.setItem(FOCUS_KEY, focusInput.value);
});

// --- Init ---

populateTimeOptions();
renderDate();
restoreFocus();
render();
