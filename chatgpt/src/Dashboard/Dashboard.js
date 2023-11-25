import React from 'react';
import "./dashboard.css";
import Chat from './Chat/Chat';
import Sidebar from './Sidebar/sidebar';


const Dashboard = () => {
  return <div className='dashboard_container'>
    <Sidebar/>
    <Chat/>
  </div>;
};

export default Dashboard;