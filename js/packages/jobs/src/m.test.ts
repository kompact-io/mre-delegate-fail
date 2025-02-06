import { describe, expect, test } from "@jest/globals";
import * as kio from "@mre-delegate-fail/kio";
import { setup, delegate } from "./m";

describe("delegate", () => {
  test("setup", async () => {
    let l = await kio.mkLucid.mkLucidWithEmulator();
    let hash = await setup(l);
    let poolId = "pool1ynfnjspgckgxjf2zeye8s33jz3e3ndk9pcwp0qzaupzvvd8ukwt";
    await delegate(l, hash, poolId);
  });
});
