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

  let conversationHistory = [];

  if (sessions[sessionId]) {
    const existingConversation = sessions[sessionId].find(
      (c) => c.id === conversationId
    );

    if (existingConversation) {
      conversationHistory = existingConversation.messages.map((m) => ({
        content: m.content,
        role: m.aiMessage ? "assistant" : "user",
      }));
    }

    const prompt = conversationHistory.map(m => m.content).join('\n') + "\n" + message.content;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Você é um Assistente aos Mecânicos de Automóveis. Você está conversando com Mecânicos, por isso realize as respostas didaticamente, explicando, e seja objetivo, não fique exibindo a pergunta do usuário novamente.\n" + prompt,
      temperature: 0,
      max_tokens: 180,  
      top_p:0.9,
      presence_penalty:0.9,
      frequency_penalty:0.9,
      n:2, 
    });

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
  }
};

module.exports = { registerSocketServer };
