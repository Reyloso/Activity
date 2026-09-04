module.exports = {
  apps: [
    {
      name: "activity-web",
      cwd: __dirname,
      script: "pnpm",
      args: "start",
      env: { NODE_ENV: "production" },
    },
    {
      name: "activity-trivia-socket",
      cwd: __dirname,
      script: "pnpm",
      args: "exec tsx server/trivia-server.ts",
      env: { NODE_ENV: "production" },
    },
  ],
};
