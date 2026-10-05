const express = require("express");

const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

const router = express.Router();

// GET all tasks
router.get("/", getTasks);

// GET single task
router.get("/:id", getTask);

// CREATE task
router.post("/", createTask);

// UPDATE task
router.put("/:id", updateTask);

// DELETE task
router.delete("/:id", deleteTask);

module.exports = router;