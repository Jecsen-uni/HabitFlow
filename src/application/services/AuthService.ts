import { createHash, randomUUID } from "node:crypto";
import { AppError } from "../../shared/AppError";

type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type PublicUser = Omit<User, "passwordHash">;

export class AuthService {
  private readonly users = new Map<string, User>();
  private readonly sessions = new Map<string, User>();

  register(data: { username: string; email: string; password: string }) {
    const username = data.username.trim();
    const normalizedEmail = this.normalizeEmail(data.email);
    if (this.users.has(normalizedEmail)) {
      throw new AppError("Email is already registered", 409, "EMAIL_ALREADY_REGISTERED");
    }

    const user = {
      id: randomUUID(),
      username,
      email: normalizedEmail,
      passwordHash: this.hashPassword(data.password),
      createdAt: new Date()
    };

    this.users.set(normalizedEmail, user);
    return this.issueSession(user);
  }

  login(data: { email: string; password: string }) {
    const normalizedEmail = this.normalizeEmail(data.email);
    const user = this.users.get(normalizedEmail);
    if (!user) {
      throw new AppError("Email is not registered", 404, "EMAIL_NOT_REGISTERED");
    }

    if (user.passwordHash !== this.hashPassword(data.password)) {
      throw new AppError("Password is incorrect", 401, "INVALID_PASSWORD");
    }

    return this.issueSession(user);
  }

  me(token: string | undefined) {
    if (!token) {
      throw new AppError("Missing auth token", 401, "MISSING_AUTH_TOKEN");
    }

    const user = this.sessions.get(token);
    if (!user) {
      throw new AppError("Invalid auth token", 401, "INVALID_AUTH_TOKEN");
    }

    return { user: this.toPublicUser(user) };
  }

  private issueSession(user: User) {
    const token = randomUUID();
    this.sessions.set(token, user);

    return {
      token,
      user: this.toPublicUser(user)
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hashPassword(password: string) {
    return createHash("sha256").update(password).digest("hex");
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}
