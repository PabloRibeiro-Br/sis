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

  // Obter o DTC da última mensagem do usuário
  const lastUserMessage = conversationHistory
    .filter((msg) => msg.role === "user")
    .pop();

  if (lastUserMessage) {
    // Obter informações sobre o código DTC
    const dtcInformation = await getDtcInformation(lastUserMessage.content);

    // Criar resposta do assistente com base nas informações do DTC
    const aiMessage = {
      content: dtcInformation
        ? `Código DTC: ${lastUserMessage.content}\nProcedimentos de reparo:\n${dtcInformation.procedures.join("\n")}`
        : "Erro da Inteligência Artificial, sem informações disponíveis para o código DTC inserido.",
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
      conversation.messages.push(...conversationHistory, aiMessage);
    }

    const updatedConversation = sessions[sessionId].find(
      (c) => c.id === conversationId
    );

    socket.emit("conversation-details", updatedConversation);
  }
};


module.exports = { registerSocketServer };
