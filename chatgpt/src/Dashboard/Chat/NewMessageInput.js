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
  const [selectedItem, setSelectedItem] = useState(null);

  const dispatch = useDispatch();

  const selectedConversationId = useSelector(
    (state) => state.dashboard.selectedConversationId
  );

  const conversations = useSelector((state) => state.dashboard.conversations);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const proceedMessage = () => {
    let combinedContent = content;

    if (selectedItem && selectedItem.text) {
      // Se houver um item selecionado, concatene com o conteúdo existente
      combinedContent += ` ${selectedItem.text}`;
    }

    const message = {
      aiMessage: false,
      content: combinedContent,
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
    setSelectedItem(null); // Limpa o item selecionado após enviar a mensagem
  };

  const handleSendMessage = () => {
    if (content.length > 0) {
      proceedMessage();
    }
  };

  const handleKeyPressed = (event) => {
    if (event.code === "Enter" && content.length > 0) {
      proceedMessage();
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    closeModal();
  };

  const modalItems = [
    { id: 1, text: "Óleo do Motor Recomendado pela montadora" },
    { id: 2, text: "Item 2" },
    { id: 3, text: "Item 3" },
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
                  {item.text}
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
