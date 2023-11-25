import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BsSend } from 'react-icons/bs';
import { v4 as uuid } from "uuid";
import { addMessage } from '../dashboardSlice';

const NewMessageInput = () => {
  const [content, setContent ] = useState("");

  const dispatch = useDispatch();

  const selectedConversationId = useSelector(
    (state) => state.dashboard.selectedConversationId
  );

  const proceedMessage = () => {
    const message = {
      aiMessage: false,
      content,
      id: uuid(),
      animate: false, 
    };

    console.log(message);

    const conversationId = 
    selectedConversationId === 'new' ? uuid() : selectedConversationId;

    dispatch(addMessage({
        conversationId,
        message,
      }));

    setContent("");
  };

  const handleSendMessage = () => {
    if(content.length > 0) {
      proceedMessage();
    }
  };

  const handleKeyPressed = (event) => {
    if (event.code == 'Enter' && content.length > 0 ) {
      proceedMessage();
    }
  }

  return ( <div className='new_message_input_container'>
    <input
        className='new_message_input'
        placeholder='Iniciar pesquisa...'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyPressed}
    />
    <div className='new_message_icon_container' onClick={handleSendMessage}>
        <BsSend color='grey'/>
    </div>
   </div>
  )
}

export default NewMessageInput