module.exports = {
  apps: [
    {
      name: "abhasetu-web",
      cwd: "./apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "abhasetu-server",
      cwd: "./apps/server",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};
