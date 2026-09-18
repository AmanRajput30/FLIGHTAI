# ADSB.lol ODbL 1.0 Compliance Guardrails

**Source**: ADSB.lol
**License**: Open Database License (ODbL) 1.0
**Commercial Use**: Permitted, subject to ODbL conditions.
**Attribution Requirement**: Yes.

## Produced Work vs. Derivative Database

A live map displaying flight data temporarily cached from ADSB.lol represents a **Produced Work**. 
However, persistently storing historical records of ADSB.lol data over time creates a **Derivative Database**.

> **ENGINEERING WARNING**
> Do not enable bulk or long-term persistence of ADSB.lol-derived data without reviewing ODbL derivative-database obligations. 

If Aervyn creates a Derivative Database, ODbL may require:
- Licensing the derivative database under ODbL or a compatible license.
- Providing machine-readable access to the derivative database.
- Preserving all notices.

## Current Storage Policy
Aervyn operates exclusively on short-lived caching for ADSB.lol data to reduce upstream request load. **NO long-term historical ADSB.lol data is persisted.**

## Separation of Proprietary Data
Ensure that ADSB.lol data is never permanently mixed into Aervyn's proprietary databases (e.g., users, billing, saved aircraft, SkyLord configuration) to preserve clear licensing boundaries. 

## No License Laundering
- Do NOT remove ADSB.lol attribution.
- Backend proxying is exclusively for architecture, caching, and security—NOT for evading ODbL attribution.
