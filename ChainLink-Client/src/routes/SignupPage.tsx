import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useState, useContext } from "react";
import "../styles/signup.css";
import LoaderWheel from "../components/LoaderWheel";
import { useMutation, useLazyQuery } from "@apollo/client";
import { AuthContext } from "../context/auth";
import Footer from "../components/Footer";
import { REGISTER_USER } from "../graphql/mutations/userMutations";
import {
  VALIDATE_EMAIL,
  VALIDATE_USERNAME,
} from "../graphql/queries/userQueries";

const SignupPage = () => {
  const context = useContext(AuthContext);

  const passwordValidator =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*.\-]).{8,}$/;

  const [showErrorsList, setShowErrorsList] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [username, setUserName] = useState<string>("");
  const [email, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [reTypedPassword, setReTypedPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [FTP, setFTP] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [isPrivate, setPrivacy] = useState<boolean>(false);
  const [bikeTypes, setBikeTypes] = useState<string[]>([]);

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [currentRegisterPage, setCurrentRegisterPage] = useState<
    "Page1" | "Page2"
  >("Page1");
  const [registerErrorMessage, setRegisterErrorMessage] = useState<string>("");

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    metric: false,
    weight: 0,
    FTP: 0.0,
    experience: "",
    isPrivate: false,
    bikeTypes: [] as string[],
  });

  // ✅ Password live validation states
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [touchedPassword, setTouchedPassword] = useState<boolean>(false);

  const passwordRulesCheck = (pwd: string) => ({
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[#?!@$%^&*.\-]/.test(pwd),
  });

  // Register mutation
  const [addUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, { data: { register: userData } }) {
      context.login(userData);
      navigate("/app/connect-with-strava");
    },
    onCompleted() {
      setErrors({});
    },
    onError(err) {
      console.error("GraphQL Mutation Error:", err);
      setErrors(err.graphQLErrors);
      const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      const errorMessage = Object.values(errorObject).flat().join(", ");
      setRegisterErrorMessage(errorMessage);
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
    },
    variables: values,
  });

  const [usernameError, setUsernameError] = useState({});
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>(true);
  const [emailError, setEmailError] = useState({});
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>("");
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>("");
  const [isUsernameLoading, setIsUsernameLoading] = useState<boolean>(true);
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(true);

  const [validateUsername, { loading: usernameLoading }] =
    useLazyQuery(VALIDATE_USERNAME, {
      onCompleted() {
        setUsernameError({});
        setIsUsernameLoading(usernameLoading);
      },
      onError: (error) => {
        setUsernameError(error);
        const errorObject = (error.graphQLErrors[0] as any)?.extensions
          ?.exception?.errors;
        const errorMessage = Object.values(errorObject).flat().join(", ");
        setUsernameErrorMessage(errorMessage);
        setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
      },
    });

  const [validateEmail, { loading: emailLoading }] = useLazyQuery(VALIDATE_EMAIL, {
    onCompleted() {
      setEmailError({});
      setIsEmailLoading(emailLoading);
    },
    onError: (error) => {
      setEmailError(error);
      const errorObject = (error.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      const errorMessage = Object.values(errorObject).flat().join(", ");
      setEmailErrorMessage(errorMessage);
      setShowErrorsList((prevErrorsList) => [...prevErrorsList, errorMessage]);
    },
  });

  function registerUser() {
    addUser();
  }

  const handleUsernameChange = (e: any) => {
    const updatedUsername = e.target.value;
    setValues((prevValues) => ({ ...prevValues, username: updatedUsername }));
    setUserName(e.target.value);
  };

  const handleEmailAddressChange = (e: any) => {
    const updatedEmail = e.target.value;
    setValues((prevValues) => ({ ...prevValues, email: updatedEmail }));
    setEmailAddress(e.target.value);
  };

  const handlePasswordChange = (e: any) => {
    const updatedPassword = e.target.value;
    setValues((prevValues) => ({ ...prevValues, password: updatedPassword }));
    setPassword(updatedPassword);

    const checks = passwordRulesCheck(updatedPassword);
    const overallValid =
      checks.length && checks.upper && checks.lower && checks.number && checks.special;

    setIsPasswordValid(overallValid);
    if (!touchedPassword) setTouchedPassword(true);
  };

  const handleReTypedPasswordChange = (e: any) => {
    const confirmedPassword = e.target.value;
    setValues((prevValues) => ({ ...prevValues, confirmPassword: confirmedPassword }));
    setReTypedPassword(e.target.value);
  };

  const handleFirstNameChange = (e: any) => {
    const updatedFirstName = e.target.value;
    setValues((prevValues) => ({ ...prevValues, firstName: updatedFirstName }));
    setFirstName(e.target.value);
  };
  const handleLastNameChange = (e: any) => {
    const updatedLastName = e.target.value;
    setValues((prevValues) => ({ ...prevValues, lastName: updatedLastName }));
    setLastName(e.target.value);
  };
  const handleSexChange = (e: any) => {
    const updatedSex = e.target.value;
    setValues((prevValues) => ({ ...prevValues, sex: updatedSex }));
    setSex(e.target.value);
  };
  const handleWeightChange = (e: any) => {
    const updatedWeight = parseInt(e.target.value, 10);
    setValues((prevValues) => ({ ...prevValues, weight: updatedWeight }));
    setWeight(e.target.value);
  };
  const handleBirthdayChange = (e: any) => {
    const updatedBirthday = e.target.value;
    setValues((prevValues) => ({ ...prevValues, birthday: updatedBirthday }));
    setBirthday(e.target.value);
  };

  const handleFTPChange = (e: any) => {
    let updatedFTP = parseFloat(e.target.value);
    if (!isNaN(updatedFTP) && updatedFTP >= 0) {
      setValues((prevValues) => ({ ...prevValues, FTP: updatedFTP }));
    }
    if (ftpToggle) {
      setFTP("0");
    } else {
      setFTP(e.target.value);
    }
  };

  const [ftpToggle, setFTPToggle] = useState<boolean>(false);

  const handleFTPToggle = (e: any) => {
    if (e.target.id === "ftp-toggle") {
      if (ftpToggle) {
        setFTPToggle(false);
      } else {
        setFTPToggle(true);
        setValues((prevValues) => ({ ...prevValues, FTP: 0 }));
        setFTP("0");
      }
    }
  };

  const handleExperienceChange = (e: any) => {
    const updatedExperience = e.target.value;
    setValues((prevValues) => ({ ...prevValues, experience: updatedExperience }));
    setExperience(e.target.value);
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prevValues) => ({ ...prevValues, isPrivate: e.target.checked }));
    setPrivacy(e.target.checked);
  };

  const handleBikeCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, id } = event.target;
    let newBikes = [...bikeTypes];
    if (id == "bike") {
      if (checked) {
        newBikes.push(name);
      } else {
        newBikes = newBikes.filter((item) => item !== name);
      }
      setBikeTypes(newBikes);
    }
    setValues((prevValues) => ({ ...prevValues, bikeTypes: newBikes }));
  };

  const handleSignUp = () => {
    registerUser();
  };

  const enableSignupButton: () => boolean = () => {
    return (
      values.firstName !== "" &&
      values.lastName !== "" &&
      values.sex !== "" &&
      values.birthday !== "" &&
      weight !== ""
    );
  };

  const enableContinueButton: () => boolean = () => {
    return (
      values.username !== "" &&
      values.email !== "" &&
      values.password !== "" &&
      values.confirmPassword !== "" &&
      values.password === values.confirmPassword &&
      isPasswordValid
    );
  };

  const handleContinue = async () => {
    setShowErrorsList([]);

    const [usernameResult, emailResult] = await Promise.all([
      validateUsername({ variables: { username } }),
      validateEmail({ variables: { email } }),
    ]);

    if (!usernameResult.error && usernameResult.data.validUsername === false) {
      setIsUsernameValid(false);
      setShowErrorsList((prev) => [...prev, "Username already exists."]);
    } else {
      setIsUsernameValid(true);
    }

    if (!emailResult.error && emailResult.data.validEmail === false) {
      setIsEmailValid(false);
      setShowErrorsList((prev) => [...prev, "Email address is already in use."]);
    } else {
      setIsEmailValid(true);
    }

    if (password === "") {
      setShowErrorsList((prev) => [...prev, "Password is required"]);
    } else if (!password.match(passwordValidator)) {
      setShowErrorsList((prev) => [
        ...prev,
        "Passwords must be at least 8 characters, must contain at least one lowercase character, one uppercase character, one number, and one special character.",
      ]);
    } else if (password !== reTypedPassword) {
      setShowErrorsList((prev) => [...prev, "Password and Confirm Password must match."]);
    } else {
      if (
        usernameResult.data.validUsername &&
        emailResult.data.validEmail &&
        !emailResult.error &&
        !usernameResult.error
      ) {
        setCurrentRegisterPage("Page2");
      }
    }
  };

  const displayErrors = () => (
    <div className="signup-errors">
      <div className="signup-errors-close-button" onClick={() => setShowErrorsList([])}>
        ✕
      </div>
      <div className="signup-errors-list">
        {showErrorsList.map((err, index) => (
          <div key={index}>* {err}</div>
        ))}
      </div>
    </div>
  );

  const checkPasswordsMatch = () => {
    if (values.password == "" || values.confirmPassword == "") return null;
    if (values.password != values.confirmPassword)
      return (
        <span>
          <i className="fa-solid fa-circle-xmark"></i>
        </span>
      );
    return (
      <span>
        <i className="fa-solid fa-circle-check"></i>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="signup-loading">
        <LoaderWheel />
      </div>
    );
  }

  return (
    <div>
      {showErrorsList.length > 0 ? displayErrors() : null}

      {currentRegisterPage === "Page1" && (
        <div className="signup-main-container">
          <div className="signup-form-container">
            <h1 className="signup-form-brand">
              <Link to="/">Connexx ChainLink</Link>
            </h1>
            <span className="signup-strava-account-warning">
              * A Strava account is required.
            </span>
            <span className="signup-strava-account-warning">
              Don't have one? &nbsp;
              <Link target="_blank" to="https://www.strava.com/register/free">
                Create one here.
              </Link>
            </span>

            <div className="signup-form-input">
              <label>Username</label>
              <input onChange={handleUsernameChange} type="text" value={username} />
              <span className="signup-form-input-hint">
                * the username does not have to match your Strava account
              </span>
            </div>

            <div className="signup-form-input">
              <label>Email address</label>
              <input onChange={handleEmailAddressChange} type="text" value={email} />
            </div>

            {/*  Password input with checklist */}
            <div className="signup-form-input">
              <label>Password {checkPasswordsMatch()}</label>
              <div className="signup-form-input-password">
                <input
                  onChange={handlePasswordChange}
                  onBlur={() => setTouchedPassword(true)}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  className={!touchedPassword ? "" : isPasswordValid ? "valid" : "invalid"}
                />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <i className="fa-solid fa-eye"></i>
                  ) : (
                    <i className="fa-solid fa-eye-slash"></i>
                  )}
                </span>
              </div>
              {touchedPassword && <PasswordChecklist password={password} />}
            </div>

            <div className="signup-form-input">
              <label>Re-type Password {checkPasswordsMatch()}</label>
              <div className="signup-form-input-password">
                <input
                  onChange={handleReTypedPasswordChange}
                  type={showConfirmPassword ? "text" : "password"}
                  value={reTypedPassword}
                />
                <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <i className="fa-solid fa-eye"></i>
                  ) : (
                    <i className="fa-solid fa-eye-slash"></i>
                  )}
                </span>
              </div>
            </div>

            <div className="signup-form-signup-btn">
              <div onClick={handleContinue}>
                <Button disabled={!enableContinueButton()} type="primary">
                  Continue
                </Button>
              </div>
              <span className="signup-form-to-signup">
                Already have an account?
                <span>
                  <Link to="/login">Login</Link>
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {currentRegisterPage === "Page2" && (
        <div className="signup-main-container">
          {/* ... unchanged page 2 fields ... */}
        </div>
      )}
      <Footer absolute />
    </div>
  );
};

const PasswordChecklist = ({ password }: { password: string }) => {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[#?!@$%^&*.\-]/.test(password),
  };

  const Item = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={ok ? "pw-rule ok" : "pw-rule bad"}>
      <i className={ok ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} />
      <span>{label}</span>
    </li>
  );

  return (
    <ul className="pw-rules">
      <Item ok={checks.length} label="At least 8 characters" />
      <Item ok={checks.upper} label="At least 1 uppercase letter" />
      <Item ok={checks.lower} label="At least 1 lowercase letter" />
      <Item ok={checks.number} label="At least 1 number" />
      <Item ok={checks.special} label="At least 1 special character (#?!@$%^&*.-)" />
    </ul>
  );
};

export default SignupPage;