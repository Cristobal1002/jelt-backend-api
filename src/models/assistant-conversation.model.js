import { DataTypes, Model } from 'sequelize';

export class AssistantConversation extends Model {
  static initModel(sequelize) {
    AssistantConversation.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        id_user: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        pending_action: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        pending_payload: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        pending_required: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'AssistantConversation',
        tableName: 'assistant_conversations',
      }
    );

    return AssistantConversation;
  }
}
