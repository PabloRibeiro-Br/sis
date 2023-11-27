// Importações necessárias

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsSend } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import { addMessage, setSelectedConversationId } from "../dashboardSlice";
import { sendConversationMessage } from "../../socketConnection/socketConn";
import "./NewMessageInput.css"; // Importe o arquivo de estilos

const NewMessageInput = () => {
  const [content, setContent] = useState("");
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();

  const selectedConversationId = useSelector(
    (state) => state.dashboard.selectedConversationId
  );

  const conversations = useSelector((state) => state.dashboard.conversations);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const proceedMessage = (text) => {
    const message = {
      aiMessage: false,
      content: text,
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

    sendConversationMessage(message, conversationId);

    setContent("");
  };

  const handleSendMessage = () => {
    if (content.length > 0) {
      proceedMessage(content);
    }
  };

  const handleKeyPressed = (event) => {
    if (event.code === "Enter" && content.length > 0) {
      proceedMessage(content);
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleItemClick = (item) => {
    closeModal();

    if (item && item.description) {
      const combinedContent = `${content} ${item.description}`.trim();
      setContent(combinedContent);
      proceedMessage(combinedContent);
    }
  };

  const modalItems = [
    { id: 1, title: "Lubrificante do Motor", description: "Qual lubrificante recomendado para o motor deste veículo." },
    { id: 2, title: "Item 2", description: "Descrição do Item 2" },
    { id: 3, title: "Item 3", description: "Descrição do Item 3" },
  ];

  return (
    <div className="new-message-input-container">
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
      <div className="button-container">
        <button className="send-button" onClick={handleSendMessage}>
          <BsSend />
        </button>
        <button className="open-modal-button" onClick={openModal}>
          Abrir Modal
        </button>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <ul>
              {modalItems.map((item) => (
                <li key={item.id} onClick={() => handleItemClick(item)}>
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMessageInput;
