import { Request, Response } from "express";
import { AuthService } from "../../application/services/AuthService";
import { loginAuthSchema, registerAuthSchema } from "../validators/authSchemas";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const payload = registerAuthSchema.parse(req.body);
    res.status(201).json({ data: this.authService.register(payload) });
  };

  login = async (req: Request, res: Response) => {
    const payload = loginAuthSchema.parse(req.body);
    res.json({ data: this.authService.login(payload) });
  };

  me = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    res.json({ data: this.authService.me(token) });
  };
}
