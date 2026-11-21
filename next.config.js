/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sqlite3", "sequelize", "pg", "pg-hstore", "pdf-parse"],
  allowedDevOrigins: ["127.0.0.1"]
};

module.exports = nextConfig;
