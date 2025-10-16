import { UserEntity } from '@/modules/users/entities/user.entity';

export class AuthResponseDto {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;

  constructor(user: UserEntity, accessToken: string, refreshToken: string) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
