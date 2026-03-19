const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Defines the structure for user documents in MongoDB
 * 
 * Fields:
 * - username: Unique username for the user
 * - email: Unique email address
 * - password: Hashed password stored in database
 * - firstName: User's first name
 * - lastName: User's last name
 * - createdAt: Timestamp when user account was created
 * - updatedAt: Timestamp when user account was last updated
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't return password by default in queries
    },
    firstName: {
      type: String,
      required: [true, 'Please provide first name']
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name']
    }
  },
  { timestamps: true }
);

/**
 * Pre-save middleware to hash password before saving
 * Only hashes password if it's been modified or is new
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare provided password with hashed password in database
 * @param {string} providedPassword - The password provided by the user
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (providedPassword) {
  return await bcrypt.compare(providedPassword, this.password);
};

/**
 * Method to get user details without sensitive information
 * @returns {object} - User object without password field
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
