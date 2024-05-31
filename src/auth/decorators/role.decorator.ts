import { SetMetadata } from '@nestjs/common';

//set user role as metadata
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
