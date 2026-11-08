// Select DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const priorityInput = document.getElementById('priority-input');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskStats = document.getElementById('task-stats');
const clearCompletedBtn = document.getElementById('clear-completed');

// State Variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all'; // 'all', 'active', 'completed'
let searchQuery = '';

// Initialize App
function init() {
    renderTasks();
}

// Save to LocalStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// Handle Form Submit (Add Task)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now().toString(),
        text: text,
        date: dateInput.value,
        priority: priorityInput.value,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    dateInput.value = '';
    priorityInput.value = 'medium';
    saveTasks();
});

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}

// Toggle Complete
function toggleComplete(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
}

// Edit Task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newText = prompt("Edit your task:", task.text);
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
    }
}

// Search Feature
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTasks();
});

// Filter Feature
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Clear Completed
clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
});

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    // Apply filters & search
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery);
        const matchesFilter = currentFilter === 'all' ? true 
                            : currentFilter === 'active' ? !task.completed 
                            : task.completed;
        return matchesSearch && matchesFilter;
    });

    // Update Stats (Ito yung naputol na part)
    const activeTasksCount = tasks.filter(t => !t.completed).length;
    taskStats.textContent = `${activeTasksCount} task${activeTasksCount !== 1 ? 's' : ''} left`;

    // Show empty message if needed
    if (filteredTasks.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
    }

    // Create DOM for each task
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        // Date Badge Formatting
        let dateHtml = '';
        if (task.date) {
            dateHtml = `<span class="badge due-badge">📅 ${task.date}</span>`;
        }

        li.innerHTML = `
            <div class="task-info">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete('${task.id}')">
                <div>
                    <div class="task-name" onclick="toggleComplete('${task.id}')">${task.text}</div>
                    <div class="badges">
                        <span class="badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
                        ${dateHtml}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask('${task.id}')">✎</button>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">✖</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Run on load
init();