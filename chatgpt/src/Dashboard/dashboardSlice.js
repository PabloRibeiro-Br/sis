import { createSlice } from "@reduxjs/toolkit";
import fs from 'fs'; // Módulo para manipulação de arquivos (Node.js)

// Função utilitária para carregar conversações do arquivo JSON
const loadConversationsFromFile = () => {
  try {
    const data = fs.readFileSync('conversations.json');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar conversações do arquivo JSON', error);
    return [];
  }
};

// Função utilitária para salvar conversações no arquivo JSON
const saveConversationsToFile = (conversations) => {
  try {
    fs.writeFileSync('conversations.json', JSON.stringify(conversations));
  } catch (error) {
    console.error('Erro ao salvar conversações no arquivo JSON', error);
  }
};

const initialState = {
  sessionEstablished: false,
  conversations: loadConversationsFromFile(),
  selectedConversationId: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedConversationId: (state, action) => {
      state.selectedConversationId = action.payload;
    },
    addMessage: (state, action) => {
      const { message, conversationId } = action.payload;

      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );

      if (conversation) {
        conversation.messages.push(message);
      } else {
        state.conversations.push({
          id: conversationId,
          messages: [message],
        });
      }

      // Atualizando o arquivo JSON
      saveConversationsToFile(state.conversations);
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.sessionEstablished = true;

      // Salvando no arquivo JSON
      saveConversationsToFile(state.conversations);
    },
    setConversationHistory: (state, action) => {
      const { id, messages } = action.payload;

      const conversation = state.conversations.find((c) => c.id === id);

      if (conversation) {
        conversation.messages = messages;
      } else {
        state.conversations.push({
          id,
          messages,
        });
      }

      // Atualizando o arquivo JSON
      saveConversationsToFile(state.conversations);
    },
    deleteConversations: (state) => {
      state.conversations = [];
      state.selectedConversationId = null;

      // Salvando no arquivo JSON
      saveConversationsToFile(state.conversations);
    },
  },
});

export const {
  setSelectedConversationId,
  addMessage,
  setConversations,
  setConversationHistory,
  deleteConversations,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;




/* import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sessionEstablished: false,
  conversations: [],
  selectedConversationId: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedConversationId: (state, action) => {
      state.selectedConversationId = action.payload;
    },
    addMessage: (state, action) => {
      const { message, conversationId } = action.payload;

      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );

      if (conversation) {
        conversation.messages.push(message);
      } else {
        state.conversations.push({
          id: conversationId,
          messages: [message],
        });
      }
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.sessionEstablished = true;
    },
    setConversationHistory: (state, action) => {
      const { id, messages } = action.payload;

      const conversation = state.conversations.find((c) => c.id === id);

      if (conversation) {
        conversation.messages = messages;
      } else {
        state.conversations.push({
          id,
          messages,
        });
      }
    },
    deleteConversations: (state) => {
      state.conversations = [];
      state.selectedConversationId = null;
    },
  },
});

export const {
  setSelectedConversationId,
  addMessage,
  setConversations,
  setConversationHistory,
  deleteConversations,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
 */