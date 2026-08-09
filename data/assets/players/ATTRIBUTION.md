# Player photographs

Downloaded from [Liquipedia](https://liquipedia.net/) by `scripts/fetch-player-photos.ts`,
at a single consistent width, choosing where possible a photograph taken at or near the event
each page covers rather than the player's current one.

Each photograph is the work of its photographer and remains theirs. They are reproduced here to
identify the people who played in the events this archive documents. No claim of ownership is
made, and no endorsement is implied.

## Why they are here

This archive is **non-commercial and educational**. It is downloadable, open-source, and no money
is made from it in any form — no ads, no sponsorship, no paid tier, now or later. It exists so
that a history scattered across dead forums and defunct news sites stays readable.

## Removal

**If you are a player, a photographer, or an organisation and you want an image removed, it will
be removed. No questions, no negotiation.** Open an issue, or contact the repository owner.

Removals are recorded in `EXCLUDED.json` in this directory rather than only deleted, because a
deleted file alone would be silently re-downloaded the next time anyone regenerates the photos.
Listing it there makes the removal permanent, and the player falls back to a generated initials
mark automatically — nothing else in the archive changes.

## Notes for anyone reusing this

- Liquipedia hosts many of these by permission granted **to Liquipedia**. Permission to them is
  not permission to you. If you are reusing this repository's images, do your own checking.
- `data/research/*.player-photos.json` records, per image, the licence and author stated on its
  Liquipedia `File:` page, the source URL, and the date retrieved.
- Players with no photograph get a generated initials mark. That is the normal case, not an
  error — coverage of 2018 is roughly 60%, and thinner for players who left the scene.
