# SSL Certificates

Place your SSL certificates in this directory:

- `fullchain.pem` - Your SSL certificate chain
- `privkey.pem` - Your private key

## Using Let's Encrypt

For production, you can use Let's Encrypt to get free SSL certificates:

```bash
# Install certbot
sudo apt install certbot

# Get certificates (replace yourdomain.com)
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to this directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./fullchain.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./privkey.pem
```

## For Development/Testing

For local development, you can generate self-signed certificates:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/CN=localhost"
```

Note: Self-signed certificates will show browser warnings. Only use for development.

## Security Notes

- Never commit real certificates to version control
- Add `*.pem` to your `.gitignore`
- Ensure private key has restricted permissions (chmod 600)
