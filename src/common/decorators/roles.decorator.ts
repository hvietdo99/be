import { Reflector } from '@nestjs/core';
import { UserRole } from '@modules/database/schemas/user.schema';

export const Roles = Reflector.createDecorator<UserRole[]>();
