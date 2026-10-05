const API_URL = "/api/tasks";

let allTasks = [];

document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    loadTasks();

    document
        .getElementById("taskForm")
        .addEventListener("submit", saveTask);
});

function setCurrentDate() {
    const date = new Date();

    const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    };

    document.getElementById("currentDate").textContent =
        date.toLocaleDateString("en-US", options);
}

async function loadTasks() {
    const container = document.getElementById("taskContainer");

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        allTasks = data.tasks;

        updateStatistics();
        renderTasks(allTasks);

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Unable to load tasks.</p>
                <small>
                    Make sure the server and MongoDB are running.
                </small>
            </div>
        `;
    }
}

function updateStatistics() {
    const total = allTasks.length;

    const todo = allTasks.filter(
        task => task.status === "To Do"
    ).length;

    const progress = allTasks.filter(
        task => task.status === "In Progress"
    ).length;

    const completed = allTasks.filter(
        task => task.status === "Completed"
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("todoTasks").textContent = todo;
    document.getElementById("progressTasks").textContent = progress;
    document.getElementById("completedTasks").textContent = completed;
}

function renderTasks(tasks) {
    const container = document.getElementById("taskContainer");

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clipboard-list"></i>
                <p>No tasks found.</p>
                <small>
                    Create your first task to get started.
                </small>
            </div>
        `;

        return;
    }

    container.innerHTML = tasks
        .map(task => createTaskCard(task))
        .join("");
}

function createTaskCard(task) {

    const priorityClass =
        task.priority.toLowerCase();

    let statusClass = "status-todo";

    if (task.status === "In Progress") {
        statusClass = "status-progress";
    }

    if (task.status === "Completed") {
        statusClass = "status-completed";
    }

    const dueDate = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        )
        : "No deadline";

    return `
        <div class="task-card">

            <div class="task-top">

                <div>
                    <h3 class="task-title">
                        ${escapeHTML(task.title)}
                    </h3>
                </div>

                <span class="badge priority-${priorityClass}">
                    ${task.priority}
                </span>

            </div>

            <p class="task-description">
                ${escapeHTML(
                    task.description ||
                    "No description provided."
                )}
            </p>

            <div style="margin-bottom: 14px;">

                <span class="status-badge ${statusClass}">
                    ${task.status}
                </span>

            </div>

            <div class="task-footer">

                <span class="due-date">

                    <i class="fa-regular fa-calendar"></i>

                    ${dueDate}

                </span>

                <div class="task-actions">

                    <button
                        class="action-btn"
                        onclick="editTask('${task.id}')"
                        title="Edit">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteTask('${task.id}')"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>

        </div>
    `;
}

function openModal() {

    document
        .getElementById("taskModal")
        .classList.add("show");

    document.getElementById("modalTitle").textContent =
        "Create New Task";

    document.getElementById("submitText").textContent =
        "Create Task";

    document.getElementById("taskForm").reset();

    document.getElementById("taskId").value = "";
}

function closeModal() {

    document
        .getElementById("taskModal")
        .classList.remove("show");
}

async function saveTask(event) {

    event.preventDefault();

    const id =
        document.getElementById("taskId").value;

    const taskData = {

        title:
            document.getElementById("title").value,

        description:
            document.getElementById("description").value,

        priority:
            document.getElementById("priority").value,

        status:
            document.getElementById("status").value,

        dueDate:
            document.getElementById("dueDate").value || null
    };

    try {

        let response;

        if (id) {

            response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(taskData)
                }
            );

        } else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(taskData)
                }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        closeModal();

        showToast(data.message);

        loadTasks();

    } catch (error) {

        alert(error.message);
    }
}

async function editTask(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`);

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        const task = data.task;

        document.getElementById("taskId").value =
            task._id;

        document.getElementById("title").value =
            task.title;

        document.getElementById("description").value =
            task.description || "";

        document.getElementById("priority").value =
            task.priority;

        document.getElementById("status").value =
            task.status;

        if (task.dueDate) {

            document.getElementById("dueDate").value =
                new Date(task.dueDate)
                    .toISOString()
                    .split("T")[0];
        }

        document.getElementById("modalTitle").textContent =
            "Edit Task";

        document.getElementById("submitText").textContent =
            "Update Task";

        document
            .getElementById("taskModal")
            .classList.add("show");

    } catch (error) {

        alert(error.message);
    }
}

async function deleteTask(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        showToast(data.message);

        loadTasks();

    } catch (error) {

        alert(error.message);
    }
}

function filterTasks() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const status =
        document
            .getElementById("statusFilter")
            .value;

    const filtered =
        allTasks.filter(task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search) ||

                (task.description || "")
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                status === "All" ||
                task.status === status;

            return matchesSearch && matchesStatus;
        });

    renderTasks(filtered);
}

function showToast(message) {

    const toast =
        document.getElementById("toast");

    document.getElementById("toastMessage")
        .textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

document
    .getElementById("taskModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {
            closeModal();
        }

    });