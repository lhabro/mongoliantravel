export async function onRequest(context) {
  const { env } = context;
  
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: 'https://mongoliantravel.xyz/api/auth/callback',
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}
