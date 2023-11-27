import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsSend } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import { addMessage, setSelectedConversationId } from "../dashboardSlice";
import { sendConversationMessage } from "../../socketConnection/socketConn";
import modalItems from "./modalData"; // Importa o arquivo JavaScript
import "./NewMessageInput.css";

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

  const extraButtons = [
    { id: 1, label: "Botão 1" },
    { id: 2, label: "Botão 2" },
    { id: 3, label: "Botão 3" },
  ];

  const openExtraModal = (button) => {
    setShowModal(true);
    const modalData = require(`./modalData${button.id}`).default;
    // Adicione lógica para lidar com os dados do modal
    console.log(`Modal Data for ${button.label}:`, modalData);
  };

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
        {/* Adicionando três botões extras */}
        {extraButtons.map((button) => (
          <button
            key={button.id}
            className="extra-button"
            onClick={() => openExtraModal(button)}
          >
            {button.label}
          </button>
        ))}
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
