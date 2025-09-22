# Cloudflare Pages Project
resource "cloudflare_pages_project" "vasdekis" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = var.production_branch

  # Source configuration for GitHub integration
  source {
    type = "github"
    config {
      owner                         = split("/", var.github_repository)[0]
      repo_name                     = split("/", var.github_repository)[1]
      production_branch             = var.production_branch
      pr_comments_enabled           = true
      deployments_enabled           = true
      production_deployment_enabled = true
      preview_deployment_setting    = "all"
    }
  }

  # Build configuration - no build process needed for static site
  build_config {
    build_command   = ""
    destination_dir = "."
    root_dir        = ""
  }
}