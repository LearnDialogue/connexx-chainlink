import React, { useState } from 'react';
import '../styles/components/invite-modal.css';

interface InviteModalProps {
  onClose: () => void;
  onInvite: (username: string) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ onClose, onInvite }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(username.trim());
  };

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal-content" onClick={e => e.stopPropagation()}>
        <button className="invite-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="invite-modal-header">Invite New Member</div>
        <form className="invite-modal-form" onSubmit={handleSubmit}>
          <input
            className="invite-input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <div className="invite-modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="invite-button">
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;