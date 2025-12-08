import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepositories from "../repositories/user.repository";
import { NewUser, UpdateUser, verificationData } from "../types/user.types";
import { sendEmail } from "../mailer/mailer";
import { emailTemplate } from "../mailer/emailtemplate";
import { error } from "console";
import { throws } from "assert";
import dotenv from "dotenv";

dotenv.config();

export const createUserWithVerification = async (user: NewUser) => {
  if (!user.name || !user.email || !user.password) {
    throw new Error("Name, email, and password are required.");
  }

  
  const normalizedEmail = user.email.trim().toLowerCase();

  
  const availableUser = await userRepositories.getUserByEmail(normalizedEmail);
  if (availableUser) throw new Error("Email already exists");


  const hashedPassword = await bcrypt.hash(user.password, 10);

  
  const userToCreate = {
    ...user,
    email: normalizedEmail,
    password: hashedPassword,
    is_verified: false,
  };

 
  const createdUser = await userRepositories.createUser(userToCreate);

 
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  await userRepositories.setVerificationCode(createdUser.email, verificationCode);

  
  try {
    await sendEmail(
      createdUser.email,
      "Verify your email - CAKEApp By Liz",
      emailTemplate.verify(createdUser.name, verificationCode)
    );

    return {
      message: `User created successfully. Verification code sent to ${createdUser.email}.`,
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      message: `User created successfully, but verification email failed.`,
    };
  }
};

export const loginUser = async (email: string, password: string) => {
  const user = await userRepositories.getUserByEmail(email);

 
  if (!user) {
    const error: any = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error: any = new Error("Invalid credentials.");
    error.status = 401;
    throw error;
  }

  if (!user.is_verified) {
    const error: any = new Error("Please verify your email before logging in.");
    error.status = 403;
    throw error;
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error: any = new Error("JWT secret not defined.");
    error.status = 500;
    throw error;
  }

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  return {
    message: "Login successful.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};


export const verifyUser = async (email: string, verification_code: number) => {
  const user = await userRepositories.getUserByEmail(email);

  if (!user) {
    const error: any = new Error("User not found");
    error.status = 404; 
    throw error;
  }

  if (user.verification_code !== verification_code) {
    const error: any = new Error("Invalid verification code");
    error.status = 400;
    throw error;
  }

  await userRepositories.verifyUser(email);

  try {
    await sendEmail(
      user.email,
      "Your email has been verified - CAKEApp By Liz",
      emailTemplate.verifiedSuccess(user.name)
    );
  } catch (err) {
    console.error("Error sending success email:", err);
  }

  return { message: "User verified successfully." };
};


export const resendVerificationCode = async (email: string) => {
  const user = await userRepositories.getUserByEmail(email);
  if (!user) throw new Error("User not found.");

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  );
  await userRepositories.setVerificationCode(email, verificationCode);

  try {
    await sendEmail(
      user.email,
      "Resend verification code",
      emailTemplate.verify(user.name, verificationCode),
    );
  } catch (error) {
    console.error(" Error resending verification email:", error);
  }

  return { message: "Verification code resent successfully." };
};


export const getAllUsers = async () => {
  return await userRepositories.getAllUsers();
};


export const getUserById = async (id: number) => {
  const user = await userRepositories.getUserById(id);
  if (!user) throw new Error("User not found.");
  return user;
};


export const deleteUser = async (id: number) => {
  const user = await userRepositories.getUserById(id);

  if (!user) {
    const error: any = new Error("User not found");
    error.status = 404; 
    throw error;
  }

  await userRepositories.deleteUser(id);

  return { message: "User deleted successfully" };
};



export const getUserByEmail = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await userRepositories.getUserByEmail(normalizedEmail);

  
  console.log("Service: getUserByEmail called for:", `"${normalizedEmail}"`);
  console.log("Service: User returned:", user);

  return user; 
};


export const updateUser = async (id: number, userUpdates: UpdateUser) => {
  if (userUpdates.password) {
    userUpdates.password = await bcrypt.hash(userUpdates.password, 10);
  }

  const updatedUser = await userRepositories.updateUser(id, userUpdates);

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};
