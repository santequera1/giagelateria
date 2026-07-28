import { useMemo } from 'react';
import * as Haptics from 'expo-haptics';

export interface HapticsApi {
  /** Light impact — chip / quantity / add-to-cart presses (SPEC §7). */
  light: () => void;
  /** Selection tick — quantity stepper. */
  selection: () => void;
}

const safe = (fn: () => Promise<void>) => () => {
  // expo-haptics no-ops on unsupported platforms; guard anyway.
  fn().catch(() => undefined);
};

export const useHaptics = (): HapticsApi =>
  useMemo<HapticsApi>(
    () => ({
      light: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
      selection: safe(() => Haptics.selectionAsync()),
    }),
    [],
  );
