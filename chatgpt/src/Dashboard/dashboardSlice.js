import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sessionEstablished: false,
    conversations: [],
    selectedConversationId: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setSelectedConversationId: (state, action) => {
            state.selectedConversationId = action.payload;
        },
        addMessage: (state, action) => { // Corrigido aqui: de addMessege para addMessage
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
    },
});

export const { setSelectedConversationId, addMessage } = dashboardSlice.actions;

export default dashboardSlice.reducer;
