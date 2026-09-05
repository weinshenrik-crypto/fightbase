# n8n auf dem UGREEN NASync DH2300

Ziel: ein n8n, das rund um die Uhr läuft — auch wenn der Mac zu ist. Darauf
sollen später der WhatsApp-Agent und ein Job laufen, der neue Kampftermine in
die Supabase-Tabelle `events` schreibt.

## Was dieses Gerät kann und was nicht

| | |
|---|---|
| Chip | Rockchip RK3576, 8-Core ARM64 |
| RAM | 4 GB, **fest verlötet** |
| Docker | **nicht offiziell** für den DH2300 |

Docker steht im App Center des DH2300 nicht zur Verfügung — UGREEN liefert es
nur für die DXP-Serie und den DH4300 Plus. Es lässt sich aber manuell
installieren und läuft. Preis dafür: kein Hersteller-Support, und ein
UGOS-Update kann die Installation theoretisch wieder entfernen.

n8n gibt es als `arm64`-Image, die Architektur passt also.

## Schritt 1 — Docker installieren

1. In UGOS anmelden.
2. App Center öffnen und prüfen, ob **Docker** inzwischen regulär angeboten
   wird. Falls ja: dort installieren und Schritt 3 überspringen.
3. Falls nicht: das Docker-Paket aus dem Download-Bereich des **DH4300 Plus**
   holen und in UGOS über die manuelle Installation einspielen.
4. Nach der Installation prüfen, ob SSH in UGOS aktiviert ist
   (Systemsteuerung → Terminal/SSH). Ohne SSH lässt sich `docker compose`
   nicht bequem bedienen.

## Schritt 2 — Cloudflare Tunnel anlegen

Ohne Tunnel erreicht WhatsApp deinen NAS nicht — er hängt hinter dem Router.
Ein Tunnel baut eine ausgehende Verbindung auf, es muss also **kein Port im
Router geöffnet** werden.

1. Domain in Cloudflare haben (oder dort eine hinzufügen).
2. Zero Trust → Networks → Tunnels → **Create a tunnel** → Typ **Docker**.
3. Als Public Hostname z.B. `n8n.deinedomain.de` eintragen, Service:
   `http://n8n:5678`.
4. Den angezeigten Token merken — er kommt gleich in die `.env`.

## Schritt 3 — Starten

Auf dem NAS per SSH:

```bash
mkdir -p /volume1/docker/n8n && cd /volume1/docker/n8n
# docker-compose.yml und .env.example aus diesem Ordner herüberkopieren
cp .env.example .env
openssl rand -hex 32   # Ergebnis als N8N_ENCRYPTION_KEY in die .env
nano .env              # N8N_HOST und CLOUDFLARE_TUNNEL_TOKEN ergänzen
docker compose up -d
docker compose logs -f n8n
```

Danach `https://n8n.deinedomain.de` im Browser öffnen und den Besitzer-Account
anlegen. Der erste Account ist Admin — also gleich selbst anlegen, bevor die
Adresse irgendwo auftaucht.

## Schritt 4 — Sichern

Zwei Dinge sind unersetzlich:

- **`N8N_ENCRYPTION_KEY`** — ohne ihn sind nach einem Neuaufsetzen alle in n8n
  gespeicherten Zugangsdaten unbrauchbar. In den Passwortmanager.
- **Volume `n8n_data`** — enthält Workflows und Verlauf.

```bash
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/n8n-backup-$(date +%F).tar.gz -C /data .
```

## Danach

Steht n8n, kommen die eigentlichen Bausteine:

1. **Instance-level MCP aktivieren** (Settings → Instance-level MCP), damit
   Claude Workflows für dich bauen und starten kann.
2. **WhatsApp-Agent**: Webhook → AI-Agent-Node mit Claude → Memory in Supabase
   → Tool-Nodes für Supabase, Vercel und GitHub.
3. **Termin-Job**: täglich Quellen abfragen und neue Events in `events`
   schreiben. Seit der Migration weg vom hartkodierten Array reicht dafür ein
   Datenbank-Insert, kein Deploy.
