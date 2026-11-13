/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sqlite3", "sequelize", "pdf-parse"],
  allowedDevOrigins: ["127.0.0.1"]
};

module.exports = nextConfig;
