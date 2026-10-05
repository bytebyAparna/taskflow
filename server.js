const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const taskRoutes = require("./routes/taskRoutes");

app.use("/api/tasks", taskRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "TaskFlow API is running 🚀"
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 TaskFlow server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
});