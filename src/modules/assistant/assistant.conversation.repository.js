import { AssistantConversation } from '../../models/assistant-conversation.model.js';
import { AssistantMessage } from '../../models/assistant-message.model.js';

const MAX_HISTORY_MESSAGES = 12; // 6 turnos o interacciones de contexto (6 user + 6 assistant)

class AssistantConversationRepository 
{

  async createConversation({ userId }) {
    return AssistantConversation.create({
      id_user: userId,
      pending_action: null,
      pending_payload: null,
      pending_required: null,
    });
  }

  async getOrCreateConversation({ userId, conversationId }) {
    if (conversationId) {
      const conversacion = await AssistantConversation.findOne({
        where: { id: conversationId, id_user: userId },
      });

      if (!conversacion){
        return this.createConversation({ userId });
      }

      return conversacion;
    }

    return this.createConversation({ userId });
  }

  async getRecentMessages(conversationId) {
    const rows = await AssistantMessage.findAll({
      where: { conversation_id: conversationId },
      order: [['createdAt', 'DESC']],
      limit: MAX_HISTORY_MESSAGES,
    });

    return rows
    .reverse()
    .map((m) => ({ role: m.role, content: m.content }));
  }

  async addMessage({ conversationId, role, content, usedTools = null }) {
    return AssistantMessage.create({
      conversation_id: conversationId,
      role,
      content,
      used_tools: usedTools,
    });
  }

  async setPending(conversationId, pending) {
    return AssistantConversation.update(
      {
        pending_action: pending?.action ?? null,
        pending_payload: pending?.payload ?? null,
        pending_required: pending?.required ?? null,
      },
      { where: { id: conversationId } }
    );
  }
}

export const assistantConversationRepository = new AssistantConversationRepository();
