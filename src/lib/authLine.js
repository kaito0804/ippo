// src/lib/authLine.js
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
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
  LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID,
});

// LINE JWK クライアント
const client = jwksClient({
  jwksUri: "https://api.line.me/oauth2/v2.1/certs",
});

// 公開鍵を取得する関数
async function getSigningKey(kid) {
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
}

export async function verifyLiffIdToken(idToken) {
  try {
    const decodedHeader = jwt.decode(idToken, { complete: true });
    if (!decodedHeader) return null;

    const { kid, alg } = decodedHeader.header;
    if (!kid || !['RS256', 'ES256'].includes(alg)) {
		console.error('❌ JWTヘッダー不正', { kid, alg });
		return null;
    }

    const key = await getSigningKey(kid);

    const decoded = jwt.verify(idToken, key, {
		algorithms: [alg], // ヘッダーに応じて動的に設定
		audience: process.env.LINE_CHANNEL_ID,
		issuer: 'https://access.line.me',
    });

    console.log('✅ トークン検証成功:', { sub: decoded.sub, name: decoded.name, email: decoded.email });
    return decoded;

  } catch (err) {
	console.log('ID Token:', idToken);
    console.error('❌ トークン検証例外:', err.message);
    return null;
  }
}


// NextAuth 設定
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

				if (!credentials?.idToken) {
					console.log('❌ idToken がありません');
					return null;
				}

				const { idToken } = credentials;

				try {	
					console.log('🔍 ステップ1: IDトークン検証');
					const decoded = await verifyLiffIdToken(idToken);
					if (!decoded) {
						console.log('❌ ステップ1失敗: トークンの検証に失敗');
						return null;
					}

					console.log('📝 ステップ2: ユーザー情報抽出');
					const userLineId = decoded.sub;
					const email = decoded.email || '';
					const displayName = decoded.name || decoded.given_name || 'LINEユーザー';
					const pictureUrl = decoded.picture || null;

					console.log('✅ ユーザー情報:', { userLineId, email, displayName });

					console.log('🔍 ステップ3: Supabase接続確認');
					if (!supabase) return null;

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

					if (selectError && selectError.code && selectError.code !== 'PGRST116') {
						console.log('❌ Supabase select エラー:', selectError);
						return null;
					}

					if (!existingUser) {
						console.log('🔍 ステップ5: 新規ユーザー作成');
						const newUuid = uuidv4();
						const { data: newUser, error: insertError } = await supabase
							.from('user_profiles')
							.insert({
							id: newUuid,
							display_name: displayName,
							email,
							icon_path: pictureUrl,
							created_at: new Date().toISOString(),
							line_id: userLineId
							})
							.select()
							.single();

						console.log('📋 新規ユーザー作成結果:', { success: !!newUser, error: insertError });

						if (insertError) return null;
					} else {
						console.log('✅ 既存ユーザー使用:', existingUser);
						// 既存ユーザーにも最新の pictureUrl を保存したい場合
						await supabase
						.from('user_profiles')
						.update({ icon_path: pictureUrl })
						.eq('line_id', userLineId);
					}

					console.log('🎉 認証成功 - 最終ステップ');
					return { id: userLineId, name: displayName, email, lineId: userLineId };

				} catch (err) {
					console.error('💥 authorize内例外:', err);
					return null;
				}
			}
		}),
	],
	session: { strategy: 'jwt' },
	callbacks: {
		async jwt({ token, user, account }) {
		if (account && user) {
			token.id = user.id;
			token.lineId = user.lineId;
			token.jti = user.jti || null;
			token.provider = 'line';
		}
		return token;
		},
		async session({ session, token }) {
		if (session.user) {
			session.user.id = token.id;
			session.user.lineId = token.lineId;
			session.user.jti = token.jti;
			session.user.provider = 'line';
		}
		return session;
		},
	},
	pages: { signIn: '/top' },
};
