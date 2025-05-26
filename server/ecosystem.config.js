module.exports = {
  apps: [{
    name: 'elnopal-backend',
    script: 'src/index.js',
    cwd: '/var/www/elnopal/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/elnopal-backend-error.log',
    out_file: '/var/log/pm2/elnopal-backend-out.log',
    log_file: '/var/log/pm2/elnopal-backend.log',
    time: true
  }]
}; 