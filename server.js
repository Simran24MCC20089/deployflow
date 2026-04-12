const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect('mongodb://127.0.0.1:27017/deployflow');

const Deployment = mongoose.model('Deployment', {
  version: String,
  status: String,
  time: String
});

const Log = mongoose.model('Log', {
  message: String,
  time: String
});

// Get deployments
app.get('/api/deployments', async (req, res) => {
  const data = await Deployment.find().sort({_id:-1});
  res.json(data);
});

// Add deployment
app.post('/api/deploy', async (req, res) => {
  const version = "v" + Date.now();

  const newDeploy = new Deployment({
    version,
    status: "Success",
    time: new Date().toLocaleString()
  });

  await newDeploy.save();

  await new Log({
    message: "New deployment " + version,
    time: new Date().toLocaleString()
  }).save();

  res.json(newDeploy);
});

// Logs
app.get('/api/logs', async (req, res) => {
  const logs = await Log.find().sort({_id:-1});
  res.json(logs);
});

// Jenkins
app.get('/api/jenkins', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8080/api/json');
    res.json({status:"Connected", jobs: response.data.jobs.length});
  } catch {
    res.json({status:"Disconnected", jobs:0});
  }
});

app.listen(5000, () => console.log("Server running"));