import { authHandlers } from './auth';
import { storesHandlers } from './stores';
import { tablesHandlers } from './tables';
import { menusHandlers } from './menus';
import { optionGroupsHandlers } from './option-groups';
import { ordersHandlers } from './orders';
import { recommendationsHandlers } from './recommendations';

export const handlers = [
  ...authHandlers,
  ...storesHandlers,
  ...tablesHandlers,
  ...menusHandlers,
  ...optionGroupsHandlers,
  ...ordersHandlers,
  ...recommendationsHandlers,
];
