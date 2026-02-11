module.exports = {
    apps: [
        {
            name: 'api',
            script: 'dist/src/main.js',
            cwd: 'apps/api',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'web',
            script: 'npm',
            args: 'start',
            cwd: 'apps/web',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
