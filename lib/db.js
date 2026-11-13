const { Sequelize, DataTypes } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

function openDatabase() {
  if (databaseUrl) {
    return new Sequelize(databaseUrl, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      dialectOptions: databaseUrl.includes("localhost")
        ? {}
        : { ssl: { require: true, rejectUnauthorized: false } },
      pool: { max: 2, min: 0, idle: 10000 }
    });
  }

  const fs = require("fs");
  const path = require("path");
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return new Sequelize({
    dialect: "sqlite",
    storage: path.join(dataDir, "roaster.sqlite"),
    logging: false
  });
}

let sequelize;
try {
  sequelize = openDatabase();
} catch (error) {
  console.error(error);
  sequelize = null;
}

const User = sequelize && sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false }
});

const Roast = sequelize && sequelize.define("Roast", {
  resumeText: { type: DataTypes.TEXT, allowNull: false },
  score: { type: DataTypes.INTEGER, allowNull: false },
  roast: { type: DataTypes.TEXT, allowNull: false },
  suggestions: { type: DataTypes.TEXT, allowNull: false },
  source: { type: DataTypes.STRING, allowNull: false }
});

if (sequelize) {
  User.hasMany(Roast, { foreignKey: { allowNull: true }, onDelete: "SET NULL" });
  Roast.belongsTo(User);
}

let ready;

function initDb() {
  if (!sequelize) {
    return Promise.reject(new Error("No database is connected."));
  }
  if (!ready) {
    ready = sequelize.sync();
  }
  return ready;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function persistRoast(fields) {
  await initDb();
  return Roast.create(fields);
}

module.exports = { sequelize, User, Roast, initDb, publicUser, persistRoast };
