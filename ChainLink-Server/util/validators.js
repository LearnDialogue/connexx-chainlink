module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    sex,
    birthday,
    weight,
    experience,
    FTP,
    metric,
  ) => {
    const errors = {};

    const nameValidator = /^[a-zA-Z ',.-]{1,20}$/;
    const usernameValidator = /^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/i;
    const emailRegex = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,12})$/;
    const passwordValidator = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/;
    const isoValidator = /^\d{4}-\d{2}-\d{2}$/; // ISO format: YYYY-MM-DD
    const weightValidator = /^\d+$/;

    if (username.trim() === "") {
        errors.username = "Username is required.";
    } else {
        if (!username.match(usernameValidator)) {
            errors.username =
            "Username must be at least 1 characters, max 20. No special characters, except for periods (.) and underscores (_).";
        }
    }

    if (email.trim() === "") {
        errors.email = "Email is required.";
    } else {
        if (!email.match(emailRegex)) {
            errors.email = "Invalid email address.";
        }
    }

    if (password === "") {
        errors.password = "Password is required.";
    } else if (!password.match(passwordValidator)) {
        errors.password =
        "Passwords must be at least 8 characters. It must contain at least one lowercase character, one uppercase character, one number, and one special character.";
    } else if (password !== confirmPassword) {
        errors.confirmPassword = "Password and Confirm Password must match.";
    }
      
    if (firstName.trim() === "") {
      errors.firstName = "First name is required.";
    } else {
      if (!firstName.match(nameValidator)) {
        errors.firstName =
          "First Name must be at least 1 character, max 20. No special characters or numbers.";
      }
    }
  
    if (lastName.trim() === "") {
      errors.lastName = "Last Name is required.";
    } else {
      if (!lastName.match(nameValidator)) {
        errors.lastName =
          "Last name must be at least 1 character, max 20. No special characters or numbers.";
      }
    }
  
    if (sex.trim() === "") {
        errors.sex = "Sex is required.";
    }

    if (birthday.trim() === "") {
        errors.birthday = "Birthday is required.";
    } else if (!birthday.match(isoValidator)) {
        errors.birthday = "Birthday must be in YYYY-MM-DD format.";
    }

    weight = weight.toString();
    if (weight.trim() === "") {
        errors.weight = "Weight is required.";
    } else if (!weight.match(weightValidator)) {
        errors.weight = "Weight must be an integer value.";
    }

    if (experience.trim() === "") {
        errors.experience = "Experience is required.";
    }

    FTP = FTP.toString();
    if (FTP.trim() === "") {
      errors.FTP = "FTP is required.";
    }

    metric = metric.toString();
    if (metric.trim() === "") {
        errors.metric = "Metric is required.";
    } else if (metric.trim() !== "true" && metric.trim() !== "false") {
        errors.metric = "Metric must be in 'true' or 'false' format.";
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1,
    };
  };
  
  module.exports.validateLoginInput = (username, password) => {
    const errors = {};

    if (username.trim() === '') {
      errors.username = 'Username must not be empty';
    }
    if (password.trim() === '') {
      errors.password = 'Password must not be empty';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
  };

  module.exports.validateUsername = (username) => {
    const errors = {};

    const usernameValidator = /^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/i;

    if (username.trim() === "") {
      errors.username = "Username is required.";
    } else {
        if (!username.match(usernameValidator)) {
            errors.username =
            "Username must be at least 1 characters, max 20. No special characters, except for periods (.) and underscores (_).";
        }
    }

    return {
      errors,
      valid: Object.keys(errors).length < 1,
    };
  };

  module.exports.validateEmail = (email) => {
    const errors = {};

    const emailRegex = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,12})$/;

    if (email.trim() === "") {
      errors.email = "Email is required.";
    } else {
        if (!email.match(emailRegex)) {
            errors.email = "Invalid email address.";
        }
    }

    return {
      errors,
      valid: Object.keys(errors).length < 1,
    };
  };

  module.exports.validateEditProfileInput = (
    username,
    email,
    firstName,
    lastName,
    sex,
    birthday,
    weight,
    experience,
    FTP,
    location,
    radius,
    metric,
  ) => {
    const errors = {};

    const nameValidator = /^[a-zA-Z ',.-]{1,20}$/;
    const usernameValidator = /^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/i;
    const emailRegex = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,12})$/;
    const isoValidator = /^\d{4}-\d{2}-\d{2}$/; // ISO format: YYYY-MM-DD
    const weightValidator = /^\d+$/;

    if (username.trim() === "") {
        errors.username = "Username is required.";
    } else {
        if (!username.match(usernameValidator)) {
            errors.username =
            "Username must be at least 1 characters, max 20. No special characters, except for periods (.) and underscores (_).";
        }
    }

    if (email.trim() === "") {
        errors.email = "Email is required.";
    } else {
        if (!email.match(emailRegex)) {
            errors.email = "Invalid email address.";
        }
    }
      
    if (firstName.trim() === "") {
      errors.firstName = "First name is required.";
    } else {
      if (!firstName.match(nameValidator)) {
        errors.firstName =
          "First Name must be at least 1 character, max 20. No special characters or numbers.";
      }
    }
  
    if (lastName.trim() === "") {
      errors.lastName = "Last Name is required.";
    } else {
      if (!lastName.match(nameValidator)) {
        errors.lastName =
          "Last name must be at least 1 character, max 20. No special characters or numbers.";
      }
    }
  
    if (sex.trim() === "") {
        errors.sex = "Sex is required.";
    }

    if (birthday.trim() === "") {
        errors.birthday = "Birthday is required.";
    } else if (!birthday.match(isoValidator)) {
        errors.birthday = "Birthday must be in YYYY-MM-DD format.";
    }

    weight = weight.toString();
    if (weight.trim() === "") {
        errors.weight = "Weight is required.";
    } else if (!weight.match(weightValidator)) {
        errors.weight = "Weight must be an integer value.";
    }

    if (experience.trim() === "") {
      errors.experience = "Experience is required.";
    }

    FTP = FTP.toString();
    if (FTP.trim() === "") {
      errors.FTP = "FTP is required.";
    }

    metric = metric.toString();
    if (metric.trim() === "") {
        errors.metric = "Metric is required.";
    } else if (metric.trim() !== "true" && metric.trim() !== "false") {
        errors.metric = "Metric must be in 'true' or 'false' format.";
    }

    if (location.trim() === "") {
      errors.location = "Location is requried.";
    }

    radius = Number(radius);
    if (isNaN(radius) || radius < 1 || radius > 100) {
      errors.radius = "Radius must be between 1 and 100 km.";
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1,
    };
  };