module.exports = {
    apps: [
      {
        name: "arvan-backend",
        script: "bash",
        args: "-lc \"prisma generate && NODE_ENV=production node dist/index.js\"",
        // optional: watch: false,
        // optional: instances: 2, exec_mode: "cluster"
      }
    ]
  };
  