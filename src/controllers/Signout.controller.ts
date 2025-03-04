import { Request, Response } from "express";

export const SignOut = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".acadmate.in",
      path: "/",
    });

    // res.clearCookie("refreshToken", { ... });

    // Send success response
    res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    console.error("Sign out error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
