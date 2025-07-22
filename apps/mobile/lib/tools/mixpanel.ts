import { Mixpanel } from 'mixpanel-react-native';
import { env } from '@/env';

const trackAutomaticEvents = false;

const mixpanel = new Mixpanel(
  env.EXPO_PUBLIC_MIXPANEL_TOKEN,
  trackAutomaticEvents
);

const optOutTrackingDefault = true;

mixpanel.init(optOutTrackingDefault, {
  debug: false,
  track_pageview: false,
});

export { mixpanel as mixpanelApp };
