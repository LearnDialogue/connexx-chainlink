import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/login.css';  // Reuse the same CSS for styling
import { useState, useEffect } from 'react';
import LoaderWheel from '../components/LoaderWheel';
import Footer from '../components/Footer';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '../graphql/mutations/userMutations';
import { tryValidatePassword } from '../util/PasswordValidator';

const SetNewPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // To retrieve the reset token from the URL
  const resetToken = searchParams.get('token'); // Get the reset token from the URL

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showErrorsList, setShowErrorsList] = useState<string[]>([]);

  useEffect(() => {
    // If the reset token is missing, display an error and prevent further actions.
    if (!resetToken) {
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, 'Missing token, cannot proceed.']);
    }
  }, [resetToken]);

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    update(_, { data }) {
      navigate('/login');
    },
    onError(err) {
      console.error('GraphQL Mutation Error:', err);
      const errorMessage = err?.graphQLErrors[0]?.message || 'Failed to reset password.';
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
    },
    variables: { resetToken, newPassword },
  });

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrorsList([]);

    if (!resetToken) {
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, 'Missing token, cannot proceed.']);
      return;
    }

    const passwordValidation = tryValidatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setShowErrorsList((prevErrorsList) => [
        ...prevErrorsList,
        passwordValidation.errorMessage!,
      ]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, 'Passwords do not match.']);
      return;
    }

    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, 'Please fill in all fields.']);
      return;
    }

    resetPassword();
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

      <form onSubmit={handleSetNewPassword} className='login-form-container'>
        <h1 className='login-form-brand'>
          <Link to='/'>Connexx ChainLink</Link>
        </h1>

        <div className='login-form-input'>
          <label htmlFor='newPassword'>New Password</label>
          <input
            id='newPassword'
            onChange={handleNewPasswordChange}
            type='password'
            value={newPassword}
            placeholder="Enter your new password"
            disabled={!resetToken}
          />
        </div>

        <div className='login-form-input'>
          <label htmlFor='confirmPassword'>Confirm New Password</label>
          <input
            id='confirmPassword'
            onChange={handleConfirmPasswordChange}
            type='password'
            value={confirmPassword}
            placeholder="Confirm your new password"
            disabled={!resetToken}
          />
        </div>

        <div onClick={handleSetNewPassword} className='login-form-login-btn'>
          <Button disabled={newPassword.trim() === '' || confirmPassword.trim() === '' || !resetToken} type='primary'>
            Set New Password
          </Button>
        </div>

        <span className='login-form-to-signup'>
          <Link to='/login'>Back to login</Link>
        </span>
      </form>
      <Footer absolute />
    </div>
  );
};

export default SetNewPasswordPage;
