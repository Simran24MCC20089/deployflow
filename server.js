const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

/* =======================
   DATABASE CONNECTION
======================= */
mongoose.connect('mongodb://127.0.0.1:27017/deployflow')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

/* =======================
   MODELS
======================= */
const Deployment = mongoose.model('Deployment', {
  version: String,
  status: String,
  time: String
});

const Log = mongoose.model('Log', {
  message: String,
  time: String
});

/* =======================
   DEPLOYMENTS
======================= */
app.get('/api/deployments', async (req, res) => {
  try {
    const data = await Deployment.find().sort({ _id: -1 });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch deployments" });
  }
});

app.post('/api/deploy', async (req, res) => {
  try {
    const count = await Deployment.countDocuments();
    const version = "v" + (count + 1);

    const newDeploy = new Deployment({
      version,
      status: "Success",
      time: new Date().toLocaleString()
    });

    await newDeploy.save();

    await new Log({
      message: `Deployment ${version} created`,
      time: new Date().toLocaleString()
    }).save();

    res.json(newDeploy);
  } catch {
    res.status(500).json({ error: "Deployment failed" });
  }
});

/* =======================
   LOGS
======================= */
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ _id: -1 });
    res.json(logs);
  } catch {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

/* =======================
   JENKINS STATUS
======================= */
app.get('/api/jenkins', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8080/api/json');
    res.json({
      status: "Connected",
      jobs: response.data.jobs.length
    });
  } catch {
    res.json({
      status: "Disconnected",
      jobs: 0
    });
  }
});

/* =======================
   JENKINS JOB LIST
======================= */
app.get('/api/jenkins/jobs', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8080/api/json');

    const jobs = response.data.jobs.map(job => ({
      name: job.name,
      status: job.color.includes('blue') ? "Success" : "Failed"
    }));

    res.json(jobs);
  } catch {
    res.json([]);
  }
});

/* =======================
   SERVER
======================= */
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});