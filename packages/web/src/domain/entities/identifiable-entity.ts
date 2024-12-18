import { ServerErrors } from '../server-errors';

export abstract class IdentifiableEntity<T extends { id: string }> {
  constructor(protected data: T) {}

  public getData() {
    return this.data;
  }

  toJSON() {
    return this.getData();
  }

  get id(): string {
    return this.data.id;
  }

  static getValidDataOrThrow<K>(props: { data: K; schema: Zod.ZodType<K> }): K {
    const validation = props.schema.safeParse(props.data);
    if (!validation.success) throw ServerErrors.validation(validation.error);
    return validation.data;
  }
}
