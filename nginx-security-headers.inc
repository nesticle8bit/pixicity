# Cabeceras de seguridad. Se incluyen en el server Y en cada location que defina sus propias add_header:
# nginx NO hereda add_header del server a un location que tenga alguna (por eso el HTML las perdía todas).

add_header Strict-Transport-Security "max-age=15552000" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# APIs del navegador que el sitio no usa: ningún script (propio, de anuncios o embebido) puede pedirlas.
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=()" always;

# CSP en vigor: solo directivas que no pueden romper el sitio (sin plugins, sin <base> inyectado, sin embeberlo
# en otro dominio, formularios solo hacia el propio sitio, todo por https).
add_header Content-Security-Policy "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests" always;

# CSP estricta en modo reporte: no bloquea nada, solo avisa (POST /api/app-logs/csp -> /administracion/logs,
# categoría "CSP"). Cuando los avisos muestren solo lo esperado se puede pasar a la cabecera de arriba.
# Los anuncios y scripts configurados desde el admin van a aparecer ahí. AdSense (googlesyndication, doubleclick,
# adservice, adtrafficquality) ya está permitido en script-src, connect-src y frame-src.
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.juliopoveda.com https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://*.googlesyndication.com https://*.doubleclick.net https://adservice.google.com https://*.adtrafficquality.google; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src * data: blob:; media-src *; connect-src 'self' https://analytics.juliopoveda.com https://cloudflareinsights.com https://discord.com https://*.googlesyndication.com https://*.doubleclick.net https://adservice.google.com https://*.adtrafficquality.google; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://w.soundcloud.com https://open.spotify.com https://turbo.cr https://www.instagram.com https://www.tiktok.com https://www.google.com https://maps.google.com https://bandcamp.com https://discord.com https://challenges.cloudflare.com https://*.googlesyndication.com https://*.doubleclick.net https://adservice.google.com https://*.adtrafficquality.google; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; report-uri /api/app-logs/csp" always;
