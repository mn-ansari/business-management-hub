import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  shopId: number;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const cookieHeader = request.headers.get('cookie');
  console.log('🔍 Auth Check - Cookie Header:', cookieHeader ? 'Present' : '❌ Missing');
  
  if (!cookieHeader) {
    console.log('❌ No cookie header found in request');
    return null;
  }

  const cookies = cookie.parse(cookieHeader);
  const token = cookies.token;
  
  console.log('🔍 Token from cookie:', token ? 'Found ✓' : '❌ Not found');

  if (!token) {
    console.log('❌ No token found in cookies');
    return null;
  }

  const user = verifyToken(token);
  console.log('🔍 Token verified:', user ? `✓ User ID: ${user.userId}` : '❌ Invalid token');
  return user;
}
