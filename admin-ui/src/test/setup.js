import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount between tests so a leaked timer or effect from one test can't
// keep firing during the next one — which is exactly the failure mode
// these tests exist to catch.
afterEach(() => cleanup());
