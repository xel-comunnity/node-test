const cluster = require('cluster');
const os = require('os');
const express = require('express');
const mysql = require('mysql2/promise');

const numWorkers = os.cpus().length; // Adjusted for your 2 core, 4 thread system
const port = 4000;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    const app = express();

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Todokana1ko!',
        database: 'sample',
        acquireTimeout: 60000, // milliseconds
        waitForConnections: true,
        connectionLimit: 20, // Increased from 5 to 20
        queueLimit: 0
    });

    app.get('/users', async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT id,name,email FROM users');
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/', (req, res) => {
        res.json(['hello world']);
    });

    app.listen(port, () => {
        console.log(`Worker ${process.pid} started on port ${port}`);
    });
}