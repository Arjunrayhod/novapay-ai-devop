from pydantic import BaseModel
from typing import Any


class TerraformVersion(BaseModel):
    version: str
    revision: str
    platform: str
    provider_count: int


class TerraformResource(BaseModel):
    address: str
    type: str
    name: str
    provider: str
    module: str
    mode: str
    count: int | None = None


class TerraformModule(BaseModel):
    address: str
    source: str
    version: str
    resource_count: int


class TerraformProvider(BaseModel):
    name: str
    version: str
    source: str


class TerraformOutput(BaseModel):
    name: str
    value: str
    type: str
    sensitive: bool


class TerraformState(BaseModel):
    version: str
    terraform_version: str
    resource_count: int
    module_count: int
    output_count: int


class TerraformPlan(BaseModel):
    available: bool
    resources_add: int = 0
    resources_change: int = 0
    resources_destroy: int = 0
    plan_data: str = ""


class TerraformHealth(BaseModel):
    terraform_installed: bool
    cli_version: str
    state_loaded: bool
    providers_healthy: bool
    provider_count: int
    module_count: int
    resource_count: int


class TerraformOverview(BaseModel):
    terraform_installed: bool
    cli_version: str
    module_count: int
    resource_count: int
    provider_count: int
    output_count: int
    state_loaded: bool
