'use client';

import { useEffect } from 'react';
import { boot } from './boot';

/** Mounts the page's behaviour (3D hero, reveals, counters, tabs, menu) onto the server-rendered markup. */
export function SiteClient() {
  useEffect(() => boot(), []);
  return null;
}
