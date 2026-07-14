import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";

// Student: update (or create) their own profile
export const updateProfile = async (req, res) => {
  try {
    const profileData = {
      student: req.user._id,
      ...req.body,
    };

    const profile = await Profile.findOneAndUpdate(
      { student: req.user._id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student: get their own profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ student: req.user._id }).populate(
      "student",
      "name email phone city state"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Please update your profile first." });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get a single student profile by email
export const getProfileByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email, role: "student" });

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const profile = await Profile.findOne({ student: user._id }).populate(
      "student",
      "name email phone city state"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found for this student" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get multiple student profiles by list of emails
export const getProfilesByEmails = async (req, res) => {
  const { emails } = req.body; // array of email strings

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: "Please provide an array of emails" });
  }

  try {
    const users = await User.find({ email: { $in: emails }, role: "student" });

    const userIds = users.map((u) => u._id);

    const profiles = await Profile.find({ student: { $in: userIds } }).populate(
      "student",
      "name email phone city state"
    );

    res.status(200).json({ count: profiles.length, profiles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
