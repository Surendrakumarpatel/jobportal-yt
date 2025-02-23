import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
      const { fullname, email, phoneNumber, password, role } = req.body;
       
      if (!fullname || !email || !phoneNumber || !password || !role) {
          return res.status(400).json({
              message: "Something is missing",
              success: false
          });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({
              message: "User already exists with this email.",
              success: false,
          });
      }

      // Handle file upload only if a file is provided
      let profilePhoto = "";
      const file = req.file;
      if (file) {
          const fileUri = getDataUri(file);
          const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
          profilePhoto = cloudResponse.secure_url;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      await User.create({
          fullname,
          email,
          phoneNumber,
          password: hashedPassword,
          role,
          profile: {
              profilePhoto: profilePhoto || "", // Default empty string if no file uploaded
          }
      });

      return res.status(201).json({
          message: "Account created successfully.",
          success: true
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({
          message: "Internal server error",
          success: false
      });
  }
};
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        let profilePhotoUrl, resumeUrl, resumeOriginalName, resumePublicId;
        const files = req.files; // Expecting multiple files

        // Process profile photo if exists
        if (files?.profilePhoto) {
            const profileFile = files.profilePhoto[0]; // Extract the first profile photo file
            const profileFileUri = getDataUri(profileFile);
            const cloudResponse = await cloudinary.uploader.upload(profileFileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        // Process resume if exists
        if (files?.resume) {
            const resumeFile = files.resume[0]; // Extract the first resume file
            const resumeFileUri = getDataUri(resumeFile);
            
            const cloudResponse = await cloudinary.uploader.upload(resumeFileUri.content, {
                resource_type: "raw", 
                folder: "resumes",
                format: "pdf"
            });

            resumePublicId = cloudResponse.public_id; // Store the public ID for generating signed URL
            resumeOriginalName = resumeFile.originalname;
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            });
        }

        // Updating data if fields are provided
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;

        // Update profile photo if uploaded
        if (profilePhotoUrl) {
            user.profile.profilePhoto = profilePhotoUrl;
        }

        // Save resume only if file was uploaded
        if (resumePublicId) {
            user.profile.resume = resumePublicId; // Save the Cloudinary public ID instead of the URL
            user.profile.resumeOriginalName = resumeOriginalName; // Save the original file name
        }

        await user.save();

        // Generate signed URL for the resume if available
        if (user.profile.resume) {
            resumeUrl = cloudinary.utils.private_download_url(user.profile.resume, "pdf", {
                resource_type: "raw"
            });
        }

        const updatedUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: {
                ...user.profile,
                resume: resumeUrl // Send the signed resume URL instead of raw Cloudinary URL
            }
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};