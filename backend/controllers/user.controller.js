import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { queryDB } from "../config/db.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        // Input validation
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        const [[existingUser]] = await queryDB('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);

        if (existingUser.count > 0) {
            return res.status(400).json({ message: 'User already exists with this email.', success: false });
        }

        // Hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user and profile
        await queryDB(
            'INSERT INTO users (fullname, email, phoneNumber, password, role) VALUES (?, ?, ?, ?, ?)',
            [fullname, email, phoneNumber, hashedPassword, role]
        );

        await queryDB('INSERT INTO profiles (email) VALUES (?)', [email]);

        return res.status(201).json({ message: "Account created successfully.", success: true });
    } catch (error) {
        console.error("Error in register:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        const [[user]] = await queryDB('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(400).json({ message: "Incorrect email.", success: false });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect password.", success: false });
        }

        if (role !== user.role) {
            return res.status(400).json({ message: "Account doesn't exist with current role.", success: false });
        }

        const [[profile]] = await queryDB('SELECT * FROM profiles WHERE email = ?', [email]);

        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        return res.status(200)
            .cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
            .json({
                message: `Welcome back ${user.fullname}`,
                user:{
                    id: user.id,
                    fullname: user.fullname,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    profile: profile
                },
                success: true
            });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};

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
        const { fullname, phoneNumber, bio, skills } = req.body;
        const userId = req.id; 

        // Check if user exists
        const [[user]] = await queryDB('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        // Update user and profile
        await queryDB(
            'UPDATE users SET fullname = COALESCE(?, fullname), phoneNumber = COALESCE(?, phoneNumber) WHERE id = ?',
            [fullname, phoneNumber, userId]
        );

        await queryDB(
            'UPDATE profiles SET bio = COALESCE(?, bio), skills = COALESCE(?, skills) WHERE email = ?',
            [bio, skills, user.email]
        );

        return res.status(200).json({
            message: "Profile updated successfully.",
            user:{
                id: user.id,
                fullname: fullname,
                email: user.email,
                phoneNumber: phoneNumber,
                role: user.role,
                profile:{
                    bio: bio,
                    skills: skills
                }
            },
            success: true
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};
