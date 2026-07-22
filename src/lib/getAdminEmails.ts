import User from '../models/userModel';

/** Emails de todos los usuarios con rol Admin (sin duplicados). */
export async function getAdminEmails(): Promise<string[]> {
  const admins = await User.find({ rol: 'Admin' }).select('email').lean();
  const emails = (admins as { email?: string }[])
    .map((a) => String(a.email || '').trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(emails)];
}
