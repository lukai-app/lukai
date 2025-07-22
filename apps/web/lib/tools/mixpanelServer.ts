import mixpanel from 'mixpanel';
import { env } from '@/env';

const mixpanelServer = mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN);

export { mixpanelServer };
