import mixpanel from 'mixpanel-browser';
import { env } from '@/env';

mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
  debug: false,
  track_pageview: false,
  persistence: 'localStorage',
});

export { mixpanel };
