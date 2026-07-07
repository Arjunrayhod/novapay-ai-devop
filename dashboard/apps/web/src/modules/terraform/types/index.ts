export interface TerraformVersion {
  version: string;
  revision: string;
  platform: string;
  provider_count: number;
}

export interface TerraformResource {
  address: string;
  type: string;
  name: string;
  provider: string;
  module: string;
  mode: string;
  count: number | null;
}

export interface TerraformModule {
  address: string;
  source: string;
  version: string;
  resource_count: number;
}

export interface TerraformProvider {
  name: string;
  version: string;
  source: string;
}

export interface TerraformOutput {
  name: string;
  value: string;
  type: string;
  sensitive: boolean;
}

export interface TerraformState {
  version: string;
  terraform_version: string;
  resource_count: number;
  module_count: number;
  output_count: number;
}

export interface TerraformPlan {
  available: boolean;
  resources_add: number;
  resources_change: number;
  resources_destroy: number;
  plan_data: string;
}

export interface TerraformHealth {
  terraform_installed: boolean;
  cli_version: string;
  state_loaded: boolean;
  providers_healthy: boolean;
  provider_count: number;
  module_count: number;
  resource_count: number;
}

export interface TerraformOverview {
  terraform_installed: boolean;
  cli_version: string;
  module_count: number;
  resource_count: number;
  provider_count: number;
  output_count: number;
  state_loaded: boolean;
}
