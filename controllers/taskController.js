const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../tasks.json");

function readTasks() {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

function saveTasks(tasks) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(tasks, null, 2)
    );
}

// GET ALL TASKS
const getTasks = (req, res) => {
    try {
        const tasks = readTasks();

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};

// GET SINGLE TASK
const getTask = (req, res) => {
    try {
        const tasks = readTasks();

        const task = tasks.find(
            task => task.id === req.params.id
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch task",
            error: error.message
        });
    }
};

// CREATE TASK
const createTask = (req, res) => {
    try {
        const tasks = readTasks();

        const {
            title,
            description,
            priority,
            status,
            dueDate
        } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        const newTask = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description || "",
            priority: priority || "Medium",
            status: status || "To Do",
            dueDate: dueDate || null,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);

        saveTasks(tasks);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: newTask
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message
        });
    }
};

// UPDATE TASK
const updateTask = (req, res) => {
    try {
        const tasks = readTasks();

        const index = tasks.findIndex(
            task => task.id === req.params.id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        tasks[index] = {
            ...tasks[index],
            ...req.body,
            id: tasks[index].id
        };

        saveTasks(tasks);

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: tasks[index]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message
        });
    }
};

// DELETE TASK
const deleteTask = (req, res) => {
    try {
        const tasks = readTasks();

        const newTasks = tasks.filter(
            task => task.id !== req.params.id
        );

        if (newTasks.length === tasks.length) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        saveTasks(newTasks);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
};