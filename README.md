# HavenQuest - News Aggregator & Intelligence Portal

> Top Ad-Revenue Niche: **Real Estate Niche (CPC: $4 - $10+)**
> Aesthetics & Theme: **Editorial real-estate warmth; earthy terracotta, rustic brown, and gold.**

This workspace contains a premium, highly-interactive, responsive news aggregator website built with Vanilla HTML5, CSS3, and JavaScript. Optimized for high ad revenue through custom-engineered, context-aware mock advertisement integrations.

## Features

1. **Stunning Responsive Theme**: Tailored typography, gradients, glassmorphism headers, and custom dark/light modes.
2. **Interactive Calculator Component**: Fully functional **Mortgage Payment Estimator** designed specifically to keep users engaged.
3. **Live RSS Aggregation Engine**: Dynamic CORS-enabled RSS parsing capability allowing users to input and parse custom RSS resources into the DOM.
4. **Interactive News Reader**: Article feeds with sorting filters, full modal reading view, and mock comment and bookmarking capabilities.
5. **Real-Time Earnings Tracker Widget**: Evaluates user activity and clicks in real-time, computing simulated page views and ad-revenue metrics.

## File Structure

- `/index.html` - Core SEO structure, elements layout, and widgets.
- `/css/style.css` - Custom design token system, responsive styling, and animations.
- `/js/app.js` - Mock database (8 articles), RSS parser, modal handlers, and calculator logic.
- `/assets/hero.png` - Custom-designed hero graphic relevant to this niche.
- `/deploy.sh` - Git initialization and deployment helper command.
- `/.github/workflows/deploy.yml` - Ready-to-go GitHub Pages Actions integration.

## Deploy to GitHub Pages

1. Create a new repository on GitHub.
2. Run `./deploy.sh` in this workspace directory and follow the instructions to connect the remote URL:
   ```bash
   git remote add origin <your-repository-url>
   git push -u origin main
   ```
3. Enable GitHub Actions Deployment:
   - On GitHub, go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, change the dropdown to **GitHub Actions**.
   - The workflow `.github/workflows/deploy.yml` will trigger and publish the site automatically!
