import type { NextRequest } from 'next/server';
import { handleSiwsSignIn } from '@/lib/auth-plugins/siws';

export function POST(req: NextRequest) {
  return handleSiwsSignIn(req);
}
