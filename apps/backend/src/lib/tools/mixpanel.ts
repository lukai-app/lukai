import mixpanel from 'mixpanel';
import { env } from '../../env';

const mixpanelServer = mixpanel.init(env.MIXPANEL_TOKEN);

export { mixpanelServer };
