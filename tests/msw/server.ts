// C-02 — Node-side MSW server. Tests do:
//     import { server } from "@/tests/msw/server"
//     server.use(down("https://…"))
// The setup file (tests/msw/setup.ts) starts and stops this server
// once per suite and resets handlers between each test — so no
// stub leaks from one test to the next.

import { setupServer } from "msw/node"

// Start with an empty handler list. Every test declares exactly the
// upstream states it needs via server.use(...). This matches the
// `layered-testing-strategy` skill: tests should be surgical, not
// share ambient defaults.
export const server = setupServer()
