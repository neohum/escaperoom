'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class main_contents extends Model {
    static associate(models) {
      // 사용자와의 관계 설정
      main_contents.belongsTo(models.user, {
        foreignKey: 'userId',
        as: 'author' // 'mainContentOwner'에서 'author'로 변경
      });
      
      // 콘텐츠와의 관계 설정
      main_contents.belongsTo(models.contents, {
        foreignKey: 'contentId',
        as: 'parentContent' // 'mainContentParent'에서 'parentContent'로 변경
      });
    }
  }
  
  main_contents.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('content');
        if (rawValue) {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return rawValue;
          }
        }
        return null;
      },
      set(value) {
        if (typeof value === 'object') {
          this.setDataValue('content', JSON.stringify(value));
        } else {
          this.setDataValue('content', value);
        }
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'contents',
        key: 'id'
      }
    },
    prevUuid: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isValidUUID(value) {
          if (value === null || value === undefined) return;
          
          // UUID 형식 검증
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(value)) {
            throw new Error('Invalid UUID format for prevUuid');
          }
        }
      }
    },
    nextUuid: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isValidUUID(value) {
          if (value === null || value === undefined) return;
          
          // UUID 형식 검증
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(value)) {
            throw new Error('Invalid UUID format for nextUuid');
          }
        }
      }
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    isLatest: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'main_contents',
    hooks: {
      beforeCreate: async (instance) => {
        // UUID 생성
        if (!instance.uuid) {
          instance.uuid = uuidv4();
        }
      }
    }
  });
  
  return main_contents;
};
