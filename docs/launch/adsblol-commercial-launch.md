# ADSB.lol Commercial Launch Checklist

**Production contact: Averyn's launch requirement based on ADSB.lol's published API guidance.**

- [ ] ADSB.lol contacted regarding Averyn production API usage.
- [ ] Current API documentation rechecked.
- [ ] Current API OpenAPI specification rechecked.
- [ ] Current ADSB.lol Privacy/License page rechecked.
- [ ] ODbL compliance reviewed.
- [ ] Attribution deployed.
- [ ] Data Sources page deployed.
- [ ] Terms of Service updated.
- [ ] Privacy Policy updated if necessary.
- [ ] Safety disclaimer deployed.
- [ ] Rate limiting implemented.
- [ ] Cache implemented.
- [ ] Request coalescing implemented.
- [ ] Circuit breaker implemented.
- [ ] Kill switch tested.
- [ ] Provider abstraction tested.
- [ ] No raw permanent data collection accidentally enabled.
- [ ] No unreviewed customer bulk-data API/export enabled.
- [ ] Production usage acknowledgement/contact documented.
- [ ] Legal counsel review completed before material commercial reliance.

## Production Contact Draft Email

> **To:** [ADSB.lol Contact]
> **Subject:** Production API Usage Inquiry - Averyn
> 
> Hello ADSB.lol Team,
> 
> I am writing to inform you of our intent to use ADSB.lol as the live aircraft-data provider for Averyn, a commercial aviation intelligence application, as we approach our launch.
> 
> **Usage Details:**
> - We will use the v2 API (specifically the `point` endpoint with strict radius bounds) to display live aircraft on a geographic map.
> - We have implemented a robust backend request coalescing layer and LRU caching (TTL 5 seconds) to ensure that concurrent users in the same geographic region share the same upstream request. 
> - We do not persistently store raw flight data, nor do we redistribute it via bulk customer APIs.
> - Appropriate ADSB.lol attribution and ODbL 1.0 license links are prominently displayed on our map interface.
> 
> **Questions:**
> 1. Are there any specific API rate limits or request patterns you prefer we adhere to for production commercial use?
> 2. Do you currently require or provide dedicated API keys for commercial clients?
> 3. Are there any special conditions we should be aware of regarding attribution formatting or feeder contributions?
> 
> We are committed to responsible API usage and compliance with the Open Database License (ODbL) 1.0. 
> 
> Thank you for providing such a fantastic open data service.
> 
> Best regards,
> [Your Name/Averyn Team]
