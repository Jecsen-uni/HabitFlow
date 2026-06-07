import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { AuthService } from "../../application/services/AuthService";
import { loginAuthSchema, registerAuthSchema } from "../validators/authSchemas";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: unknown) {
    const payload = registerAuthSchema.parse(body);
    return { data: this.authService.register(payload) };
  }

  @Post("login")
  login(@Body() body: unknown) {
    const payload = loginAuthSchema.parse(body);
    return { data: this.authService.login(payload) };
  }

  @Get("me")
  me(@Headers("authorization") authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, "");
    return { data: this.authService.me(token) };
  }
}
