import { Body, Controller, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() body: { email: string; password: string; remember?: boolean }, @Res({ passthrough: true }) response: Response) {
    const session = this.auth.loginDemo(body.email, body.password);
    response.cookie("refresh_token", session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: body.remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });
    return { accessToken: session.accessToken, user: session.user };
  }

  @Post("refresh")
  refresh() {
    return this.auth.refreshDemo();
  }
}
