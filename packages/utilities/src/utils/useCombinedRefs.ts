/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import { useRef, useEffect, RefObject } from 'react';

type PossibleRef<T> = ((instance: T | null) => void) | RefObject<T> | null | undefined;

/**
 * A custom hook that combines multiple refs into a single, valid ref.
 * @param  {...any} refs
 */
export function useCombinedRefs<T>(...refs: PossibleRef<T>[]) {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        (ref as any).current = targetRef.current;
      }
    });
    /**
     * Rest parameter syntax creates new array reference every render.
     * Refs should not be called multiple times.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return targetRef;
}
