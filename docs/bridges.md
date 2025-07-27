---
description: Triplebit operates high performance, unfiltered, and high capacity bridges on the Tor network.
---

# Tor Bridges

Triplebit operates high performance, unfiltered, and high capacity bridges on the Tor network. We are compliant with [Tor Proposal 326](https://spec.torproject.org/proposals/326-tor-relay-well-known-uri-rfc8615.html).

Triplebit's goal is to enable IPv6 connectivity and promote IPv6 adoption across the Tor network and the internet as a whole. As such, our relays and infrastructure are 100% dual-stack.

## Manual Bridges

![](public/public-bridges.png){ align=right width=40% }

Many of our bridges are only distributed via private methods, such as bridge distribution methods operated by the Tor Project, or [private bridges](#private-bridges) we operate for NGOs and other groups, so that they are not easily blocked. However, if you would like to use Triplebit-operated bridges in place of your guard node and are not experiencing censorship yourself, we operate **5** public bridges in two locations for you to choose from.

Please read the Tor Project's bridge [documentation](https://tb-manual.torproject.org/bridges/) for information on how to set up manual bridges in Tor Browser. These bridges, like all of our infrastructure, run on bare-metal servers owned by Triplebit.

Near **Kansas City, USA**:

```
Bridge obfs4 103.17.154.136:443 224C0D16115E030C50579B0B9C2A644421072F66 cert=q7b3in5QkM7/w+Pu+Aze2PPJaPfW7UIygHBg1Y1Wbi/2vH6UQGJsSsgUlvdeG5qPhdC2Og iat-mode=1
webtunnel 10.0.2.2:443 D965164C1D9FB4FDD92E4FD5CDC6005E7820A687 url=https://cdn-25.triplebit.dev/nLcyjWAU3ILGenSItxtDAIJy
```

Near **Warsaw, Poland**:

```
Bridge obfs4 103.17.153.49:443 E3E13A69A1A6947E3D5B8C0A3C16D07829F57F07 cert=qULg51W+WSsESmuB46yimCcCpSDkkifwO1ctodpmaGuV2a9GKANf/Cwy7tdaBiucdIRCWA iat-mode=1
webtunnel 10.0.2.3:443 B094B41CA85C7A61FCBC11E671AA6D31737F9FB4 url=https://cdn-47.triplebit.dev/ua5noh9xeHiehe4h
```

Near **Minneapolis, USA**: Via Cloudflare! (1)
{ .annotate }

1. This WebTunnel bridge in Minneapolis is behind Cloudflare's IP addresses and network, which can be worse for performance and privacy, but potentially better for circumventing censorship. Of course, Tor traffic is always end-to-end encrypted.

```
webtunnel 10.0.2.4:443 E4D6ECD7C758A22854A5BCC50B05EA901F4CA46E url=https://mastodon.neat.computer/shi0aiphohL1ooca
```

Using a trustworthy bridge can be preferable to using a standard guard node, because it can typically offer better performance and it significantly lowers the risk of your entry point to the Tor network being compromised or malicious. On the other hand, it can make you stand out from other Tor clients (particularly to local network operators), because you will likely be the only Tor user locally using that bridge. This may be of particular note to you if you use Tor while traveling between different public networks, and don't want to be physically tracked between them. You should understand your needs and [threat model](https://www.privacyguides.org/en/basics/threat-modeling/) before changing any Tor settings.

### Private Snowflake (Beta)

Triplebit operates a private Snowflake broker, completely independently of Tor Project's Snowflake infrastructure. Our Snowflake proxies can only be used by adding our custom Snowflake bridge lines to your Tor Browser or `torrc` configuration. These are not yet published, but feel free to contact us if you would like to test this service out.

One benefit of our private broker is higher performance. We are only running dedicated proxies on high-speed networks, whereas the public Snowflake network is run by the public on all manner of devices and browser extensions. Of course, the flip side of this is that we lack the high IP diversity which makes the traditional Snowflake network difficult to block.

- Bridge: [TriplebitSnowflake1](https://metrics.torproject.org/rs.html#details/4EF1E26841B69156F804CE616A086E6E40D996F2)
- Bridge: [TriplebitSnowflake2](https://metrics.torproject.org/rs.html#details/00B2069390A9D67F9F23581E2B99F59FCA08D96B)

## Snowflake

Triplebit currently operates **4** NAT-free, unfiltered Snowflake proxy servers across our points of presence, which are registered to the Tor Project's public broker. If you choose to use the built-in Snowflake bridge in Tor Browser your traffic may be routed through these proxies, but there is no way to select them manually. Snowflake servers do not have any public identifiers, so they are not enumerated on this page.

Snowflake is the easiest way to contribute to the Tor Project, and you can do so yourself from any web browser. Visit [**snowflake.torproject.org**](https://snowflake.torproject.org/) for more information about this technology.

## WebTunnel and obfs4

Triplebit runs **over 40** WebTunnel and obfs4 bridges in multiple locations and across many domain names and IP addresses which are not shared publicly. These bridges are distributed via various distribution [methods](https://gitlab.torproject.org/tpo/anti-censorship/rdsys/-/blob/main/doc/distributors.md) that are operated by the Tor Project, including [https](https://bridges.torproject.org/), in-browser settings, [Telegram](https://t.me/GetBridgesBot), lox, and email.

We currently operate the following Tor bridges (by *hashed* fingerprint):

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
