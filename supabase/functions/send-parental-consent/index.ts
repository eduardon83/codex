export { };

Deno.serve(async (req) => {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace('/send-parental-consent', '/send-parental-consent-email');
  return fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
  });
});