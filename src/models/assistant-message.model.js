import { DataTypes, Model } from 'sequelize';

export class AssistantMessage extends Model {
  static initModel(sequelize) {
    AssistantMessage.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        conversation_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('system', 'user', 'assistant'),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        used_tools: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'AssistantMessage',
        tableName: 'assistant_messages',
      }
    );

    return AssistantMessage;
  }
}
