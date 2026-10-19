"use client";

import { shopCopy } from "./copy";
import { ProfileForm, type ProfileDefaults } from "./ProfileForm";

/** First-run setup: the full profile plus Terms and Privacy acceptance. */
export function OnboardingForm(props: {
  lang: string;
  defaults: ProfileDefaults;
  versions: { TERMS: string; PRIVACY: string };
  termsUrl: string;
  privacyUrl: string;
  returnTo: string;
}) {
  const t = shopCopy(props.lang);
  return (
    <ProfileForm
      lang={props.lang}
      defaults={props.defaults}
      returnTo={props.returnTo}
      submitLabel={t.continue}
      legal={{ versions: props.versions, termsUrl: props.termsUrl, privacyUrl: props.privacyUrl }}
    />
  );
}
