import bcrypt from 'bcryptjs';

/**

Hash a password using bcrypt

// @param {string} password - Plain text password

// @returns {Promise<string>} Hashed password
*/
export const hashPassword = async (password) => {
    try {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password');
    }
};

/**

Compare a plain text password with a hashed password

@param {string} password - Plain text password

@param {string} hashedPassword - Hashed password from database

@returns {Promise<boolean>} True if passwords match
*/
export const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};



// Generate a random password (for testing or temporary passwords)

// @param {number} length - Length of password (default: 12)

// @returns {string} Random password

export const generateRandomPassword = (length = 12) => {
const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&';
let password = '';
for (let i = 0; i < length; i++) {
const randomIndex = Math.floor(Math.random() * charset.length);
password += charset[randomIndex];
}
return password;
};