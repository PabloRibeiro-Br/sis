import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsSend } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import { addMessage, setSelectedConversationId } from "../dashboardSlice";
import { sendConversationMessage } from "../../socketConnection/socketConn";
import "./NewMessageInput.css";

const NewMessageInput = () => {
  const [content, setContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalButtons, setAdditionalButtons] = useState([
    { id: 7, label: "Roda Fônica", description: "Como faz para testar a roda fônica..." },
    // Adicione mais botões conforme necessário
  ]);

  const dispatch = useDispatch();

  const selectedConversationId = useSelector(
    (state) => state.dashboard.selectedConversationId
  );

  const conversations = useSelector((state) => state.dashboard.conversations);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleBackgroundClick = (event) => {
    if (event.target.classList.contains("modal")) {
      closeModal();
    }
  };

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

      if (selectedButton === 6) {
        proceedMessage(combinedContent);
      }
    }
  };

  const handleButtonClick = (buttonId) => {
    setSelectedButton(buttonId);
  };

  const handleAdditionalButtonClick = (button) => {
    const combinedContent = `${content} ${button.description}`.trim();
    setContent(combinedContent);
  };

  return (
    <div className="new-message-input-container">
      <div className="input-button-container">
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
        <button className="send-button" onClick={handleSendMessage}>
          <BsSend />
        </button>
      </div>
      <div className="button-container">
        {additionalButtons.map((button) => (
          <button
            key={button.id}
            className="additional-button"
            onClick={() => handleAdditionalButtonClick(button)}
          >
            {button.label}
          </button>
        ))}
      </div>
      {showModal && (
        <div className="modal" onClick={handleBackgroundClick}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul>
              {modalData &&
                modalData
                  .filter((item) => filterAndIgnoreAccents(item.title))
                  .map((item) => (
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
