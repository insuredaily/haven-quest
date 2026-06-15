#!/bin/bash
# ==========================================================================
# Deployment Script for HavenQuest
# ==========================================================================

echo "=== Deploying HavenQuest to GitHub Pages ==="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing new Git repository..."
    git init
    git branch -M main
fi

# Add files and commit
git add .
git commit -m "Initial commit - News aggregator workspace for HavenQuest"

echo ""
echo "Git commit successful."
echo ""
echo "To host this news aggregator on GitHub Pages, execute the following commands:"
echo "--------------------------------------------------------"
echo "  git remote add origin <YOUR_GITHUB_REPOSITORY_URL>"
echo "  git push -u origin main"
echo "--------------------------------------------------------"
echo ""
echo "After pushing to GitHub, perform the following setup:"
echo "  1. Navigate to your repository page on GitHub.com"
echo "  2. Go to 'Settings' > 'Pages' (under Code and automation)"
echo "  3. For 'Source', select 'GitHub Actions' (highly recommended, as we have bundled a pre-configured workflow)"
echo "  4. Your aggregator site will build and publish automatically in under 60 seconds!"
echo ""
read -p "Press any key to complete setup..."
