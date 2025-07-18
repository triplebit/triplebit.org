---
description: Triplebit operates high performance, unfiltered, and high capacity bridges on the Tor network.
---

# Tor Bridges

Triplebit operates high performance, unfiltered, and high capacity bridges on the Tor network. We are compliant with [Tor Proposal 326](https://spec.torproject.org/proposals/326-tor-relay-well-known-uri-rfc8615.html).

Triplebit's goal is to enable IPv6 connectivity and promote IPv6 adoption across the Tor network and the internet as a whole. As such, our relays and infrastructure are 100% dual-stack.

## Snowflake

Triplebit currently operates **9** NAT-free, unfiltered Snowflake proxy servers across our points of presence. Snowflake servers do not have any public identifiers, so they are not enumerated on this page.

Snowflake is the easiest way to contribute to the Tor Project, and you can do so yourself from any web browser. Visit [**snowflake.torproject.org**](https://snowflake.torproject.org/) for more information about this technology.

## WebTunnel and obfs4

Triplebit currently operates the following Tor bridges (by hashed fingerprint):

```
--8<--
docs/.well-known/tor-relay/hashed-bridge-rsa-fingerprint.txt
--8<--
```

However, it may be more useful for you to browse [this interactive list](https://metrics.torproject.org/rs.html#search/Triplebit%20type:bridge%20) of our bridges for more information. **Note** that this list is based on nickname and not validated, so other operators could impersonate us and be listed. You should cross-reference list entries with the hashed fingerprints listed above if you need to confirm the validity of a Triplebit Tor bridge.

## Private Bridges

Triplebit operates private Tor bridges for non-profits/NGOs, activists, and researchers on a case-by-case, as-needed basis. To provide you with a private bridge line we will need to understand your specific requirements:

- How many users do you have?
- Where are your users located?
- What is your threat model?
- What platforms are your users using? Desktop? Android?
- Can you run your own bridges? Or do you need bridges from us?

If this service would be helpful to your organization, please feel free to contact us.
