import { describe, expect, it } from "vitest";

import { editorRole } from "./permissions.js";

describe("editor role", () => {
  it("can edit content but cannot publish or change settings", () => {
    expect(editorRole.authorize({ events: ["update"] }).success).toBe(true);
    expect(editorRole.authorize({ events: ["publish"] }).success).toBe(false);
    expect(editorRole.authorize({ settings: ["update"] }).success).toBe(false);
  });
});
