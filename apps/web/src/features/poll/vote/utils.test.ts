import { describe, expect, it } from "vitest";
import { hasNewPastAvailability, isPollOptionPast } from "./utils";

describe("isPollOptionPast", () => {
  it("treats a time slot as past from its start time", () => {
    const option = {
      startTime: new Date("2026-11-17T15:00:00Z"),
      duration: 60,
    };

    expect(
      isPollOptionPast(option, "UTC", new Date("2026-11-17T15:00:00Z")),
    ).toBe(true);
    expect(
      isPollOptionPast(option, "UTC", new Date("2026-11-17T14:59:59Z")),
    ).toBe(false);
  });

  it("treats an all-day option as past after its date in the viewer's zone", () => {
    const option = {
      startTime: new Date("2026-11-17T00:00:00Z"),
      duration: 0,
    };

    expect(
      isPollOptionPast(
        option,
        "America/Los_Angeles",
        new Date("2026-11-18T07:30:00Z"),
      ),
    ).toBe(false);
    expect(
      isPollOptionPast(
        option,
        "America/Los_Angeles",
        new Date("2026-11-18T08:30:00Z"),
      ),
    ).toBe(true);
  });
});

describe("hasNewPastAvailability", () => {
  const options = [
    { id: "past", startTime: new Date("2026-11-17T10:00:00Z"), duration: 60 },
    { id: "future", startTime: new Date("2026-11-17T18:00:00Z"), duration: 60 },
  ];

  it("rejects availability on past options", () => {
    expect(
      hasNewPastAvailability({
        votes: [{ optionId: "past", type: "yes" }],
        options,
        timeZone: "UTC",
        now: new Date("2026-11-17T12:00:00Z"),
      }),
    ).toBe(true);
  });

  it("allows an unchanged past vote while editing another option", () => {
    expect(
      hasNewPastAvailability({
        votes: [
          { optionId: "past", type: "yes" },
          { optionId: "future", type: "yes" },
        ],
        options,
        existingVotes: new Map([["past", "yes"]]),
        timeZone: "UTC",
        now: new Date("2026-11-17T12:00:00Z"),
      }),
    ).toBe(false);
  });

  it("allows no votes on past options", () => {
    expect(
      hasNewPastAvailability({
        votes: [{ optionId: "past", type: "no" }],
        options,
        timeZone: "UTC",
        now: new Date("2026-11-17T12:00:00Z"),
      }),
    ).toBe(false);
  });
});
