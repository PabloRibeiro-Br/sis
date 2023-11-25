const { Server } = require("socket.io");
const { v4: uuid } = require("uuid");
const { getOpenai } = require("./ai");

let sessions = {};

const registerSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`user connected ${socket.id}`);

    socket.on("session-history", (data) => {
      sessionHistoryHandler(socket, data);
    });

    socket.on("conversation-message", (data) => {
      conversationMessageHandler(socket, data);
    });

    socket.on("conversation-delete", (data) => {
      conversationDeleteHandler(socket, data);
    });
  });
};

const conversationMessageHandler = async (socket, data) => {
  try {
    const { sessionId, message, conversationId } = data;

    const openai = getOpenai();

    let previousConversation = [];

    if (sessions[sessionId]) {
      const existingConversation = sessions[sessionId].find(
        (c) => c.id === conversationId
      );

      if (existingConversation) {
        previousConversation = existingConversation.messages.map((m) => ({
          content: m.content,
          role: m.aiMessage ? "assistant" : "user",
        }));
      }
    }

    const conversationHistory = [...previousConversation, message];

    const lastUserMessage = conversationHistory
      .filter((msg) => msg.role === "user")
      .pop();

    if (lastUserMessage) {
      const prompt = `Assistente para Reparo de Injeção Eletrônica Automotiva: ${lastUserMessage.content}`;

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0.5,
        max_tokens: 300,
      });

      const aiMessageContent = response?.data?.choices[0]?.text;

      const aiMessage = {
        content: aiMessageContent
          ? aiMessageContent
          : "Desculpe, não consegui entender completamente. Pode reformular a pergunta?",
        id: uuid(),
        aiMessage: true,
      };

      const conversation = sessions[sessionId].find(
        (c) => c.id === conversationId
      );

      if (!conversation) {
        sessions[sessionId].push({
          id: conversationId,
          messages: [...conversationHistory, aiMessage],
        });
      }

      if (conversation) {
        conversation.messages.push(aiMessage);
      }

      const updatedConversation = sessions[sessionId].find(
        (c) => c.id === conversationId
      );

      socket.emit("conversation-details", updatedConversation);
    }
  } catch (error) {
    console.error("Erro ao processar a mensagem:", error);
    const errorMessage = {
      content: "Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde.",
      id: uuid(),
      aiMessage: true,
    };

    socket.emit("conversation-details", errorMessage);
  }
};

module.exports = { registerSocketServer };
