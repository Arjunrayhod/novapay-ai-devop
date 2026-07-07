export interface TerraformWorkspace {
  name: string;
  directory: string;
  stateFile: string;
  resources: number;
  outputs: Record<string, TerraformOutput>;
  version: string;
  lastModified: string;
}

export interface TerraformOutput {
  sensitive: boolean;
  type: string;
  value: unknown;
}

export interface TerraformResource {
  address: string;
  mode: string;
  type: string;
  name: string;
  provider: string;
  status: string;
}

export interface TerraformPlan {
  id: string;
  changes: number;
  additions: number;
  changes_count: number;
  destructions: number;
  resources: TerraformResource[];
  createdAt: string;
}

export interface TerraformValidation {
  valid: boolean;
  errors: TerraformError[];
  warnings: string[];
}

export interface TerraformError {
  message: string;
  range?: {
    filename: string;
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}
