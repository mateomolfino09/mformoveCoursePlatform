import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export function resolveAuthUserIdFromCookies(): string | null {
  const token = cookies().get('userToken')?.value;
  if (!token) return null;

  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
      id?: string;
    };
    return decoded?.userId || decoded?._id || decoded?.id || null;
  } catch {
    return null;
  }
}
