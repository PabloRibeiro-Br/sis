import React from 'react';
import NewChatButton from '../NewChatButton';
import ListItem from './ListItem';
import DeleteConversationsButton from './DeleteConversationsButton';
import { useDispatch } from "react-redux";
import { setSelectedConversationId } from '../dashboardSlice';

const Sidebar = () => {
  const dispatch = useDispatch();

  const handleSetSelectedChat = (id) => {
    dispatch(setSelectedConversationId(id));
  };

  return (
    <div className='sidebar_container'>
      <NewChatButton handleSetSelectedChat={handleSetSelectedChat} />
      <DeleteConversationsButton />
    </div>
  );
};

export default Sidebar;
