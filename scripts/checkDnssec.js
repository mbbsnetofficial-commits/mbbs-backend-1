"use strict";

const https = require("https");

/**
 * Queries DNS-over-HTTPS (DoH) to check for DS (Delegation Signer) records and AD flag for a domain.
 * @param {string} domain Domain to query (default: 'mbbs.net')
 * @returns {Promise<{ domain: string, hasDS: boolean, adFlag: boolean, status: number, records: Array }>}
 */
function verifyDnssec(domain = "mbbs.net") {
    return new Promise((resolve, reject) => {
        const cleanDomain = domain.trim().toLowerCase();
        const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=DS`;

        const req = https.get(url, { headers: { "Accept": "application/dns-json" } }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    const hasDS = Array.isArray(json.Answer) && json.Answer.some(r => r.type === 43);
                    const adFlag = json.AD === true;
                    resolve({
                        domain: cleanDomain,
                        hasDS,
                        adFlag,
                        status: json.Status,
                        records: json.Answer || []
                    });
                } catch (err) {
                    reject(new Error(`Failed to parse DNS response: ${err.message}`));
                }
            });
        });

        req.on("error", (err) => reject(new Error(`DoH Network Request Failed: ${err.message}`)));
    });
}

// Standalone execution handling
if (require.main === module) {
    const targetDomain = process.argv[2] || process.env.CHECK_DOMAIN || "mbbs.net";
    console.log(`=== Inspecting DNSSEC Status for: ${targetDomain} ===\n`);

    verifyDnssec(targetDomain)
        .then(result => {
            if (result.hasDS) {
                console.log(`✅ SUCCESS: DNSSEC DS records are active for ${targetDomain}!`);
                console.log("DS Records Found:", JSON.stringify(result.records, null, 2));
            } else {
                console.log(`⚠️ WARNING: DNSSEC is currently NOT enabled for ${targetDomain}.`);
                console.log("No DS (Delegation Signer) records were returned by authoritative DNS.");
                console.log("👉 Please refer to DNSSEC_SETUP_GUIDE.md for step-by-step instructions to enable DNSSEC.");
            }
        })
        .catch(err => {
            console.error(`❌ ERROR: Could not complete DNSSEC inspection: ${err.message}`);
            process.exitCode = 1;
        });
}

module.exports = { verifyDnssec };
