import React, { useState } from 'react';
import './SettingsPage.css';

const SettingsPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState(true);

  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Handle saving changes to user settings
    alert('Changes saved!');
  };

  return (
    <div className="settings-page">
      <h1>Account Settings</h1>
      <form onSubmit={handleSaveChanges}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter a new password" 
          />
        </div>
        <div className="form-group">
          <label>Enable Notifications</label>
          <input 
            type="checkbox" 
            checked={notifications} 
            onChange={() => setNotifications(!notifications)} 
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default SettingsPage;
