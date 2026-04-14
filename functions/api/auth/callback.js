export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return new Response(`Error: ${data.error_description}`, { status: 400 });
  }

  const token = data.access_token;
  const message = `authorization:github:success:${JSON.stringify({token, provider: 'github'})}`;

  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function() {
  var message = ${JSON.stringify(message)};
  if (window.opener) {
    window.opener.postMessage(message, '*');
    setTimeout(function() { window.close(); }, 1000);
  } else if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, '*');
  } else {
    sessionStorage.setItem('github_token', ${JSON.stringify(token)});
    document.body.innerHTML = '<h2>Нэвтэрлээ!</h2><p><a href="/admin">Admin хуудас руу буцах</a></p>';
  }
})();
<\/script></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
