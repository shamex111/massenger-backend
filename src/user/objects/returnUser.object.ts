import { Prisma } from '@prisma/client';

export const returnUserObject: Prisma.UserSelect = {
  id: true,
  username: true,
  avatar: true,
  lastOnline: true,
  description: true,
  createdAt: true,
  isOnline:true,
  name:true,
  channelMembers:true,
  personalChats:true,
  personalChats2:true,
  groupMembers:true,
  PersonalChatNotification:true
};
export const returnUserObjectShort: Prisma.UserSelect = {
  id: true,
  username: true,
  avatar: true,
  lastOnline: true,
  description: true,
  createdAt: true,
  isOnline:true,
  name:true,
};

export const returnUserObjectForServer: Prisma.UserSelect = {
  id: true,
  username: true,
  avatar: true,
  lastOnline: true,
  description: true,
  createdAt: true,
  password:true,
  name:true
};

