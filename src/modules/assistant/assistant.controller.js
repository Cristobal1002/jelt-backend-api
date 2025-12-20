import { assistantService } from './assistant.service.js';

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || null;

    const result = await assistantService.chat({
      userMessage: message,
      userId,
    });

    return res.ok(
      {
        reply: result.reply,
        usedTools: result.usedTools,
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
