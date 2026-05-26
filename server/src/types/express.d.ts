import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      auth?: {
        userId: string;
        role: Role;
        tenantId: string | null;
        tenantIds: string[];
      };
    }
  }
}

export {};
