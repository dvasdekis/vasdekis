output "pages_project_id" {
  description = "The ID of the Cloudflare Pages project"
  value       = cloudflare_pages_project.vasdekis.id
}

output "pages_project_name" {
  description = "The name of the Cloudflare Pages project"
  value       = cloudflare_pages_project.vasdekis.name
}

output "pages_project_subdomain" {
  description = "The subdomain of the Cloudflare Pages project"
  value       = cloudflare_pages_project.vasdekis.subdomain
}

output "pages_project_domains" {
  description = "The domains associated with the Cloudflare Pages project"
  value       = cloudflare_pages_project.vasdekis.domains
}

output "production_branch" {
  description = "The production branch for the project"
  value       = cloudflare_pages_project.vasdekis.production_branch
}