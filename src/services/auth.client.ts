export type AuthRole = "buyer" | "seller" | "super_admin";

export interface LoginPayload {
  email: string;
  password: string;
  role: AuthRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  role: AuthRole;
}

export interface AuthClientResult {
  ok: true;
  message: string;
}

const mockDelay = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 650);
  });

export async function loginUser(payload: LoginPayload): Promise<AuthClientResult> {
  void payload;
  // TODO: Backend team to integrate API here. The repo already has next-auth signIn("credentials"), which can be wired in for credential login.
  await mockDelay();
  return { ok: true, message: "Login submitted successfully." };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthClientResult> {
  void payload;
  // TODO: Backend team to integrate API here. The repo already has POST /api/auth/register, which can be wired in for account creation.
  await mockDelay();
  return { ok: true, message: "Account created successfully." };
}
