declare namespace Express {
  export interface Request {
    user?: {
      email: string;
      id: string;
      name: string | null;
      role: "ADMIN" | "COMMON";
    };
  }
}

