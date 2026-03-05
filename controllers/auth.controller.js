import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { validateData } from "../lib/utils/validateData.js";
import User from "../models/user.model.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from "../schemas/auth.js";
import { sendResetEmail } from "../lib/utils/sendEmail.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const error = validateData(signupSchema, { username, email, password });
    if (error) {
      return res.status(400).json({
        error,
      });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.username === username
            ? "Username is already taken"
            : "Email is already taken",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      return res.status(400).json({
        error: "Invalid user data",
      });
    }
  } catch (error) {
    console.log(`Error in signup controller`, error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const error = validateData(loginSchema, { username, password });
    if (error) {
      return res.status(400).json({
        error,
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        error: "Invalid username. Please try again",
      });
    }

    const isPasswordCorrect = await bcryptjs.compare(
      password,
      user?.password || ""
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        error: "Incorrect password. Please try again.",
      });
    }

    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log(`Error in login controller`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0, 
      httpOnly: true, 
      secure: true, 
      sameSite: "none", 
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(`Error in logout controller:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const error = validateData(forgotPasswordSchema, { email });
    if (error) {
      return res.status(400).json({
        error,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "This email address has not been registered.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password?tk=${resetToken}`;

    await sendResetEmail(user.email, resetURL);

    res.status(200).json({
      message: "Reset link sent to email",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const error = validateData(resetPasswordSchema, { password });
    if (error) {
      return res.status(400).json({
        error,
      });
    }
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "The password change deadline has passed. Please request a new password reset.",
      });
    }

    const salt = await bcryptjs.genSalt(10);

    user.password = await bcryptjs.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
