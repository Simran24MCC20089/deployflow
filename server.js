const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

let deployments = [];

// API: Get deployments
app.get('/api/deployments', (req, res) => {
    res.json(deployments);
});

// API: Add deployment
app.post('/api/deploy', (req, res) => {
    const newDeploy = {
        version: `v${deployments.length + 1}`,
        status: 'Success',
        time: new Date().toLocaleString()
    };

    deployments.unshift(newDeploy);
    res.json(newDeploy);
});

// 🔥 Jenkins Status API
app.get('/api/jenkins', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8080/api/json');
        res.json({ status: "Connected", jobs: response.data.jobs.length });
    } catch {
        res.json({ status: "Disconnected", jobs: 0 });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));