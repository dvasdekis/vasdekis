# Cloudflare Pages Project
resource "cloudflare_pages_project" "vasdekis" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = var.production_branch

  # Build configuration - no build process needed for static site
  build_config {
    build_command   = ""
    destination_dir = "."
    root_dir        = ""
  }
}