# Attribution

This archive is assembled from the work of others. Those sources are credited
here, and the credit travels with the data — see LICENSE-DATA.

## Liquipedia

<https://liquipedia.net/dota2/>

Rosters, the handles players used at each event, coaches, qualification paths,
placements and prize distribution come from Liquipedia.

Liquipedia content is licensed **CC-BY-SA 3.0**, which is why the data in this
repository carries the same license. Their API terms of use
(<https://liquipedia.net/api-terms-of-use>) are observed by the ingest scripts:
the MediaWiki API only, a project-identifying User-Agent, rate limiting well
inside their published limits, gzip, and caching so nothing is requested twice.

Liquipedia is the only source consulted here that records what a team or player
was called *at the time of an event*, rather than what they are called now. That
distinction is the backbone of this project.

## OpenDota

<https://www.opendota.com/> · <https://github.com/odota>

Match data — results, durations, drafts, per-player statistics, objectives —
comes from the OpenDota API. OpenDota is an open-source, community-run project,
and this archive would not be feasible without it.

Note recorded in `docs/DATA-NOTES.md`: OpenDota returns present-day identity for
teams and players. This is correct behaviour for a live statistics site and a
hazard for a historical one. It supplies the stable identifiers and the match
facts here; names come from Liquipedia.

## Valve Corporation

Dota 2 and The International are properties of Valve Corporation. Hero names,
in-game terminology and any Valve-produced assets referenced here remain
Valve's. This project is an unofficial, non-commercial community archive and is
not affiliated with or endorsed by Valve.

## Everyone else

Period reporting, community reaction and narrative sources are cited inline in
the data, each with its own URL and retrieval date. Where a claim came from a
person rather than a page — including from the maintainer's own memory of
watching these events live — it is recorded as such, with the date it was
given.
