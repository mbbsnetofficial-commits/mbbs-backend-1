# DNSSEC Deployment & Setup Guide

DNSSEC (Domain Name System Security Extensions) adds cryptographic signatures to DNS records to protect your domain (`mbbs.net` and `api.mbbs.net`) against DNS spoofing, cache poisoning, and man-in-the-middle attacks.

---

## Architecture Note

> [!IMPORTANT]
> DNSSEC is a **DNS Zone & Registrar level setting**, not an application code or HTTP header setting. It must be enabled in your DNS management provider dashboard and published at your domain registrar.

---

## Step-by-Step Enablement Guide

### Option A: If using Cloudflare DNS (Recommended)

1. Log into your **Cloudflare Dashboard**.
2. Select your domain (`mbbs.net`).
3. Navigate to **DNS → Settings**.
4. Scroll down to **DNSSEC** and click **Enable DNSSEC**.
5. Cloudflare will automatically generate DS records (Key Tag, Algorithm, Digest Type, Digest).
6. Copy the DS record details provided by Cloudflare.
7. Log into your **Domain Registrar** (where you bought `mbbs.net`, e.g., Namecheap, GoDaddy, SquareSpace/Google Domains).
8. Go to **DNS Management / DS Records** and add the DS record provided by Cloudflare.
9. Click **Save**. Propagation usually completes within 1 to 24 hours.

---

### Option B: If using AWS Route 53

1. Log into **AWS Management Console** and open **Route 53**.
2. Select **Hosted Zones** and click `mbbs.net`.
3. Under **DNSSEC signing**, click **Enable DNSSEC signing**.
4. Create or select an AWS KMS Key (Customer Managed Key in `us-east-1`).
5. Click **Enable**.
6. Under **Establish chain of trust**, copy the generated **DS record**.
7. Log into your domain registrar and paste the DS record under Registrar DNSSEC settings.

---

### Option C: If using Namecheap / GoDaddy / Other Providers

1. Open your DNS Provider's Control Panel.
2. Search for **DNSSEC / DNS Signing**.
3. Turn on DNSSEC Signing.
4. Copy the generated **DS (Delegation Signer)** record values:
   - **Key Tag**: (e.g. `2371`)
   - **Algorithm**: (e.g. `13` / ECDSA Curve P-256 with SHA-256)
   - **Digest Type**: (e.g. `2` / SHA-256)
   - **Digest**: (hexadecimal string)
5. Add the DS record to your domain's parent TLD registrar.

---

## Verifying DNSSEC Status

### 1. Using CLI Script (Built into Backend Repository)

Run the backend's automated DNSSEC checking script:

```bash
npm run check:dnssec
```

### 2. Using Terminal Command (`dig`)

Run `dig` to query DS records for `mbbs.net`:

```bash
dig DS mbbs.net +short
```

If DNSSEC is active, `dig` will return the published DS record(s).

### 3. Using Online Web Validators

- [Verisign DNSSEC Analyzer](https://dnssec-analyzer.verisignlabs.com/mbbs.net)
- [DNSViz](https://dnsviz.net/d/mbbs.net/dnssec/)
