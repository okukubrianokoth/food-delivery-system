import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register
export const registerUser = async (req, res, next) => {
  const { name, password, phoneNumber } = req.body;
  const email = req.body.email?.toLowerCase();

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (!userExists.isVerified) {
        return res.status(400).json({ 
          message: "An account with this email exists but is not verified.", 
          notVerified: true 
        });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = await User.create({ 
      name, 
      email, 
      password, 
      phoneNumber,
      otp, 
      otpExpires 
    });

    let emailResult = null;
    let mailError = null;
    try {
      emailResult = await sendEmail({
        email: user.email,
        subject: "Verify Your Account",
        message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
      });
    } catch (error) {
      mailError = error;
      console.error("Mailer Error:", error.message);
    }

    const responsePayload = {
      message: mailError
        ? "Account created, but we couldn't send the verification email. Please use the preview link below or click 'Resend OTP'."
        : "Registration successful. Please check your email for the OTP.",
      email: user.email,
    };

    if (emailResult?.previewUrl) {
      responsePayload.previewUrl = emailResult.previewUrl;
    }
    if (emailResult?.usingEthereal) {
      responsePayload.previewOnly = true;
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    if (error.code === 11000) {
      // Check if the existing user is unverified to provide the correct feedback
      const existingUser = await User.findOne({ email });
      if (existingUser && !existingUser.isVerified) {
        return res.status(400).json({ 
          message: "An account with this email exists but is not verified.", 
          notVerified: true 
        });
      }
      return res.status(400).json({ message: "User already exists" });
    }
    next(error);
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase();
  if (!normalizedEmail) return res.status(400).json({ message: 'Please provide your email address' });

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${normalizedEmail}`;

    const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    let emailError = null;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset your password',
        message,
      });
    } catch (sendError) {
      emailError = sendError;
      console.error('Password reset email error:', sendError.message);
    }

    const responsePayload = {
      message: emailError
        ? 'Password reset email could not be delivered. Use the preview link below to continue.'
        : 'Password reset instructions have been sent to your email.',
    };

    if (emailError || process.env.NODE_ENV !== 'production') {
      responsePayload.previewUrl = resetUrl;
      responsePayload.previewOnly = !!emailError;
    }

    res.json(responsePayload);
  } catch (err) {
    if (err.message && err.message.includes('Email service not configured')) {
      return res.status(500).json({ message: err.message });
    }
    next(err);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  const { email, token, password } = req.body;
  const normalizedEmail = email?.toLowerCase();

  if (!normalizedEmail || !token || !password) {
    return res.status(400).json({ message: 'Email, reset token and new password are required' });
  }

  try {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    if (!user.isVerified) user.isVerified = true;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      message: 'Password reset successful. You are now logged in.',
    });
  } catch (err) {
    next(err);
  }
};

// Login
export const loginUser = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.toLowerCase();
  const user = await User.findOne({ email });

  if (user && !user.isVerified) {
    return res.status(401).json({ 
      message: "Please verify your email first",
      email: user.email,
      notVerified: true 
    });
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    let emailResult = null;
    let mailError = null;
    try {
      emailResult = await sendEmail({
        email: user.email,
        subject: "Your New Verification Code",
        message: `Your new verification code is: ${otp}. It expires in 10 minutes.`,
      });
    } catch (error) {
      mailError = error;
      console.error("Resend OTP email error:", error.message);
    }

    const responsePayload = {
      message: mailError
        ? "OTP could not be delivered. Use the preview link below to continue."
        : "A new OTP has been sent to your email.",
    };

    if (emailResult?.previewUrl) {
      responsePayload.previewUrl = emailResult.previewUrl;
    }
    if (emailResult?.usingEthereal) {
      responsePayload.previewOnly = true;
    }

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};