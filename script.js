
// ==========================================
// 1. SELECT HTML ELEMENTS
// ==========================================

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

// Dashboard elements
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const progressCount = document.getElementById('progress-count');
const todoCount = document.getElementById('todo-count');
const completionRate = document.getElementById('completion-rate');

const weeklyChart = document.getElementById('weekly-chart');
const priorityChart = document.getElementById('priority-chart');

const upcomingList = document.getElementById('upcoming-list');
const overdueList = document.getElementById('overdue-list');


// ==========================================
// 2. TASK DATA AND VARIABLES
// ==========================================

// Load previously saved tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Convert old tasks to the new status format.
// This keeps your previously saved tasks.
tasks = tasks.map(task => {
    const status = task.completed
        ? 'completed'
        : (task.status || 'todo');

    return {
        ...task,
        status: status,
        completed: status === 'completed',
        createdAt: task.createdAt || null,
        completedAt: task.completedAt || null
    };
});

let currentFilter = 'all';
let searchQuery = '';


// ==========================================
// 3. DATE FUNCTIONS
// ==========================================

function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    if (!dateString) return 'No due date';

    const [year, month, day] = dateString.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
    );
}

function isOverdue(task) {
    return task.date &&
           task.status !== 'completed' &&
           task.date < getLocalDate();
}


// ==========================================
// 4. SAVE TASKS
// ==========================================

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderTasks();
    updateDashboard();
}


// ==========================================
// 5. ADD TASK
// ==========================================

taskForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    const newTask = {
        id: Date.now().toString(),
        text: text,
        date: dateInput.value,
        priority: priorityInput.value,
        status: 'todo',
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.push(newTask);

    taskInput.value = '';
    dateInput.value = '';
    priorityInput.value = 'medium';

    saveTasks();
});


// ==========================================
// 6. DELETE TASK
// ==========================================

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}


// ==========================================
// 7. UPDATE TASK STATUS
// ==========================================

function updateTaskStatus(id, status) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                status: status,
                completed: status === 'completed',

                completedAt: status === 'completed'
                    ? (task.completedAt || new Date().toISOString())
                    : null
            };
        }

        return task;
    });

    saveTasks();
}


// ==========================================
// 8. TOGGLE COMPLETE
// ==========================================

function toggleComplete(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    const newStatus = task.status === 'completed'
        ? 'todo'
        : 'completed';

    updateTaskStatus(id, newStatus);
}


// ==========================================
// 9. EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    const newText = prompt('Edit your task:', task.text);

    if (newText !== null && newText.trim() !== '') {

        task.text = newText.trim();

        saveTasks();
    }
}


// ==========================================
// 10. SEARCH TASKS
// ==========================================

searchInput.addEventListener('input', function(e) {

    searchQuery = e.target.value.toLowerCase();

    renderTasks();
});


// ==========================================
// 11. FILTER TASKS
// ==========================================

filterBtns.forEach(btn => {

    btn.addEventListener('click', function() {

        filterBtns.forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        currentFilter = btn.dataset.filter;

        renderTasks();
    });
});


// ==========================================
// 12. CLEAR COMPLETED TASKS
// ==========================================

clearCompletedBtn.addEventListener('click', function() {

    const completedTasks = tasks.filter(
        task => task.status === 'completed'
    );

    if (completedTasks.length === 0) return;

    if (confirm('Are you sure you want to clear completed tasks?')) {

        tasks = tasks.filter(
            task => task.status !== 'completed'
        );

        saveTasks();
    }
});


// ==========================================
// 13. RENDER TASKS
// ==========================================

function renderTasks() {

    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {

        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchQuery);

        const matchesFilter =
            currentFilter === 'all' ? true :
            currentFilter === 'active' ? task.status !== 'completed' :
            task.status === 'completed';

        return matchesSearch && matchesFilter;
    });

    const activeCount = tasks.filter(
        task => task.status !== 'completed'
    ).length;

    taskStats.textContent =
        `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;

    emptyMessage.style.display =
        filteredTasks.length === 0 ? 'block' : 'none';


    filteredTasks.forEach(task => {

        const li = document.createElement('li');

        if (task.status === 'completed') {
            li.classList.add('completed');
        }

        const info = document.createElement('div');
        info.className = 'task-info';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.status === 'completed';

        checkbox.addEventListener('change', () => {
            toggleComplete(task.id);
        });

        const details = document.createElement('div');

        const name = document.createElement('div');
        name.className = 'task-name';
        name.textContent = task.text;

        name.addEventListener('click', () => {
            toggleComplete(task.id);
        });

        const badges = document.createElement('div');
        badges.className = 'badges';

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `badge priority-${task.priority}`;
        priorityBadge.textContent = task.priority.toUpperCase();

        badges.appendChild(priorityBadge);

        if (task.date) {

            const dateBadge = document.createElement('span');

            dateBadge.className = 'badge due-badge';

            if (isOverdue(task)) {
                dateBadge.classList.add('overdue-badge');
            }

            dateBadge.textContent = `📅 ${formatDate(task.date)}`;

            badges.appendChild(dateBadge);
        }

        details.append(name, badges);
        info.append(checkbox, details);


        // Task action buttons
        const actions = document.createElement('div');
        actions.className = 'task-actions';

        // Status dropdown
        const statusSelect = document.createElement('select');
        statusSelect.className = 'status-select';

        const statusOptions = [
            { value: 'todo', label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
        ];

        statusOptions.forEach(item => {

            const option = document.createElement('option');

            option.value = item.value;
            option.textContent = item.label;

            statusSelect.appendChild(option);
        });

        statusSelect.value = task.status;

        statusSelect.addEventListener('change', () => {
            updateTaskStatus(task.id, statusSelect.value);
        });


        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.type = 'button';
        editBtn.textContent = '✎';

        editBtn.addEventListener('click', () => {
            editTask(task.id);
        });


        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.textContent = '✖';

        deleteBtn.addEventListener('click', () => {

            if (confirm('Delete this task?')) {
                deleteTask(task.id);
            }
        });

        actions.append(statusSelect, editBtn, deleteBtn);

        li.append(info, actions);

        taskList.appendChild(li);
    });
}


// ==========================================
// 14. UPDATE DASHBOARD STATISTICS
// ==========================================

function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === 'completed'
    ).length;

    const inProgress = tasks.filter(
        task => task.status === 'in-progress'
    ).length;

    const todo = tasks.filter(
        task => task.status === 'todo'
    ).length;

    const rate = total === 0
        ? 0
        : Math.round((completed / total) * 100);


    totalCount.textContent = total;
    completedCount.textContent = completed;
    progressCount.textContent = inProgress;
    todoCount.textContent = todo;

    completionRate.textContent = `${rate}% completion rate`;


    updateWeeklyChart();
    updatePriorityChart();
    updateDeadlineLists();
}


// ==========================================
// 15. 7-DAY PROGRESS CHART
// ==========================================

function updateWeeklyChart() {

    weeklyChart.innerHTML = '';

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);

        const key = getLocalDate(date);

        const label = date.toLocaleDateString(
            'en-US',
            { weekday: 'short' }
        );

        const completed = tasks.filter(task => {

            return task.completedAt &&
                getLocalDate(new Date(task.completedAt)) === key;

        }).length;

        days.push({
            label,
            completed
        });
    }

    const maxValue = Math.max(
        1,
        ...days.map(day => day.completed)
    );

    days.forEach(day => {

        const column = document.createElement('div');
        column.className = 'chart-column';

        const value = document.createElement('span');
        value.className = 'chart-value';
        value.textContent = day.completed;

        const track = document.createElement('div');
        track.className = 'bar-track';

        const bar = document.createElement('div');
        bar.className = 'bar-completed';

        bar.style.height =
            `${(day.completed / maxValue) * 100}%`;

        track.appendChild(bar);

        const label = document.createElement('span');
        label.className = 'chart-day';
        label.textContent = day.label;

        column.append(value, track, label);

        weeklyChart.appendChild(column);
    });
}


// ==========================================
// 16. PRIORITY DISTRIBUTION
// ==========================================

function updatePriorityChart() {

    const high = tasks.filter(
        task => task.priority === 'high'
    ).length;

    const medium = tasks.filter(
        task => task.priority === 'medium'
    ).length;

    const low = tasks.filter(
        task => task.priority === 'low'
    ).length;

    const total = tasks.length;

    const highPercent = total ? (high / total) * 100 : 0;
    const mediumPercent = total ? (medium / total) * 100 : 0;
    const lowPercent = total ? (low / total) * 100 : 0;

    const mediumEnd = highPercent + mediumPercent;

    priorityChart.style.background = total === 0
        ? '#334155'
        : `conic-gradient(
            #ef6464 0% ${highPercent}%,
            #e9b44c ${highPercent}% ${mediumEnd}%,
            #34d399 ${mediumEnd}% 100%
        )`;

    document.getElementById('priority-total').textContent = total;

    document.getElementById('high-count').textContent = high;
    document.getElementById('medium-count').textContent = medium;
    document.getElementById('low-count').textContent = low;
}


// ==========================================
// 17. UPCOMING AND OVERDUE TASKS
// ==========================================

function displayDeadlineTasks(listElement, taskArray, emptyText) {

    listElement.innerHTML = '';

    if (taskArray.length === 0) {

        const message = document.createElement('p');

        message.className = 'empty-dashboard';
        message.textContent = emptyText;

        listElement.appendChild(message);

        return;
    }

    taskArray.forEach(task => {

        const item = document.createElement('div');
        item.className = 'deadline-item';

        const name = document.createElement('span');
        name.className = 'deadline-name';
        name.textContent = task.text;

        const date = document.createElement('span');
        date.className = 'deadline-date';
        date.textContent = formatDate(task.date);

        item.append(name, date);

        listElement.appendChild(item);
    });
}


function updateDeadlineLists() {

    const today = getLocalDate();

    const upcoming = tasks
        .filter(task =>
            task.date &&
            task.status !== 'completed' &&
            task.date >= today
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    const overdue = tasks
        .filter(task => isOverdue(task))
        .sort((a, b) => a.date.localeCompare(b.date));

    displayDeadlineTasks(
        upcomingList,
        upcoming,
        'No upcoming deadlines.'
    );

    displayDeadlineTasks(
        overdueList,
        overdue,
        'No overdue tasks. Great job!'
    );

    document.getElementById('overdue-count').textContent =
        overdue.length;
}


// ==========================================
// 18. INITIALIZE APP
// ==========================================

function init() {

    // Save converted old records into the same Local Storage.
    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderTasks();
    updateDashboard();
}

init();
