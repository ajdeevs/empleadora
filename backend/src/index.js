const express = require("express");
const cors = require("cors");
const projectsRoute = require("./routes/projects");
const milestonesRoute = require("./routes/milestones");
const adminRoute = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Backend is running 🚀');
});

app.use("/projects", projectsRoute);
app.use("/milestones", milestonesRoute);
app.use("/admin", adminRoute);

app.listen(5000, () => console.log("Server running on port 5000"));
