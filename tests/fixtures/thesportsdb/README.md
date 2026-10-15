# TheSportsDB recorded captures

These fixtures pin the exact response shape TheSportsDB v1 has
returned in the past for the two endpoints this app depends on
most heavily. They are recorded artefacts, not schemas — the schemas
live at `lib/api/schemas/thesportsdb.ts`.

Contract tests (`tests/contracts/thesportsdb.contract.test.ts`)
serve these fixtures via MSW and:
  1. Verify our resolver code handles them without error.
  2. Verify our Zod schema parses them cleanly.
  3. Verify that hand-mangling a fixture (removing a required field)
     makes the Zod parse fail — proves the schema discriminates.

## Origin

- `lookupleague-4328.json` — Premier League (`idLeague: 4328`).
  Shape reconstructed from `lib/types/sportsdb.ts::SportsDbLeague`,
  cross-checked against TheSportsDB public docs at
  <https://www.thesportsdb.com/api.php>.
- `eventsday-soccer-2024-10-19.json` — Two Premier League fixtures
  on a real matchday (2024-10-19). Same origin note.

## Refresh policy

If TheSportsDB changes its response shape in a way that breaks the
schema, the contract test breaks. That's the point. Update the
fixture AND the schema together, in the same commit, with a note
in QA-LOG.md explaining what upstream changed.

Do NOT edit a fixture to "make the test pass" without also
capturing what the upstream is actually returning today — that
would defeat the whole discrimination point.
