'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('main_contents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'contents',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      prevUuid: {
        type: Sequelize.UUID,
        allowNull: true
      },
      nextUuid: {
        type: Sequelize.UUID,
        allowNull: true
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      isLatest: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 인덱스 추가
    await queryInterface.addIndex('main_contents', ['uuid']);
    await queryInterface.addIndex('main_contents', ['contentId']);
    await queryInterface.addIndex('main_contents', ['prevUuid']);
    await queryInterface.addIndex('main_contents', ['nextUuid']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('main_contents');
  }
};
