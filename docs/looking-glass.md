# Looking Glass

We provide a direct feed of our BGP routes to bgp.tools, where you can see a live list of our [current connections](https://bgp.tools/as/401332#connectivity) and submit queries to inspect our routes. We filter RPKI ROA Invalids on our router.

[bgp.tools Looking Glass](https://bgp.tools/lg/401332){ .md-button }

---

Additionally, we are a RIPE Atlas anchor operator ([probe 7395](https://atlas.ripe.net/probes/7395/)), which makes various network statistics public:

- [Global IPv4 Traceroute](https://atlas.ripe.net/measurements/80082934/)
- [Global IPv6 Traceroute](https://atlas.ripe.net/measurements/80082937/)
- [Our ping to root DNS servers](https://atlas.ripe.net/probes/7395/#tab-builtins)

You can use this anchor to query any host you'd like from our network using credits on your RIPE Atlas account.

[Access RIPE Atlas](https://atlas.ripe.net/probes/7395/#tab-general){ .md-button }

If you do not have RIPE Atlas credits, you can perform a free traceroute/ping/DNS lookup from our anchor via Hurricane Electric's portal. Select RIPE Probe #7395 from the list to perform a test from our network.

[HE.net Traceroute from AS401332](https://bgp.he.net/AS401332#_traceroute){ .md-button }

---

In the future we will self-host some network tools as well, but in the meantime these services should provide you with adequate insight into our network.
