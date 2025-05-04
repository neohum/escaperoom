module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "min9610012@",
  DB: "escape_room2",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};