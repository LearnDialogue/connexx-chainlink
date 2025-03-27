import React from 'react';
import '../styles/profile-page.css';
import { formatDate, formatTime } from '../util/Formatters';
import Button from './Button';

interface PreviewEventModalProps {
  event: any;
  onClose: (value: any | null) => void
}

const PreviewEventModal: React.FC<PreviewEventModalProps> = ({ event, onClose }) => {
  return (
    <div className='profile-page-popover-ride-details-container'>
      <div className='ride-card-modal-overlay'>
        <div className='ride-card-modal-container'>
          <span className='ride-card-close-modal' onClick={onClose}>
            <i className='fa fa-times'></i>
          </span>
          <div
            style={{
              width: '400px',
              height: '400px',
              backgroundColor: '#f2f2f2',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <p style={{ textAlign: 'center' }}>
              Sign up or log in to view the ride route and map.
            </p>
          </div>

          <div className='ride-card-modal-values'>
            <h2>{event.name}</h2>
            <p>
              Created by <b>{event.host}</b>
            </p>
            <p>
              Starts at <b>{formatTime(event.startTime)}</b> on{' '}
              <b>{formatDate(event.startTime)}</b>
            </p>
            <p>
              Bike Type: <b>{event.bikeType?.join(', ')}</b>
            </p>
            <p>
              <b>{event.difficulty}</b> average watts per kilogram effort expected
            </p>
            <p>{event.description}</p>
          </div>

          <div className='rsvp-button'>
            <Button
              marginTop={12}
              type='secondary'
              onClick={() => {
                window.location.href = '/signup?redirect=event';
              }}
            >
              Sign up to join
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewEventModal;
