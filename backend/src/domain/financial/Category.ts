import { ValueObject } from '../shared/ValueObject';

interface CategoryProps {
  name: string;
  description?: string;
}

export class Category extends ValueObject<CategoryProps> {
  private constructor(props: CategoryProps) {
    super(props);
  }

  public static create(name: string, description?: string): Category {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    return new Category({ name: name.trim(), description });
  }

  public getName(): string {
    return this.props.name;
  }

  public getDescription(): string | undefined {
    return this.props.description;
  }
}