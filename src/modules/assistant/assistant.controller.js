import { assistantService } from './assistant.service.js';

const chat = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?.id || null;

    const result = await assistantService.chat({
      userMessage: message,
      userId,
      conversationId: conversationId ?? userId,
    });

    return res.ok(
      {
        reply: result.reply,
        usedTools: result.usedTools,
        conversationId: result.conversationId,
      },
      'AI assistant response'
    );
  } catch (err) {
    next(err);
  }
};

export const assistantController = {
  chat,
};
