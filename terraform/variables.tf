variable "cloudflare_account_id" {
  description = "The Cloudflare Account ID"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "The Cloudflare API Token with Pages permissions"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "The name of the Cloudflare Pages project"
  type        = string
  default     = "vasdekis"
}

variable "github_repository" {
  description = "The GitHub repository in format owner/repository"
  type        = string
  default     = "dvasdekis/vasdekis"
}

variable "production_branch" {
  description = "The branch to deploy from for production"
  type        = string
  default     = "main"
}