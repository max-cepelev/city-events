import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements
} from "better-auth/plugins/admin/access";

export const applicationStatements = {
  categories: ["create", "read", "update", "delete"],
  events: ["create", "read", "update", "delete", "publish", "reject", "cancel"],
  organizers: ["create", "read", "update", "delete"],
  publications: ["create", "read", "retry", "delete"],
  settings: ["read", "update"],
  sources: ["create", "read", "update", "delete", "run"],
  users: ["create", "read", "update", "delete", "set-role"],
  venues: ["create", "read", "update", "delete"]
} as const;

const statements = {
  ...defaultStatements,
  ...applicationStatements
} as const;

export const accessControl = createAccessControl(statements);

const allApplicationPermissions = {
  categories: applicationStatements.categories,
  events: applicationStatements.events,
  organizers: applicationStatements.organizers,
  publications: applicationStatements.publications,
  settings: applicationStatements.settings,
  sources: applicationStatements.sources,
  users: applicationStatements.users,
  venues: applicationStatements.venues
} as const;

export const adminRole = accessControl.newRole({
  ...adminAc.statements,
  ...allApplicationPermissions
});

export const editorRole = accessControl.newRole({
  categories: ["create", "read", "update"],
  events: ["create", "read", "update"],
  organizers: ["create", "read", "update"],
  publications: ["read"],
  sources: ["read", "run"],
  venues: ["create", "read", "update"]
});

export const userRole = accessControl.newRole({});

export const roles = {
  admin: adminRole,
  editor: editorRole,
  user: userRole
} as const;

export type AppRole = keyof typeof roles;
