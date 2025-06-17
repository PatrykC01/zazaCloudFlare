import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "edge";

export default function handler(req: Request, res: Response) {
  // @ts-ignore
  return NextAuth(authOptions)(req, res);
}
