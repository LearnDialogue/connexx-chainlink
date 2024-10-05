import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/login.css';
import { useState, useContext } from 'react';
import LoaderWheel from '../components/LoaderWheel';
import { gql, useMutation } from '@apollo/client';
import { AuthContext } from '../context/auth';
import Footer from '../components/Footer';

const LoginPage = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [showErrorsList, setShowErrorsList] = useState<string[]>([]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedUsername = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      username: updatedUsername,
    }));
    setUserName(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedPassword = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      password: updatedPassword,
    }));
    setPassword(e.target.value);
  };

  const [errors, setErrors] = useState({});

  const [errorMessage, setErrorMessage] = useState<string>('');

  const [values, setValues] = useState({
    username: '',
    password: '',
    remember: 'false',
  });

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, { data: { login: userData } }) {
      context.login(userData);
      navigate('/app/profile');
    },
    onError(err) {
      console.log(values);
      console.error('GraphQL Mutation Error:', err);
      console.log('GraphQL Errors:', err.graphQLErrors);
      setErrors(err.graphQLErrors);
      const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      const errorMessage = Object.values(errorObject).flat().join(', ');
      setErrorMessage(errorMessage);
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
    },

    variables: values,
  });

  function loginUserCallback() {
    loginUser();
  }

  const handleLogin = (e: any) => {
    setShowErrorsList([]);
    console.log('Variables before mutation:', values);
    if (userName == '' || password == '') {
      return null;
    } else {
      e.preventDefault();
      console.log('The name is ' + userName);
      // fetch
      loginUserCallback();
    }
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

      <form onSubmit={handleLogin} className='login-form-container'>
        <h1 className='login-form-brand'>
          <Link to='/'>Connexx ChainLink</Link>
        </h1>

        <div className='login-form-input'>
          <label htmlFor='username'>Username or email</label>
          <input
            id='username'
            onChange={handleNameChange}
            type='text'
            value={userName}
          />
        </div>

        <div className='login-form-input'>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            onChange={handlePasswordChange}
            type='password'
            value={password}
          />
        </div>

        <div onClick={handleLogin} className='login-form-login-btn'>
          <Button disabled={userName == '' || password == ''} type='primary'>
            Login
          </Button>
        </div>
        <span className='login-form-to-signup'>
          Don't have an account?
          <span>
            <Link to='/signup'>Sign up</Link>
          </span>
        </span>
      </form>
      <Footer absolute />
    </div>
  );
};

const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!, $remember: String!) {
    login(
      loginInput: {
        password: $password
        username: $username
        remember: $remember
      }
    ) {
      username
      loginToken
    }
  }
`;
export default LoginPage;
