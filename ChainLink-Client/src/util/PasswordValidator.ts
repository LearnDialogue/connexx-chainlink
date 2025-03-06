interface PasswordValidationResult {
	isValid: boolean;
	errorMessage?: string;
}

export const tryValidatePassword = (password: string): PasswordValidationResult => {
	const passwordValidator =
		/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/;

	if (password === '') {
		return { isValid: false, errorMessage: 'Password is required' };
	} else if (!password.match(passwordValidator)) {
		return {
			isValid: false,
			errorMessage:
				'Passwords must be at least 8 characters, must contain at least one lowercase character, one uppercase character, one number, and one special character.',
		};
	}

	return { isValid: true };
};