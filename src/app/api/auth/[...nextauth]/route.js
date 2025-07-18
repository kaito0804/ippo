// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authLine';

const handler = NextAuth(authOptions);
console.log('NextAuth API handler loaded');

export { handler as GET, handler as POST };
