#!/bin/sh
set -e

if [ -z "$DOMAIN" ]; then
  echo "DOMAIN environment variable not set. Skipping SSL initialization."
  exit 0
fi

SSL_DIR="/etc/letsencrypt/live/$DOMAIN"

if [ ! -f "$SSL_DIR/fullchain.pem" ]; then
  echo "SSL certificate for $DOMAIN not found. Generating temporary self-signed certificate..."
  mkdir -p "$SSL_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$SSL_DIR/privkey.pem" \
    -out "$SSL_DIR/fullchain.pem" \
    -subj "/CN=localhost"
  echo "Temporary self-signed certificate generated successfully."
else
  echo "Existing SSL certificate found for $DOMAIN."
fi
