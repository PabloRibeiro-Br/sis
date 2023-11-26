const { Server } = require("socket.io");
const { v4: uuid } = require("uuid");
const { getOpenai } = require("./ai");

class AutoMechanicAssistant {
  constructor() {
    this.sessions = {};
    this.io = null;
  }

  registerSocketServer(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on("session-history", (data) => this.handleSessionHistory(socket, data));

      socket.on("conversation-message", (data) => this.handleConversationMessage(socket, data));

      socket.on("conversation-delete", (data) => this.handleConversationDelete(socket, data));
    });
  }

  getSession(sessionId) {
    if (this.sessions[sessionId]) {
      return this.sessions[sessionId];
    } else {
      const newSessionId = uuid();
      this.sessions[newSessionId] = [];
      return this.sessions[newSessionId];
    }
  }

  async handleSessionHistory(socket, data) {
    const { sessionId } = data;
    const conversations = this.getSession(sessionId);

    socket.emit("session-details", {
      sessionId,
      conversations,
    });
  }

  async handleConversationMessage(socket, data) {
    const { sessionId, message, conversationId } = data;
    const openai = getOpenai();

    const previousConversationMessages = this.getSession(sessionId)
      .filter((c) => c.id === conversationId)
      .flatMap((c) => c.messages)
      .map((m) => ({
        content: m.content,
        role: m.aiMessage ? "assistant" : "user",
      }));

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Reparação Automotiva" + message.content,
      temperature: 0.3,
      max_tokens: 220,
      top_p: 0.3,
    });

    const aiMessageContent = response?.data?.choices[0]?.text;

    const aiMessage = {
      content: aiMessageContent ? aiMessageContent : "Erro da Inteligência Artificial, sem comunicação: REDE-NEURAL-P8493",
      id: uuid(),
      aiMessage: true,
    };

    const session = this.getSession(sessionId);
    const conversation = session.find((c) => c.id === conversationId);

    if (!conversation) {
      session.push({
        id: conversationId,
        messages: [message, aiMessage],
      });
    } else {
      conversation.messages.push(message, aiMessage);
    }

    socket.emit("conversation-details", {
      id: conversationId,
      messages: [...previousConversationMessages, { content: message.content, role: "user" }, aiMessage],
    });
  }

  handleConversationDelete(socket, data) {
    const { sessionId } = data;

    if (this.sessions[sessionId]) {
      this.sessions[sessionId] = [];
    }
  }
}

const autoMechanicAssistant = new AutoMechanicAssistant();

module.exports = { registerSocketServer: (server) => autoMechanicAssistant.registerSocketServer(server) };
