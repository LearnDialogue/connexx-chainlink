import React from 'react';
import '../styles/components/footer.css';

interface FooterProps {
  absolute?: boolean;
}

const Footer: React.FC<FooterProps> = ({ absolute }) => {
  return (
    <div
      className='footer-main-container'
      style={absolute ? { position: 'absolute' } : {}}
    >
      <p>Copyright 2024 ©</p>
      <p>&nbsp; Patent pending</p>
      <p className='strava'>Powered by Strava</p>
    </div>
  );
};

export default Footer;
