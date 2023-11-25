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

/* const conversationMessageHandler = async (socket, data) => {
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
    }); */
    const conversationMessageHandler = async (socket, data) => {
      const { sessionId, message, conversationId } = data;
    
      const openai = getOpenai();
    
      let prompt;
      if (message.content.includes('freios')) {
        prompt = "Pesquise no fabricante o modelo do veículo, e exiba o Lubrificante do Motor recomendado e a Quantidade em Litros. " + 
                 "[Montadora], [Veículo],[ Motor], [Ano]";
      } else if (message.content.includes('motor')) {
        prompt = "Leia a resposta anterior, e exiba 3 alternativas de óleo para esse veículo. " + 
                 "Alternativas de Lubrificante para esse veículo";
      } else {
        prompt = "Leia as mensagens anteriores + a nova pergunta, e responda de acordo com o lubrificante do veículo. " + message.content;
      }
    
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 400,
        temperature: 0.2,
        top_p: 0.5,
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
 
};

const conversationDeleteHandler = (_, data) => {
  const { sessionId } = data;

  if (sessions[sessionId]) {
    sessions[sessionId] = [];
  }
};

module.exports = { registerSocketServer };
