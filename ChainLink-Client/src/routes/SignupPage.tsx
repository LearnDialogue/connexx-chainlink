import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { useState, useEffect, useContext } from 'react';
import '../styles/signup.css';
import LoaderWheel from '../components/LoaderWheel';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { AuthContext } from '../context/auth';
import Footer from '../components/Footer';

const SignupPage = () => {
  const context = useContext(AuthContext);

  const passwordValidator =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/;

  const [showErrorsList, setShowErrorsList] = useState<string[]>([]);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [username, setUserName] = useState<string>('');
  const [email, setEmailAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [reTypedPassword, setReTypedPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [FTP, setFTP] = useState<string>('');
  const [experience, setExperience] = useState<string>('');

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [currentRegisterPage, setCurrentRegisterPage] = useState<
    'Page1' | 'Page2'
  >('Page1');
  const [registerErrorMessage, setRegisterErrorMessage] = useState<string>('');

  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    sex: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    metric: false,
    weight: 0,
    FTP: 0.0,
    experience: '',
  });

  // Register mutation
  const [addUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, { data: { register: userData } }) {
      context.login(userData);
      navigate('/app/connect-with-strava');
    },
    onCompleted() {
      setErrors({});
    },
    onError(err) {
      console.error('GraphQL Mutation Error:', err);
      console.log('GraphQL Errors:', err.graphQLErrors);
      setErrors(err.graphQLErrors);
      const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      const errorMessage = Object.values(errorObject).flat().join(', ');
      setRegisterErrorMessage(errorMessage);
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
    },

    variables: values,
  });

  const [usernameError, setUsernameError] = useState({});
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>(true);
  const [emailError, setEmailError] = useState({});
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>('');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
  const [isUsernameLoading, setIsUsernameLoading] = useState<boolean>(true);
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(true);
  const [validateUsername, { loading: usernameLoading, error, data }] =
    useLazyQuery(VALIDATE_USERNAME, {
      onCompleted() {
        setUsernameError({});
        setIsUsernameLoading(usernameLoading);
      },
      onError: (error) => {
        setUsernameError(error);
        const errorObject = (error.graphQLErrors[0] as any)?.extensions
          ?.exception?.errors;
        const errorMessage = Object.values(errorObject).flat().join(', ');
        setUsernameErrorMessage(errorMessage);
        setShowErrorsList((prevErrorsList) => [
          ...prevErrorsList,
          errorMessage,
        ]);
      },
    });

  const [
    validateEmail,
    { loading: emailLoading, error: emailErr, data: emailData },
  ] = useLazyQuery(VALIDATE_EMAIL, {
    onCompleted() {
      setEmailError({});
      setIsEmailLoading(emailLoading);
    },
    onError: (error) => {
      setEmailError(error);
      const errorObject = (error.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      const errorMessage = Object.values(errorObject).flat().join(', ');
      setEmailErrorMessage(errorMessage);
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
    },
  });

  function registerUser() {
    addUser();
  }

  const handleUsernameChange = (e: any) => {
    const updatedUsername = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      username: updatedUsername,
    }));
    setUserName(e.target.value);
  };

  const handleEmailAddressChange = (e: any) => {
    const updatedEmail = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      email: updatedEmail,
    }));
    setEmailAddress(e.target.value);
  };

  const handlePasswordChange = (e: any) => {
    const updatedPassword = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      password: updatedPassword,
    }));
    setPassword(e.target.value);
  };

  const handleReTypedPasswordChange = (e: any) => {
    const confirmedPassword = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      confirmPassword: confirmedPassword,
    }));
    setReTypedPassword(e.target.value);
  };

  const handleFirstNameChange = (e: any) => {
    const updatedFirstName = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      firstName: updatedFirstName,
    }));
    setFirstName(e.target.value);
  };
  const handleLastNameChange = (e: any) => {
    const updatedLastName = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      lastName: updatedLastName,
    }));
    setLastName(e.target.value);
  };
  const handleSexChange = (e: any) => {
    const updatedSex = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      sex: updatedSex,
    }));
    setSex(e.target.value);
  };
  const handleWeightChange = (e: any) => {
    const updatedWeight = parseInt(e.target.value, 10);
    setValues((prevValues) => ({
      ...prevValues,
      weight: updatedWeight,
    }));
    setWeight(e.target.value);
  };
  const handleBirthdayChange = (e: any) => {
    const updatedBirthday = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      birthday: updatedBirthday,
    }));
    setBirthday(e.target.value);
  };

  const handleFTPChange = (e: any) => {
    let updatedFTP = 0.0;
    updatedFTP = parseFloat(e.target.value);
    if (!isNaN(updatedFTP) && updatedFTP >= 0) {
      setValues((prevValues) => ({
        ...prevValues,
        FTP: updatedFTP,
      }));
    }
    if (ftpToggle) {
      setFTP('0');
    } else {
      setFTP(e.target.value);
    }
  };

  const [ftpToggle, setFTPToggle] = useState<boolean>(false);

  const handleFTPToggle = (e: any) => {
    if (e.target.id === 'ftp-toggle') {
      if (ftpToggle) {
        setFTPToggle(false);
      } else {
        setFTPToggle(true);
        setValues((prevValues) => ({
          ...prevValues,
          FTP: 0,
        }));
        setFTP('0');
      }
    }
  };

  const handleExperienceChange = (e: any) => {
    const updatedExperience = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      experience: updatedExperience,
    }));
    setExperience(e.target.value);
  };

  // Try to register user
  const handleSignUp = () => {
    registerUser();
  };

  const enableSignupButton: () => boolean = () => {
    return (
      values.firstName != '' &&
      values.lastName != '' &&
      values.sex != '' &&
      values.birthday != '' &&
      weight != ''
    );
  };

  const enableContinueButton: () => boolean = () => {
    return (
      values.username != '' &&
      values.email != '' &&
      values.password != '' &&
      values.confirmPassword != '' &&
      values.password == values.confirmPassword
    );
  };

  // Check username and email are valid to continue registering
  const handleContinue = async () => {
    setShowErrorsList([]);

    const [usernameResult, emailResult] = await Promise.all([
      validateUsername({ variables: { username } }),
      validateEmail({ variables: { email } }),
    ]);

    if (!usernameResult.error && usernameResult.data.validUsername === false) {
      setIsUsernameValid(false);
      setShowErrorsList((prevErrorsList) => [
        ...prevErrorsList,
        'Username already exists.',
      ]);
    } else {
      setIsUsernameValid(true);
    }

    if (!emailResult.error && emailResult.data.validEmail === false) {
      setIsEmailValid(false);
      setShowErrorsList((prevErrorsList) => [
        ...prevErrorsList,
        'Email address is already in use.',
      ]);
    } else {
      setIsEmailValid(true);
    }

    if (password === '') {
      setShowErrorsList((prevErrorsList) => [
        ...prevErrorsList,
        'Password is required',
      ]);
    } else if (!password.match(passwordValidator)) {
      setShowErrorsList((prevErrorsList) => [
        ...prevErrorsList,
        'Passwords must be at least 8 characters, must contain at least one lowercase character, one uppercase character, one number, and one special character.',
      ]);
    } else if (password !== reTypedPassword) {
      setShowErrorsList((prevErrorsList) => [
        ...prevErrorsList,
        'Password and Confirm Password must match.',
      ]);
    } else {
      if (
        usernameResult.data.validUsername &&
        emailResult.data.validEmail &&
        !emailResult.error &&
        !usernameResult.error
      ) {
        setCurrentRegisterPage('Page2');
      }
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

  const checkPasswordsMatch = () => {
    if (values.password == '' || values.confirmPassword == '') return null;
    if (values.password != values.confirmPassword)
      return (
        <span>
          <i className='fa-solid fa-circle-xmark'></i>
        </span>
      );
    return (
      <span>
        <i className='fa-solid fa-circle-check'></i>
      </span>
    );
  };

  if (loading) {
    return (
      <div className='signup-loading'>
        <LoaderWheel />
      </div>
    );
  }

  return (
    // Page 1
    <div>
      {showErrorsList.length > 0 ? displayErrors() : null}

      {currentRegisterPage === 'Page1' && (
        <div className='signup-main-container'>
          <div className='signup-form-container'>
            <h1 className='signup-form-brand'>
              <Link to='/'>Connexx ChainLink</Link>
            </h1>
            <span className='signup-strava-account-warning'>
              * A Strava account is required.
            </span>
            <span className='signup-strava-account-warning'>
              Don't have one? &nbsp;{' '}
              <Link target='_blank' to='https://www.strava.com/register/free'>
                Create one here.
              </Link>
            </span>

            <div className='signup-form-input'>
              <label>Username</label>
              <input
                onChange={handleUsernameChange}
                type='text'
                value={username}
              />
              <span className='signup-form-input-hint'>
                * the username does not have to match your Strava account
              </span>
            </div>

            <div className='signup-form-input'>
              <label>Email address</label>
              <input
                onChange={handleEmailAddressChange}
                type='text'
                value={email}
              />
            </div>

            <div className='signup-form-input'>
              <label>Password {checkPasswordsMatch()}</label>
              <div className='signup-form-input-password'>
                <input
                  onChange={handlePasswordChange}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <i className='fa-solid fa-eye'></i>
                  ) : (
                    <i className='fa-solid fa-eye-slash'></i>
                  )}
                </span>
              </div>
            </div>

            <div className='signup-form-input'>
              <label>Re-type Password {checkPasswordsMatch()}</label>
              <div className='signup-form-input-password'>
                <input
                  onChange={handleReTypedPasswordChange}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={reTypedPassword}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <i className='fa-solid fa-eye'></i>
                  ) : (
                    <i className='fa-solid fa-eye-slash'></i>
                  )}
                </span>
              </div>
            </div>

            <div className='signup-form-signup-btn'>
              <div onClick={handleContinue}>
                <Button disabled={!enableContinueButton()} type='primary'>
                  Continue
                </Button>
              </div>
              <span className='signup-form-to-signup'>
                Already have an account?
                <span>
                  <Link to='/login'>Login</Link>
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
      {currentRegisterPage === 'Page2' && (
        <div className='signup-main-container'>
          {showErrorsList.length > 0 ? displayErrors() : null}

          <div className='signup-form-container'>
            <div
              className='signup-back-btn'
              onClick={() => setCurrentRegisterPage('Page1')}
            >
              <i className='fa-solid fa-arrow-left'></i>
              <span>Back</span>
            </div>

            <h1 className='signup-form-brand'>
              <Link to='/'>Connexx ChainLink</Link>
            </h1>

            {registerErrorMessage !== '' && (
              <div className='signup-form-input'>
                <label>{registerErrorMessage}</label>
              </div>
            )}

            <div className='signup-form-input'>
              <label>First Name</label>
              <input
                onChange={handleFirstNameChange}
                type='text'
                value={firstName}
              />
            </div>

            <div className='signup-form-input'>
              <label>Last Name</label>
              <input
                onChange={handleLastNameChange}
                type='text'
                value={lastName}
              />
            </div>

            <div className='signup-form-input'>
              <label>Gender</label>
              <select onChange={handleSexChange} value={sex}>
                <option value='' disabled>
                  -- Select gender --
                </option>
                <option value='gender-man'>Man</option>
                <option value='gender-woman'>Woman</option>
                <option value='gender-non-binary'>Non-binary</option>
                <option value='gender-prefer-not-to-say'>
                  Prefer not to say
                </option>
              </select>
            </div>

            <div className='signup-form-input'>
              <label>Weight (kg)</label>
              <input
                onChange={handleWeightChange}
                type='number'
                value={weight}
              />
            </div>

            <div className='signup-form-input'>
              <label htmlFor='ride-date'>Date of birth</label>
              <input
                id='ride-date'
                onChange={handleBirthdayChange}
                type='date'
                value={birthday}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className='signup-form-input signup-form-input-checkbox'>
              <label htmlFor='signup-form-ftp'>
                FTP
                <span className='tooltip'>
                  <i
                    className='fa-solid fa-circle-info'
                    style={{ marginLeft: '0px' }}
                  ></i>
                  <span className='tooltiptext'>
                    FTP stands for Functional Threshold Power. It is a measure
                    of the power you can hold for an hour and is measured in
                    Watts.
                  </span>
                </span>
              </label>
              <input
                id='signup-ftp'
                onChange={handleFTPChange}
                type='number'
                value={FTP}
                readOnly={ftpToggle}
              />
              <label htmlFor='ftp-not-sure'>
                <input
                  name='ftp-toggle'
                  onChange={handleFTPToggle}
                  id='ftp-toggle'
                  type='checkbox'
                  checked={ftpToggle}
                />{' '}
                I'm not sure
              </label>
            </div>
            <div className='signup-form-input'>
              <label>Experience</label>
              <select onChange={handleExperienceChange} value={experience}>
                <option value='' disabled>
                  -- Select Experience --
                </option>
                <option value='Beginner'>Beginner</option>
                <option value='Intermediate'>Intermediate</option>
                <option value='Advanced'>Advanced</option>
                <option value='Expert'>Expert</option>
              </select>
            </div>

            <div className='signup-form-signup-btn'>
              <div onClick={handleSignUp}>
                <Button disabled={!enableSignupButton()} type='primary'>
                  Sign Up
                </Button>
              </div>
              <span className='signup-form-to-signup'>
                Already have an account?
                <span>
                  <Link to='/login'>Login</Link>
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
      <Footer absolute />
    </div>
  );
};
const REGISTER_USER = gql`
  mutation register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $metric: Boolean!
    $sex: String!
    $username: String!
    $weight: Int!
    $password: String!
    $confirmPassword: String!
    $birthday: String!
    $FTP: Float!
    $experience: String!
  ) {
    register(
      registerInput: {
        birthday: $birthday
        password: $password
        confirmPassword: $confirmPassword
        email: $email
        firstName: $firstName
        lastName: $lastName
        metric: $metric
        sex: $sex
        username: $username
        weight: $weight
        FTP: $FTP
        experience: $experience
      }
    ) {
      username
      loginToken
    }
  }
`;

const VALIDATE_USERNAME = gql`
  query validUsername($username: String!) {
    validUsername(username: $username)
  }
`;

const VALIDATE_EMAIL = gql`
  query validEmail($email: String!) {
    validEmail(email: $email)
  }
`;

export default SignupPage;
