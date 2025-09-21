# Terraform Configuration for Cloudflare Pages

This directory contains Terraform configuration to manage the Cloudflare Pages project for the Vasdekis website.

## Prerequisites

1. [Terraform](https://www.terraform.io/downloads.html) >= 1.0
2. A Cloudflare account with Pages enabled
3. A Cloudflare API token with the following permissions:
   - `Zone:Zone:Read` (for the domain if using custom domains)
   - `Zone:Page Rules:Edit` (if using page rules)
   - `Account:Cloudflare Pages:Edit`

## Setup

1. **Copy the example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars` with your actual values:**
   ```hcl
   cloudflare_account_id = "your-actual-account-id"
   cloudflare_api_token  = "your-actual-api-token"
   ```

   You can find your Account ID in the Cloudflare dashboard sidebar.

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Plan the deployment:**
   ```bash
   terraform plan
   ```

5. **Apply the configuration:**
   ```bash
   terraform apply
   ```

## What This Creates

- **Cloudflare Pages Project**: A new Pages project named "vasdekis"
- **GitHub Integration**: Automatic deployments from the `main` branch
- **Preview Deployments**: Automatic preview deployments for all pull requests
- **Build Configuration**: Configured for static site deployment (no build process)

## Project Configuration

The Terraform configuration creates a Pages project with:

- **Production Branch**: `main`
- **Build Command**: None (static site)
- **Output Directory**: `.` (root directory)
- **Preview Deployments**: Enabled for all branches except `main`
- **PR Comments**: Enabled for deployment status updates

## Managing the Infrastructure

### View Current State
```bash
terraform show
```

### Update Configuration
1. Modify the `.tf` files as needed
2. Run `terraform plan` to review changes
3. Run `terraform apply` to apply changes

### Destroy Infrastructure
```bash
terraform destroy
```
**⚠️ Warning**: This will delete the Cloudflare Pages project and all associated deployments.

## Integration with GitHub Actions

This Terraform configuration is designed to work alongside the existing GitHub Actions workflow (`.github/workflows/deploy.yml`). The workflow handles the actual deployment of code changes, while Terraform manages the project configuration and settings.

## Outputs

After applying, Terraform will output:
- `pages_project_id`: The unique ID of the Pages project
- `pages_project_name`: The project name
- `pages_project_subdomain`: The default subdomain (`vasdekis.pages.dev`)
- `pages_project_domains`: All domains associated with the project
- `production_branch`: The configured production branch

## Security Notes

- The `terraform.tfvars` file is ignored by git to prevent accidental exposure of sensitive values
- API tokens and Account IDs are marked as sensitive in the configuration
- Store your API token securely and rotate it regularly