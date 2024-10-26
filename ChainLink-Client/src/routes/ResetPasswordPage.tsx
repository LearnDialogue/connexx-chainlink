import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PasswordResetInitiated from '../components/PasswordResetInitiated';
import '../styles/login.css';  // Reuse the same CSS for styling
import { useState } from 'react';
import LoaderWheel from '../components/LoaderWheel';
import Footer from '../components/Footer';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET } from '../graphql/mutations/userMutations';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [userNameOrEmail, setUserNameOrEmail] = useState<string>('');
  const [showErrorsList, setShowErrorsList] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);  // State to control modal visibility
  const [modalMessage, setModalMessage] = useState<string>('');  // Message to display in modal

  const handleUserNameOrEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserNameOrEmail(e.target.value);
  };

  const [requestPasswordReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET, {
    update(_, { data }) {
      setModalMessage('Password reset email sent if user exists!');
      setShowModal(true);
    },
    onError(err) {
      console.error('GraphQL Mutation Error:', err);
      const errorMessage = err?.graphQLErrors[0]?.message || 'Failed to reset password.';
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
    },
    variables: { userNameOrEmail },
  });

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrorsList([]);
    if (userNameOrEmail.trim() === '') {
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, 'Please enter a username or email.']);
      return;
    }
    requestPasswordReset();
  };

  const displayErrors = () => {
    return (
      <div className='signup-errors'>
        <div
          className='signup-errors-close-button'
          onClick={() => setShowErrorsList([])}
        >
          ✕
        </div>
        <div className='signup-errors-list'>
          {showErrorsList.map((err, index) => (
            <div key={index}>* {err}</div>
          ))}
        </div>
      </div>
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div>
        <LoaderWheel />
      </div>
    );
  }

  return (
    <div className='login-main-container'>
      {showErrorsList.length > 0 ? displayErrors() : null}

      <form onSubmit={handleResetPassword} className='login-form-container'>
        <h1 className='login-form-brand'>
          <Link to='/'>Connexx ChainLink</Link>
        </h1>

        <div className='login-form-input'>
          <label htmlFor='userNameOrEmail'>Username or Email</label>
          <input
            id='userNameOrEmail'
            onChange={handleUserNameOrEmailChange}
            type='text'
            value={userNameOrEmail}
            placeholder="Enter your username or email"
          />
        </div>

        <div onClick={handleResetPassword} className='login-form-login-btn'>
          <Button disabled={userNameOrEmail.trim() === ''} type='primary'>
            Reset Password
          </Button>
        </div>

        <span className='login-form-to-signup'>
          Remember your password?
          <span>
            <Link to='/login'>Log in</Link>
          </span>
        </span>
      </form>

      <Footer absolute />

      {/* Display the modal if showModal is true */}
      {showModal && <PasswordResetInitiated message={modalMessage} onClose={handleCloseModal} />}
    </div>
  );
};

export default ResetPasswordPage;