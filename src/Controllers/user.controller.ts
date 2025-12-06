import { Request, Response } from "express";
import * as userService from "../service/user.service";
import { NewUser, UpdateUser, LoginUser } from "../types/user.types";

export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const requestingUser = (req as any).user;

    if (
      requestingUser &&
      requestingUser.role !== "admin" &&
      requestingUser.id !== id
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot access other user's data" });
    }

    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error: any) {
  if (error.message === "User not found.") {
    return res.status(404).json({ message: "user not found" });
  }
  res.status(500).json({ message: error.message });
}

};

export const updateUserRolesController = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.params.id);

  // Validate ID first
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const requestingUser = (req as any).user;

  try {
    if (requestingUser) {
      if (requestingUser.role !== "admin" && requestingUser.id !== id) {
        return res
          .status(403)
          .json({ message: "Forbidden: Cannot update other user's data" });
      }
    }

    const result = await userService.updateUser(id, req.body);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error: any) {
  if (error.message === "User not found") {
    return res.status(404).json({ message: "user not found" });
  }
  res.status(400).json({ message: error.message || "Unknown error" });
}

};

export const createUserController = async (req: Request, res: Response) => {
  const newUser = req.body;

  try {
    const result = await userService.createUserWithVerification(newUser);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

//  Login user

export const loginUserController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await userService.loginUser(email, password);
    res.status(200).json({
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

// Delete user
export const deleteUserController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const result = await userService.deleteUser(id);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.status === 404 || error.message === "User not found") {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(500).json({ message: error.message });
  }
};


export const verifyUserController = async (req: Request, res: Response) => {
  const { email, verification_code } = req.body;

  if (!email || !verification_code) {
    return res
      .status(400)
      .json({ message: "Email and verification code are required" });
  }

  try {
    const result = await userService.verifyUser(email, verification_code);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 400).json({ message: error.message });
  }
};




// Resend verification code
export const resendVerificationController = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body;
  try {
    const result = await userService.resendVerificationCode(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
