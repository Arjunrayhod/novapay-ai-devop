{{- /*
aegisai-common.standardName - Returns the component name.
Usage: {{ include "aegisai-common.name" . }}
*/}}
{{- define "aegisai-common.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- /*
aegisai-common.fullname - Returns the fully qualified name.
Usage: {{ include "aegisai-common.fullname" . }}
*/}}
{{- define "aegisai-common.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- /*
aegisai-common.labels - Returns standard Kubernetes recommended labels plus AegisAI platform labels.
Usage: {{ include "aegisai-common.labels" . }}
*/}}
{{- define "aegisai-common.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ include "aegisai-common.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/component: {{ .Values.component | default "unknown" }}
app.kubernetes.io/part-of: {{ .Values.partOf }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
aegisai.io/environment: {{ .Values.global.environment }}
aegisai.io/tier: {{ .Values.global.tier }}
aegisai.io/data-classification: {{ .Values.global.dataClassification }}
aegisai.io/owner: {{ .Values.global.owner }}
aegisai.io/cost-center: {{ .Values.global.costCenter }}
{{- end }}

{{- /*
aegisai-common.selectorLabels - Returns labels used for pod selector (immutable after Deployment creation).
Usage: {{ include "aegisai-common.selectorLabels" . }}
*/}}
{{- define "aegisai-common.selectorLabels" -}}
app.kubernetes.io/name: {{ include "aegisai-common.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- /*
aegisai-common.annotations - Returns standard AegisAI annotations.
Usage: {{ include "aegisai-common.annotations" . }}
*/}}
{{- define "aegisai-common.annotations" -}}
aegisai.io/environment: {{ .Values.global.environment }}
aegisai.io/owner: {{ .Values.global.owner }}
aegisai.io/cost-center: {{ .Values.global.costCenter }}
aegisai.io/data-classification: {{ .Values.global.dataClassification }}
aegisai.io/compliance-frameworks: pci-dss,soc2,rbi
{{- end }}

{{- /*
aegisai-common.image - Returns the full container image reference.
Usage: {{ include "aegisai-common.image" . }}
*/}}
{{- define "aegisai-common.image" -}}
{{- $registry := .Values.image.registry | default "" }}
{{- $repository := .Values.image.repository }}
{{- $tag := .Values.image.tag | default (printf "v%s" .Chart.AppVersion) }}
{{- if $registry }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- else }}
{{- printf "%s:%s" $repository $tag }}
{{- end }}
{{- end }}

{{- /*
aegisai-common.namespace - Returns the release namespace.
Usage: {{ include "aegisai-common.namespace" . }}
*/}}
{{- define "aegisai-common.namespace" -}}
{{- .Release.Namespace }}
{{- end }}

{{- /*
aegisai-common.serviceAccountName - Returns the service account name.
Usage: {{ include "aegisai-common.serviceAccountName" . }}
*/}}
{{- define "aegisai-common.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "aegisai-common.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{- /*
aegisai-common.configmapName - Returns the ConfigMap name.
Usage: {{ include "aegisai-common.configmapName" . }}
*/}}
{{- define "aegisai-common.configmapName" -}}
{{- printf "%s-config" (include "aegisai-common.fullname" .) }}
{{- end }}
