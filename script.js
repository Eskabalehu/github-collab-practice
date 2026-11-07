const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

let tasks = [];

// Display all tasks
function renderTasks() {
    taskList.innerHTML = "";

    emptyMessage.style.display =
        tasks.length === 0 ? "block" : "none";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        const taskName = document.createElement("span");
        taskName.textContent = task.name;
        taskName.classList.add("task-name");

        if (task.completed) {
            taskName.classList.add("completed");
        }

        // Mark task as complete or incomplete
        taskName.addEventListener("click", () => {
            tasks[index].completed = !tasks[index].completed;
            renderTasks();
        });

        // Delete task
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            renderTasks();
        });

        li.append(taskName, deleteButton);
        taskList.appendChild(li);
    });
}

// Add new task
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (taskName === "") {
        return;
    }

    tasks.push({
        name: taskName,
        completed: false
    });

    taskInput.value = "";
    renderTasks();
});

// Initial display
renderTasks();