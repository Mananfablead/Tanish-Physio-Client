# Tanish Physio - Your Wellness Path

A comprehensive digital wellness platform that connects patients with certified physiotherapists for personalized treatment plans and video consultations. This application provides accessible, professional physiotherapy services from the comfort of your home.

## About the Project

**Tanish Physio** was founded by Dr. Khushboo with a vision to revolutionize how people access physiotherapy services. The platform addresses challenges many individuals face in attending in-person sessions due to busy schedules, transportation issues, or mobility limitations. By combining professional expertise with cutting-edge technology, Tanish Physio delivers effective treatments and promotes overall wellness.

### Key Features

- **Video Consultations**: Connect with certified physiotherapists from anywhere
- **Personalized Treatment Plans**: Tailored programs for various conditions
- **Service Booking**: Schedule appointments at your convenience
- **Progress Tracking**: Monitor your wellness journey
- **Multiple Service Offerings**: From orthopedic rehabilitation to specialized programs
- **Home Service Options**: In-home physiotherapy services available
- **Therapist Discovery**: Find the right professional for your needs

### Services Offered

- Orthopedic rehabilitation
- Neurological physiotherapy
- Sports injury recovery
- Post-surgical rehabilitation
- Chronic pain management
- Weight management programs
- Posture correction
- Geriatric physiotherapy
- Pediatric physiotherapy
- Women's health physiotherapy
- In-home physiotherapy services

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## SEO and Performance

This application is optimized for search engines with:

- **React Helmet Async**: Dynamic meta tags for all pages
- **Structured Data**: JSON-LD schema markup for better search visibility
- **Prerendering**: Server-side rendering for crawlers using prerender-node
- **Sitemap Generation**: Automatic sitemap creation from API data
- **Image Optimization**: Lazy loading and proper alt tags
- **Performance Optimization**: Code splitting and asset optimization

### SEO Features

- Dynamic meta titles and descriptions
- Open Graph and Twitter Card support
- Canonical URLs
- Service-specific SEO for dynamic routes
- 404 page with proper status codes

### Deployment with Prerendering

For production deployment with SEO support:

```sh
# Build the application
npm run build

# Start the production server with prerendering
npm run start
```

The server uses prerender-node to serve prerendered HTML to search engine crawlers while maintaining SPA functionality for users.

### Environment Variables

Create a `.env` file with:

```
VITE_API_BASE_URL=your_api_url
VITE_GA_ID=your_google_analytics_id
PRERENDER_TOKEN=your_prerender_token
```
