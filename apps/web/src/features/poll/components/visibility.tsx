"use client";
/**
 * Manage what the user can and cannot see on the page
 */
import React from "react";
import {
  useParticipants,
  usePermissions,
  usePoll,
} from "@/features/poll/client";
import { shouldHideIndividualVotes } from "@/features/poll/utils";

export const IfScoresVisible = (props: React.PropsWithChildren) => {
  const context = React.useContext(VisibilityContext);

  if (context.canSeeScores) {
    return <>{props.children}</>;
  }

  return null;
};

export const useVisibility = () => {
  return React.useContext(VisibilityContext);
};

const VisibilityContext = React.createContext<{
  canSeeScores: boolean;
  canSeeParticipants: boolean;
}>({
  canSeeScores: true,
  canSeeParticipants: true,
});

export const useVisibleParticipants = () => {
  const { canSeeParticipants } = useVisibility();
  const { canEditParticipant } = usePermissions();
  const { participants } = useParticipants();

  const filteredParticipants = React.useMemo(() => {
    if (!canSeeParticipants) {
      return participants.filter((participant) =>
        canEditParticipant(participant.id),
      );
    }
    return participants;
  }, [canEditParticipant, canSeeParticipants, participants]);

  return filteredParticipants;
};

export const VisibilityProvider = ({ children }: React.PropsWithChildren) => {
  const poll = usePoll();
  const { participants } = useParticipants();
  const { canEditParticipant } = usePermissions();
  const userAlreadyVoted = participants.some((participant) => {
    return canEditParticipant(participant.id);
  });

  const canSeeParticipants = !poll.hideScores || userAlreadyVoted;
  const canSeeScores =
    canSeeParticipants &&
    !shouldHideIndividualVotes({
      hideVotesUntilFinalized: poll.hideVotesUntilFinalized,
      status: poll.status,
    });

  return (
    <VisibilityContext.Provider
      value={{
        canSeeScores,
        canSeeParticipants,
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
};
