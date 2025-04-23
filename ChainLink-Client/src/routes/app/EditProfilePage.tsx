import { useContext, useEffect, useState } from "react";
import Button from "../../components/Button";
import { useMutation, useQuery } from "@apollo/client";
import { AuthContext } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/edit-profile.css";
import Footer from "../../components/Footer";
import { DELETE_USER } from "../../graphql/mutations/userMutations";
import { EDIT_USER } from "../../graphql/mutations/userMutations";
import { FETCH_USER_BY_NAME } from "../../graphql/queries/userQueries";

const EditProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const context = useContext(AuthContext);
  const { data: userData, refetch } = useQuery(FETCH_USER_BY_NAME, {
    variables: {
      username: user?.username,
    },
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [deleteWarningModal, setShowDeleteWarningModal] =
    useState<boolean>(false);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [radius, setRadius] = useState<string>("");
  const [FTP, setFTP] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [isPrivate, setPrivacy] = useState<boolean>(false);
  const [bikeTypes, setBikeTypes] = useState<string[]>([]);

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    username: "",
    email: "",
    birthday: "",
    metric: true,
    weight: 0,
    location: "",
    radius: 0,
    FTP: 0.0,
    experience: "",
    isPrivate: false,
    bikeTypes: [""],
  });

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFirstName = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      firstName: updatedFirstName,
    }));
    setFirstName(e.target.value);
  };
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLastName = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      lastName: updatedLastName,
    }));
    setLastName(e.target.value);
  };
  const handleSexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedSex = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      sex: updatedSex,
    }));
    setSex(e.target.value);
  };
  const handleWeightChange = (e: any) => {
    const weight = parseInt(e.target.value, 10);
    const updatedWeight = weight > 0 ? weight : 1;

    setValues((prevValues) => ({
      ...prevValues,
      weight: updatedWeight,
    }));
    setWeight(updatedWeight.toString());
  };
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedBirthday = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      birthday: updatedBirthday,
    }));
    setBirthday(e.target.value);
  };
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLocation = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      location: updatedLocation,
    }));
    setLocation(e.target.value);
  };
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedRadius = parseInt(e.target.value, 10);
    setValues((prevValues) => ({
      ...prevValues,
      radius: updatedRadius,
    }));
    setRadius(e.target.value);
  };

  // const handleFTPChange = (e: any) => {
  //     let updatedFTP = 0.0;
  //     updatedFTP = parseFloat(e.target.value);
  //     if(!isNaN(updatedFTP) && updatedFTP >= 0) {
  //         setValues((prevValues) => ({
  //         ...prevValues,
  //         FTP: updatedFTP,
  //         }));
  //     }
  //     if(ftpToggle) {
  //         setFTP("0");
  //     }
  //     else {
  //         setFTP(e.target.value);
  //     }
  // }

  const handleFTPChange = (e: any) => {
    let updatedFTP = 0.0;
    updatedFTP = parseInt(e.target.value);
    if (!isNaN(updatedFTP) && updatedFTP >= 0) {
      setValues((prevValues) => ({
        ...prevValues,
        FTP: updatedFTP,
      }));
      setFTP(updatedFTP.toString());
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        FTP: 0,
      }));
    }

    if (ftpToggle) setFTP("0");
  };

  const [ftpToggle, setFTPToggle] = useState<boolean>(false);

  const handleFTPToggle = (e: any) => {
    if (e.target.id === "not-sure") {
      if (ftpToggle) {
        setFTPToggle(false);
      } else {
        setFTPToggle(true);
        setValues((prevValues) => ({
          ...prevValues,
          FTP: 0,
        }));
        setFTP("0");
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

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedPrivacy = e.target.checked;
    setValues((prevValues) => ({
      ...prevValues,
      isPrivate: updatedPrivacy,
    }));
    setPrivacy(updatedPrivacy);
  };

  const handleButtonClick = () => {
    editUser();

    // Adding 2 second delay before redirecting to the profile page
    setTimeout(() => {
      navigate("/app/profile");
    }, 500);
  };

  const handleBikeCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked, id } = event.target;
    let newBikes: string[] = [...bikeTypes];

    if (checked && !newBikes.includes(name)) {
      newBikes.push(name);
      setBikeTypes(newBikes);
    } else if (!checked && newBikes.includes(name)) {
      newBikes = newBikes.filter((item) => item !== name);
      setBikeTypes(newBikes);
    }
    setValues((prevValues) => ({
      ...prevValues,
      bikeTypes: newBikes,
    }));
  };

  const token: string | null = localStorage.getItem("jwtToken");

  const [editUser] = useMutation(EDIT_USER, {
    onCompleted(data) {
      if (data.editProfile.loginToken) {
        context.login(data.editProfile);
      }
      refetch();
    },

    onError(err) {
      setErrors(err.graphQLErrors);
      const errorMessages = err.graphQLErrors.map((error) => error.message);
      setErrors(errorMessages);
    },
    variables: values,
  });

  useEffect(() => {
    if (userData) {
      const datePart = new Date(userData.getUser.birthday)
        .toISOString()
        .split("T")[0];

      if (userData.getUser.FTP === 0) {
        setFTPToggle(true);
      }

      setFirstName(userData.getUser.firstName);
      setLastName(userData.getUser.lastName);
      setSex(userData.getUser.sex);
      setBirthday(datePart);
      setWeight(userData.getUser.weight);
      setLocation(userData.getUser.locationName);
      setRadius(userData.getUser.radius);
      setFTP(userData.getUser.FTP);
      setExperience(userData.getUser.experience);
      setPrivacy(userData.getUser.isPrivate);
      setBikeTypes(userData.getUser.bikeTypes);

      setValues({
        firstName: userData.getUser.firstName,
        lastName: userData.getUser.lastName,
        sex: userData.getUser.sex,
        username: userData.getUser.username,
        email: userData.getUser.email,
        birthday: datePart,
        metric: true,
        weight: userData.getUser.weight,
        location: userData.getUser.locationName,
        radius: userData.getUser.radius,
        FTP: userData.getUser.FTP,
        experience: userData.getUser.experience,
        isPrivate: userData.getUser.isPrivate,
        bikeTypes: userData.getUser.bikeTypes,
      });
    }
  }, [userData]);

  const [deleteUser] = useMutation(DELETE_USER, {
    onError(err) {
      setErrors(err.graphQLErrors);
      const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception
        ?.errors;
      const errorMessage = Object.values(errorObject).flat().join(", ");
      setErrors(errorMessage);
    },
    onCompleted() {
      logout();
    },
  });

  const handleDeleteButtonClick = () => {
    setShowDeleteWarningModal(true);
  };

  const confirmDeleteUser = () => {
    deleteUser();
    setShowDeleteWarningModal(false);
  };

  return (
    <>
      {deleteWarningModal ? (
        <div className="delete-user-modal">
          <div className="delete-user-modal-container">
            <h2 style={{ textAlign: "center" }}>
              Are you sure you want to delete your account?
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                marginTop: 24,
              }}
            >
              <Button
                color="red"
                onClick={() => confirmDeleteUser()}
                width={40}
                type="primary"
              >
                Delete account
              </Button>
              <Button
                onClick={() => setShowDeleteWarningModal(false)}
                width={40}
                type="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="editprofile-main-container">
        <div className="editprofile-form-container">
          <h2>Edit Profile</h2>
          {/* we can always add this back later */}
          {/* <div className="editprofile-form-input" >
                        <span className="editprofile-form-input" ><b>Add a profile picture</b></span>
                        <input
                            type="file"
                            id="file-upload"
                            onChange={() => null}
                            accept="image/*"
                        />
                    </div> */}

          <div className="editprofile-form-input">
            <label htmlFor="editprofile-firstname">First Name</label>
            <input
              id="editprofile-firstname"
              onChange={handleFirstNameChange}
              type="text"
              value={firstName}
            />
          </div>

          <div className="editprofile-form-input">
            <label htmlFor="editprofile-lastname">Last Name</label>
            <input
              id="editprofile-lastname"
              onChange={handleLastNameChange}
              type="text"
              value={lastName}
            />
          </div>

          <div className="editprofile-form-input">
            <label htmlFor="editprofile-weight">Weight (kg)</label>
            <input
              id="editprofile-weight"
              onChange={handleWeightChange}
              type="number"
              value={weight}
            />
          </div>

          <div className="editprofile-form-input">
            <label htmlFor="editprofile-gender">Gender</label>
            <select
              id="editprofile-gender"
              value={sex}
              onChange={handleSexChange}
            >
              <option value="" disabled>
                -- Select gender --
              </option>
              <option value="gender-man">Man</option>
              <option value="gender-woman">Woman</option>
              <option value="gender-non-binary">Non-binary</option>
              <option value="gender-prefer-not-to-say">
                Prefer not to say
              </option>
            </select>
          </div>

          <div className="signup-form-input">
            <label htmlFor="editprofile-date">Date of birth</label>
            <input
              id="editprofile-date"
              onChange={handleBirthdayChange}
              type="date"
              value={birthday}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="editprofile-form-input">
            <label htmlFor="editprofile-ftp">
              FTP
              <span className="tooltip">
                <i className="fa-solid fa-circle-info"></i>
                <span className="tooltiptext">
                  FTP stands for Functional Threshold Power. It is a measure of
                  the power you can hold for an hour and is measured in Watts.
                </span>
              </span>
            </label>
            <input
              id="editprofile-ftp"
              onChange={handleFTPChange}
              type="number"
              value={FTP}
              readOnly={ftpToggle}
            />
            <label htmlFor="ftp-not-sure">
              <input
                name="not-sure"
                onChange={handleFTPToggle}
                id="not-sure"
                type="checkbox"
                checked={ftpToggle}
              />{" "}
              I'm not sure
            </label>
          </div>

          <div className="editprofile-form-input">
            <label>Experience</label>
            <select onChange={handleExperienceChange} value={experience}>
              <option value="" disabled>
                -- Select Experience --
              </option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="signup-form-input signup-form-input-checkbox">
            <label htmlFor="signup-form-privacy">
              Privacy
              <span className="tooltip">
                <i
                  className="fa-solid fa-circle-info"
                  style={{ marginLeft: "0px" }}
                ></i>
                <span className="tooltiptext">
                  A private profile will hide most information from other users.
                  Only your username and profile picture will be visible.
                </span>
              </span>
            </label>
            <label htmlFor="profile-privacy">
              <input
                name="privacy-toggle"
                onChange={handlePrivacyChange}
                id="privacy-toggle"
                type="checkbox"
                checked={isPrivate}
              />{" "}
              Make Profile Private
            </label>
          </div>

          <div className="editprofile-bike-types">
            Bike types
            <div>
              <div className="editprofile-bike-types-choice">
                <label htmlFor="mountain-bike">
                  <input
                    name="Mountain"
                    checked={bikeTypes.includes("Mountain")}
                    onChange={handleBikeCheckboxChange}
                    id="bike"
                    type="checkbox"
                  />{" "}
                  Mountain
                </label>
              </div>
              <div className="editprofile-bike-types-choice">
                <label htmlFor="road-bike">
                  <input
                    name="Road"
                    checked={bikeTypes.includes("Road")}
                    onChange={handleBikeCheckboxChange}
                    id="bike"
                    type="checkbox"
                  />{" "}
                  Road
                </label>
              </div>
              <div className="editprofile-bike-types-choice">
                <label htmlFor="hybrid-bike">
                  <input
                    name="Hybrid"
                    checked={bikeTypes.includes("Hybrid")}
                    onChange={handleBikeCheckboxChange}
                    id="bike"
                    type="checkbox"
                  />{" "}
                  Hybrid
                </label>
              </div>
              <div className="editprofile-bike-types-choice">
                <label htmlFor="touring-bike">
                  <input
                    name="Touring"
                    checked={bikeTypes.includes("Touring")}
                    onChange={handleBikeCheckboxChange}
                    id="bike"
                    type="checkbox"
                  />{" "}
                  Touring
                </label>
              </div>
              <div className="editprofile-bike-types-choice">
                <label htmlFor="gravel-bike">
                  <input
                    name="Gravel"
                    checked={bikeTypes.includes("Gravel")}
                    onChange={handleBikeCheckboxChange}
                    id="bike"
                    type="checkbox"
                  />{" "}
                  Gravel
                </label>
              </div>
            </div>
          </div>

          <div className="editprofile-form-input">
            <label htmlFor="editprofile-location">Location</label>
            <input
              id="editprofile-location"
              onChange={handleLocationChange}
              type="text"
              value={location}
            />
          </div>

          <div className="editprofile-form-input">
            <label htmlFor="editprofile-radius">
              Radius
              <span className="tooltip">
                <i className="fa-solid fa-circle-info"></i>
                <span className="tooltiptext">
                  This defines the default search area for exploring nearby
                  rides. Chainlink will automatically display upcoming rides
                  within this radius on your explore page.
                </span>
              </span>
            </label>
            <input
              id="editprofile-radius"
              onChange={handleRadiusChange}
              type="text"
              value={radius}
            />
          </div>

          <br></br>
          <Button onClick={handleButtonClick} type="primary">
            Submit
          </Button>
          <Button
            onClick={handleDeleteButtonClick}
            type="warning"
            marginTop={10}
          >
            Delete Profile
          </Button>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default EditProfile;
