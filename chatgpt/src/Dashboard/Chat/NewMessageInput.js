import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsSend } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import { addMessage, setSelectedConversationId } from "../dashboardSlice";
import { sendConversationMessage } from "../../socketConnection/socketConn";

const NewMessageInput = () => {
  const [content, setContent] = useState("");
  const [isProcessing, setProcessing] = useState(false);

  const dispatch = useDispatch();

  const selectedConversationId = useSelector(
    (state) => state.dashboard.selectedConversationId
  );

  const conversations = useSelector((state) => state.dashboard.conversations);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const proceedMessage = async () => {
    const message = {
      aiMessage: false,
      content,
      id: uuid(),
      animate: false,
    };

    const conversationId =
      selectedConversationId === "new" ? uuid() : selectedConversationId;

    dispatch(
      addMessage({
        conversationId,
        message,
      })
    );

    dispatch(setSelectedConversationId(conversationId));

    setProcessing(true);

    try {
      await sendConversationMessage(message, conversationId);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setProcessing(false);
    }

    setContent("");
  };

  const handleSendMessage = () => {
    if (content.length > 0 && !isProcessing) {
      proceedMessage();
    }
  };

  const handleKeyPressed = (event) => {
    if (event.code === "Enter" && content.length > 0 && !isProcessing) {
      proceedMessage();
    }
  };

  return (
    <div className="new_message_input_container">
      <div className="new_message_icon_container" onClick={handleSendMessage}>
        {isProcessing ? (
          <div className="dots-animation">...</div>
        ) : (
          <BsSend color="grey" />
        )}
      </div>
      <input
        className="new_message_input"
        placeholder="Enviar mensagem..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyPressed}
        disabled={
          selectedConversation &&
          !selectedConversation.messages[
            selectedConversation.messages.length - 1
          ].aiMessage
        }
      />
    </div>
  );
};

export default NewMessageInput;
