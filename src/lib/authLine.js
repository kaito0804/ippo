// src/lib/authLine.js
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Supabase 初期化
let supabase;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✅ Supabase初期化成功');
} catch (error) {
  console.error('❌ Supabase初期化エラー:', error);
}

// 環境変数チェック
console.log('🔧 環境変数チェック:', {
  NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
});

// LINE LIFF IDトークンを検証する関数
async function verifyLiffIdToken(idToken) {
  try {
    console.log('🔍 トークン検証開始:', {
      tokenLength: idToken?.length,
      tokenStart: idToken?.substring(0, 50) + '...'
    });

    const decoded = jwt.decode(idToken, { complete: true });
    console.log('📋 デコード結果:', {
      header: decoded?.header,
      payload: decoded?.payload ? {
        sub: decoded.payload.sub,
        iss: decoded.payload.iss,
        aud: decoded.payload.aud,
        exp: decoded.payload.exp,
        iat: decoded.payload.iat,
        name: decoded.payload.name,
        email: decoded.payload.email,
      } : null
    });
    
    if (!decoded || !decoded.payload) {
      console.log('❌ トークンのデコードに失敗');
      return null;
    }

    const payload = decoded.payload;

    // 基本的な検証
    if (!payload.sub || !payload.iss) {
      console.log('❌ 必要なフィールドが不足:', { 
        sub: payload.sub, 
        iss: payload.iss 
      });
      return null;
    }

    // LINE のissuerかどうかチェック
    if (!payload.iss.includes('line.me')) {
      console.log('❌ LINE以外のissuer:', payload.iss);
      return null;
    }

    // 有効期限チェック
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('❌ トークンの有効期限切れ:', {
        exp: payload.exp,
        now: now,
        diff: now - payload.exp
      });
      return null;
    }

    console.log('✅ トークン検証成功');
    return payload;
  } catch (error) {
    console.error('💥 トークン検証エラー:', error);
    return null;
  }
}

export const authOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      id: 'liff',
      name: 'LINE LIFF',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
      },
      authorize: async (credentials) => {
        console.log('🚀 authorize 関数開始');
        console.log('📨 受信したクレデンシャル:', { 
          hasIdToken: !!credentials?.idToken,
          tokenLength: credentials?.idToken?.length 
        });

        // 基本的な検証
        if (!credentials?.idToken) {
          console.log('❌ idToken がありません');
          return null;
        }

        const { idToken } = credentials;

        try {
          // 1. IDトークンの検証
          console.log('🔍 ステップ1: IDトークン検証');
          const decoded = await verifyLiffIdToken(idToken);
          if (!decoded) {
            console.log('❌ ステップ1失敗: トークンの検証に失敗');
            return null;
          }

          // 2. ユーザー情報の抽出
          console.log('📝 ステップ2: ユーザー情報抽出');
          const userLineId = decoded.sub;
          const email = decoded.email || ``;
          const displayName = decoded.name || decoded.given_name || 'LINEユーザー';

          console.log('✅ ユーザー情報:', { 
            userLineId, 
            email, 
            displayName 
          });

          // 3. Supabaseの接続確認
          console.log('🔍 ステップ3: Supabase接続確認');
          if (!supabase) {
            console.log('❌ Supabaseが初期化されていません');
            return null;
          }

          // 4. 既存ユーザーの確認
          console.log('🔍 ステップ4: 既存ユーザー確認');
          const { data: existingUser, error: selectError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('line_id', userLineId)
            .single();

          console.log('📋 既存ユーザー検索結果:', {
            found: !!existingUser,
            error: selectError,
            errorCode: selectError?.code
          });

          if (selectError && selectError.code !== 'PGRST116') {
            console.log('❌ ステップ4失敗: Supabase select エラー:', selectError);
            return null;
          }

          // 5. 新規ユーザーの作成（必要な場合）
          if (!existingUser) {
            console.log('🔍 ステップ5: 新規ユーザー作成');
            const newUuid = uuidv4()
            const { data: newUser, error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: newUuid,
                display_name: displayName,
                email,
                created_at: new Date().toISOString(),
                line_id: userLineId
              })
              .select()
              .single();

            console.log('📋 新規ユーザー作成結果:', {
              success: !!newUser,
              error: insertError,
              newUser: newUser
            });

            if (insertError) {
              console.log('❌ ステップ5失敗: Supabase insert エラー:', insertError);
              return null;
            }
          } else {
            console.log('✅ 既存ユーザー使用:', existingUser);
          }

          // 6. 認証成功
          console.log('🎉 認証成功 - 最終ステップ');
          const result = {
            id: userLineId,
            name: displayName,
            email,
            lineId: userLineId,
          };
          
          console.log('✅ 返却するユーザー情報:', result);
          return result;

        } catch (err) {
          console.error('💥 authorize内例外 - 詳細:', {
            error: err,
            message: err.message,
            stack: err.stack
          });
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔄 JWT callback:', { 
        hasToken: !!token, 
        hasUser: !!user, 
        hasAccount: !!account 
      });
      if (account && user) {
        token.id = user.id;
        token.lineId = user.lineId;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔄 Session callback:', { 
        hasSession: !!session, 
        hasToken: !!token 
      });
      if (session.user) {
        session.user.id = token.id;
        session.user.lineId = token.lineId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/top',
  },
};