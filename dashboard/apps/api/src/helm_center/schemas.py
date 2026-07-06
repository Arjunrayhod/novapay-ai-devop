from typing import Any

from pydantic import BaseModel


class HelmVersion(BaseModel):
    version: str


class HelmRelease(BaseModel):
    name: str
    namespace: str
    revision: int
    chart: str
    app_version: str
    status: str
    updated: str


class HelmReleaseDetail(BaseModel):
    name: str
    namespace: str
    revision: int
    chart: str
    app_version: str
    status: str
    updated: str
    description: str
    chart_metadata: dict[str, Any] = {}


class HelmHistory(BaseModel):
    revision: int
    status: str
    description: str
    date: str
    chart: str
    app_version: str


class HelmChart(BaseModel):
    name: str
    version: str
    app_version: str
    description: str
    type_field: str = ""
    repo: str = ""


class HelmRepository(BaseModel):
    name: str
    url: str
    status: str


class HelmDependency(BaseModel):
    name: str
    version: str
    condition: str = ""
    repository: str = ""
    enabled: bool = True


class HelmHealth(BaseModel):
    helm_installed: bool
    cli_version: str
    repositories_ok: int
    repositories_total: int
    releases_ok: int
    releases_total: int
    chart_count: int


class HelmOverview(BaseModel):
    total_releases: int
    healthy_releases: int
    failed_releases: int
    namespace_count: int
    repository_count: int
    chart_count: int
