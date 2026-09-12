"use strict";

/**
 * PM2 Production Multi-Core Cluster Configuration
 * Enables horizontal multi-core scaling for high-concurrency workloads (26,000+ simultaneous users)
 */

module.exports = {
    apps: [
        {
            name: "mbbs-backend-cluster",
            script: "server.js",
            instances: "max", // Scales to all available CPU cores (e.g. 4, 8, 16 workers)
            exec_mode: "cluster",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            kill_timeout: 5000,
            listen_timeout: 8000,
            shutdown_with_message: true
        }
    ]
};
