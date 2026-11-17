"use client";

import { Trans } from "@/i18n/client";

export function ExpiredOptionLabel() {
  return (
    <span className="font-medium text-destructive text-xs">
      <Trans i18nKey="pollOptionExpired" defaults="Expired" />
    </span>
  );
}
