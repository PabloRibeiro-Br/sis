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

const sessionHistoryHandler = (socket, data) => {
  const { sessionId } = data;

  if (sessions[sessionId]) {
    // send existing session data back to user
    socket.emit("session-details", {
      sessionId,
      conversations: sessions[sessionId],
    });
  } else {
    const newSessionId = uuid();

    sessions[newSessionId] = [];

    const sessionDetails = {
      sessionId: newSessionId,
      conversations: [],
    };

    socket.emit("session-details", sessionDetails);
  }
};

const conversationMessageHandler = async (socket, data) => {
  const { sessionId, message, conversationId } = data;

  // Iniciar o indicador de carregamento no cliente
  socket.emit("loading-start");

  const openai = getOpenai();

  const previousConversationMessages = [];

  if (sessions[sessionId]) {
    const existingConversation = sessions[sessionId].find(
      (c) => c.id === conversationId
    );

    if (existingConversation) {
      previousConversationMessages.push(
        ...existingConversation.messages.map((m) => ({
          content: m.content,
          role: m.aiMessage ? "assistant" : "user",
        }))
      );
    }

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'system',
            content: "Você é um profissional, com mais de 25 anos de especialização em Injeção Eletrônica de Automóveis da Chevrolet."
          },
          {
            role: 'user',
            content: message.content,
          },
          ...previousConversationMessages
        ],
        max_tokens: 420,
        temperature: 0.2,
        top_p: 0.7,
        frequency_penalty: 1.5,
        presence_penalty: 0.2,
        /* stop: ["\n"] */
      });

      const aiMessageContent = response?.data?.choices[0]?.message?.content;

      const aiMessage = {
        content: aiMessageContent
          ? aiMessageContent
          : "Error occurred when trying to get message from the AI",
        id: uuid(),
        aiMessage: true,
      };

      const conversation = sessions[sessionId].find(
        (c) => c.id === conversationId
      );

      if (!conversation) {
        sessions[sessionId].push({
          id: conversationId,
          messages: [message, aiMessage],
        });
      } else {
        conversation.messages.push(message, aiMessage);
      }

      const updatedConversation = sessions[sessionId].find(
        (c) => c.id === conversationId
      );

      socket.emit("conversation-details", updatedConversation);

      // Parar o indicador de carregamento no cliente
      socket.emit("loading-end");
    } catch (error) {
      // Em caso de erro, parar o indicador de carregamento e informar o cliente
      socket.emit("loading-end", { error: true, message: error.message });
    }
  }
};

const conversationDeleteHandler = (_, data) => {
  const { sessionId } = data;

  if (sessions[sessionId]) {
    sessions[sessionId] = [];
  }
};

module.exports = { registerSocketServer };
