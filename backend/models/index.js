const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 모델 등록 - 파일 이름 수정
// 각 모델 로드 시도 시 오류 처리
try {
  console.log('Loading user model...');
  db.user = require("./user.js")(sequelize, Sequelize);
  console.log('User model loaded successfully');
} catch (error) {
  console.error('Error loading user model:', error.message);
  try {
    console.log('Trying alternative user model path...');
    db.user = require("./user.model.js")(sequelize, Sequelize);
    console.log('User model loaded successfully from alternative path');
  } catch (altError) {
    console.error('Error loading alternative user model:', altError.message);
  }
}

try {
  console.log('Loading token model...');
  db.token = require("./token.js")(sequelize, Sequelize);
  console.log('Token model loaded successfully');
} catch (error) {
  console.error('Error loading token model:', error.message);
  try {
    console.log('Trying alternative token model path...');
    db.token = require("./token.model.js")(sequelize, Sequelize);
    console.log('Token model loaded successfully from alternative path');
  } catch (altError) {
    console.error('Error loading alternative token model:', altError.message);
  }
}

try {
  console.log('Loading contents model...');
  db.contents = require("./contents.js")(sequelize, Sequelize);
  console.log('Contents model loaded successfully');
} catch (error) {
  console.error('Error loading contents model:', error.message);
  try {
    console.log('Trying alternative contents model path...');
    db.contents = require("./contents.model.js")(sequelize, Sequelize);
    console.log('Contents model loaded successfully from alternative path');
  } catch (altError) {
    console.error('Error loading alternative contents model:', altError.message);
  }
}

try {
  console.log('Loading main_contents model...');
  db.main_contents = require("./main_contents.js")(sequelize, Sequelize);
  console.log('Main_contents model loaded successfully');
} catch (error) {
  console.error('Error loading main_contents model:', error.message);
  try {
    console.log('Trying alternative main_contents model path...');
    db.main_contents = require("./main_contents.model.js")(sequelize, Sequelize);
    console.log('Main_contents model loaded successfully from alternative path');
  } catch (altError) {
    console.error('Error loading alternative main_contents model:', altError.message);
  }
}

// 모델 관계 설정 - 각 모델의 associate 메서드 호출
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    try {
      db[modelName].associate(db);
      console.log(`Successfully set associations for model: ${modelName}`);
    } catch (error) {
      console.error(`Error setting associations for model ${modelName}:`, error);
    }
  }
});

module.exports = db;
