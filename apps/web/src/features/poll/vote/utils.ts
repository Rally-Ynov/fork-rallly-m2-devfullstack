import type { VoteType } from "@/features/poll/constants";
import { getCalendarDate, toISODate } from "@/lib/datetime/utils";

export type PollOptionForVote = {
  id: string;
  startTime: Date;
  duration: number;
};

export function isPollOptionPast(
  option: Pick<PollOptionForVote, "startTime" | "duration">,
  timeZone: string,
  now: Date = new Date(),
) {
  if (option.duration > 0) {
    return option.startTime.getTime() <= now.getTime();
  }

  return toISODate(option.startTime) < getCalendarDate(now, timeZone);
}

export function hasNewPastAvailability({
  votes,
  options,
  existingVotes,
  timeZone,
  now,
}: {
  votes: { optionId: string; type: VoteType }[];
  options: PollOptionForVote[];
  existingVotes?: Map<string, VoteType>;
  timeZone: string;
  now?: Date;
}) {
  const optionsById = new Map(options.map((option) => [option.id, option]));

  return votes.some((vote) => {
    const option = optionsById.get(vote.optionId);
    if (
      !option ||
      vote.type === "no" ||
      !isPollOptionPast(option, timeZone, now)
    ) {
      return false;
    }

    return existingVotes?.get(vote.optionId) !== vote.type;
  });
}
