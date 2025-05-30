export abstract class BaseEntity {
  abstract toJSON(): Record<string, unknown>;
}
