const conversationMessageHandler = async (socket, data) => {
  const { sessionId, message, conversationId } = data;

  const openai = getOpenai();

  const conversation = sessions[sessionId]?.find(
    (c) => c.id === conversationId
  );

  let prompt = "Você é uma professora que ensina macetes da prova do Enem. Seu nome é Núcleo Enem. " + message.content;

  if (conversation && conversation.messages.length > 0) {
    const previousMessage = conversation.messages[conversation.messages.length - 1];
    prompt = `${previousMessage.content}\nMacedes e Dicas para estudar para a prova do Enem. Sempre leia sua resposta e a pergunta, antes de exibir a resposta. ${message.content}`;
  }

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.4,
    max_tokens: 250,
    top_p: 0.5,
    frequency_penalty: 2,
    presence_penalty: 0,
  });

  const aiMessageContent = response?.data?.choices[0]?.text.trim();

  const aiMessage = {
    content: aiMessageContent
      ? aiMessageContent
      : "Erro da Inteligência Artificial, sem comunicação: REDE-NEURAL-P8493",
    id: uuid(),
    aiMessage: true,
  };

  if (!conversation) {
    sessions[sessionId] = [{
      id: conversationId,
      messages: [message, aiMessage],
    }];
  } else {
    conversation.messages.push(aiMessage);
  }

  const updatedConversation = sessions[sessionId].find(
    (c) => c.id === conversationId
  );

  socket.emit("conversation-details", updatedConversation);
};














/* const { Server } = require("socket.io");
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

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Exiba o Lubrificante do Motor recomendado pela fábricante, exiba a quantidade em litros.",
               temperature: 0.1,
               max_tokens: 150,
               top_p: 0.5,
    });
    
  };
   const aiMessageContent = response?.data?.choices[0]?.text;

    const aiMessage = {
      content: aiMessageContent
        ? aiMessageContent
        : "Erro da Inteligência Artificial, sem comunicação: REDE-NEURAL-P8493",
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
    }

    if (conversation) {
      conversation.messages.push(message, aiMessage);
    }

    const updatedConversation = sessions[sessionId].find(
      (c) => c.id === conversationId
    );

    socket.emit("conversation-details", updatedConversation);
 
};

const conversationDeleteHandler = (_, data) => {
  const { sessionId } = data;

  if (sessions[sessionId]) {
    sessions[sessionId] = [];
  }
};

module.exports = { registerSocketServer };
 */