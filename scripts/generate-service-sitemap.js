/**
 * Dynamic Sitemap Generator for Services
 * Fetches all services from API and generates sitemap entries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL for your website
const BASE_URL = 'https://tanishphysiofitness.in';

// API endpoint - Use environment variable or default to localhost
const API_URL = process.env.VITE_API_BASE_URL ? `${process.env.VITE_API_BASE_URL}/services` : 'http://localhost:5000/api/services';

async function fetchServices() {
    try {
        console.log('📡 Fetching services from:', API_URL);
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 API Response:', {
            hasData: !!data,
            isArray: Array.isArray(data),
            hasServices: !!data.services,
            serviceCount: data.services?.length || data.length || 0
        });

        // Handle different response formats
        const services = Array.isArray(data) ? data : (data.services || []);

        return services.map(service => ({
            slug: service.slug || service.serviceSlug || service.id,
            title: service.title || service.serviceName || service.name || 'Service',
            description: service.description || service.serviceDescription || '',
            isActive: service.isActive !== undefined ? service.isActive : true,
            _id: service._id || service.id
        })).filter(s => s.slug && s.isActive); // Only active services with slugs

    } catch (error) {
        console.error('❌ Error fetching services:', error.message);
        console.log('⚠️ Using fallback service slugs...');

        // Fallback: Common service slugs (update based on your actual services)
        return [
            { slug: 'orthopedic-physiotherapy', title: 'Orthopedic Physiotherapy' },
            { slug: 'neurological-physiotherapy', title: 'Neurological Physiotherapy' },
            { slug: 'sports-injury-rehabilitation', title: 'Sports Injury Rehabilitation' },
            { slug: 'pediatric-physiotherapy', title: 'Pediatric Physiotherapy' },
            { slug: 'geriatric-physiotherapy', title: 'Geriatric Physiotherapy' },
            { slug: 'post-surgical-rehabilitation', title: 'Post-Surgical Rehabilitation' },
            { slug: 'pain-management', title: 'Pain Management' },
            { slug: 'manual-therapy', title: 'Manual Therapy' },
            { slug: 'exercise-therapy', title: 'Exercise Therapy' },
            { slug: 'electrotherapy', title: 'Electrotherapy' },
            { slug: 'traction-therapy', title: 'Traction Therapy' },
            { slug: 'home-visit-physiotherapy', title: 'Home Visit Physiotherapy' },
        ];
    }
}

function generateServiceSitemapEntries(services) {
    console.log('📝 Generating sitemap entries for', services.length, 'services');

    return services.map((service, index) => {
        const slug = service.slug;
        const title = service.title;
        const lastmod = new Date().toISOString().split('T')[0];

        console.log(`  ${index + 1}. ${title} (${slug})`);

        return `  <url>
    <loc>${BASE_URL}/service/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    }).join('\n\n');
}

async function generateSitemap() {
    console.log('\n🚀 Starting Sitemap Generation...\n');

    // Fetch services
    const services = await fetchServices();
    console.log(`\n✅ Successfully fetched ${services.length} active services\n`);

    if (services.length === 0) {
        console.warn('⚠️ Warning: No services found! Sitemap will only contain static pages.');
    }

    // Generate service entries
    const serviceEntries = generateServiceSitemapEntries(services);

    // Read existing sitemap template
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

    const baseSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Main Pages -->
  <url>
    <loc>${BASE_URL}/</loc>
  </url>
  
  <!-- Google Site Verification -->
  <url>
    <loc>${BASE_URL}/googled11b95f7a82b5d50.html</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/services</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/about</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/contact</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/faq</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/therapists</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/plans</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/free-consultation</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/login</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/register</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/forgot-password</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/terms</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/testimonials</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/profile</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/booking</loc>
  </url>
 
  <url>
    <loc>${BASE_URL}/coming-soon</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/invoice</loc>
  </url>
  
  <url>
    <loc>${BASE_URL}/reset-password</loc>
  </url>
  
  <!-- Service Pages (Dynamic - Auto-generated) -->
${serviceEntries}
  
</urlset>`;

    // Write to public folder
    fs.writeFileSync(sitemapPath, baseSitemap, 'utf8');
    console.log(`\n✅ Sitemap generated successfully at: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${18 + services.length} (18 static + ${services.length} services)`);

    // Also copy to dist folder for production
    const distSitemapPath = path.join(__dirname, '..', 'dist', 'sitemap.xml');
    try {
        fs.mkdirSync(path.dirname(distSitemapPath), { recursive: true });
        fs.writeFileSync(distSitemapPath, baseSitemap, 'utf8');
        console.log(`✅ Sitemap copied to dist folder`);
    } catch (error) {
        console.error(`⚠️ Could not write to dist folder: ${error.message}`);
    }

    console.log('\n✨ Sitemap generation completed!\n');
}

// Run the generator
generateSitemap().catch(console.error);
