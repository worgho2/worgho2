import { BaseEntity } from './base-entity';

export interface UserData {
  id: string;
  email: string;
  password: string;
}

export class User extends BaseEntity {
  private constructor(private readonly data: UserData) {
    super();
  }

  toJSON() {
    return { ...this.data };
  }
}
