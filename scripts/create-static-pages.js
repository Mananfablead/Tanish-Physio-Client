#!/usr/bin/env node

/**
 * Static Page Generator with SEO Meta Tags
 * Creates HTML files with page-specific meta tags for better SEO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('\n📄 Creating Static HTML Pages with SEO Meta Tags...\n');

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: dist/index.html not found. Run build first.');
    process.exit(1);
}

// Read the main index.html as template
const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Route configurations with page-specific SEO
const routes = [
    {
        path: '/',
        title: 'Online Physiotherapy & Video Consultations in India | Tanish Physio & Fitness',
        description: 'Book online physiotherapy with certified therapists in India. Get video consultations, personalized rehab plans, and guided recovery from home.',
        keywords: 'physiotherapy, online physiotherapy, video consultation, rehabilitation, fitness training, pain relief'
    },
    {
        path: '/about',
        title: 'About Tanish Physio - Leading Rehabilitation Center in India',
        description: 'Learn about Tanish Physio & Fitness, India\'s trusted physiotherapy clinic with certified therapists specializing in rehabilitation and sports injury treatment.',
        keywords: 'about tanish physio, rehabilitation center India, certified physiotherapists, sports injury treatment'
    },
    {
        path: '/services',
        title: 'Our Physiotherapy Services | Pain Relief & Rehabilitation India',
        description: 'Comprehensive physiotherapy services including sports injury treatment, rehabilitation therapy, pain management, and posture correction.',
        keywords: 'physiotherapy services, sports injury treatment, rehabilitation therapy, pain relief clinic, posture correction'
    },
    {
        path: '/contact',
        title: 'Contact Us | Book Your Physiotherapy Session India',
        description: 'Get in touch with Tanish Physio & Fitness. Book your physiotherapy consultation or schedule a video appointment with certified therapists.',
        keywords: 'contact tanish physio, book physiotherapy session, physiotherapy consultation India, video appointment'
    },
    {
        path: '/faq',
        title: 'FAQ | Common Questions About Physiotherapy Treatment',
        description: 'Find answers to common questions about physiotherapy, online consultations, treatment procedures, and recovery processes.',
        keywords: 'physiotherapy FAQ, common questions, online physiotherapy, treatment procedures'
    },
    {
        path: '/terms',
        title: 'Terms of Service | Tanish Physio & Fitness',
        description: 'Read our terms of service, privacy policy, and important information about using Tanish Physio services.',
        keywords: 'terms of service, privacy policy, legal information'
    },
    {
        path: '/testimonials',
        title: 'Patient Testimonials | Success Stories from Tanish Physio',
        description: 'Read success stories and testimonials from patients who recovered with Tanish Physio & Fitness.',
        keywords: 'patient testimonials, success stories, physiotherapy reviews, patient recovery'
    },
    {
        path: '/free-consultation',
        title: 'Free Physiotherapy Consultation | Book Online Today',
        description: 'Schedule your free physiotherapy consultation with certified therapists. Get expert advice on pain management and rehabilitation.',
        keywords: 'free consultation, physiotherapy assessment, pain management advice'
    },
    {
        path: '/questionnaire',
        title: 'Health Assessment Questionnaire | Tanish Physio',
        description: 'Complete our comprehensive health assessment to help our therapists understand your condition and create a personalized treatment plan.',
        keywords: 'health assessment, physiotherapy questionnaire, online assessment'
    }
];

let created = 0;

routes.forEach((routeConfig) => {
    try {
        const route = routeConfig.path;
        const dirName = route === '/' ? '' : route.replace(/^\//, '');

        // Create page-specific HTML with custom meta tags
        let pageHtml = indexHtml;

        // Replace title tag
        pageHtml = pageHtml.replace(
            /<title>.*?<\/title>/i,
            `<title>${routeConfig.title}</title>`
        );

        // Replace meta description
        pageHtml = pageHtml.replace(
            /<meta name="description" content=".*?">/i,
            `<meta name="description" content="${routeConfig.description}">`
        );

        // Replace meta keywords
        pageHtml = pageHtml.replace(
            /<meta name="keywords" content=".*?">/i,
            `<meta name="keywords" content="${routeConfig.keywords}">`
        );

        // Replace Open Graph title
        pageHtml = pageHtml.replace(
            /<meta property="og:title" content=".*?">/i,
            `<meta property="og:title" content="${routeConfig.title}">`
        );

        // Replace Open Graph description
        pageHtml = pageHtml.replace(
            /<meta property="og:description" content=".*?">/i,
            `<meta property="og:description" content="${routeConfig.description}">`
        );

        // Add canonical URL
        const canonicalUrl = routeConfig.path === '/'
            ? 'https://tanishphysiofitness.in/'
            : `https://tanishphysiofitness.in${routeConfig.path}`;

        pageHtml = pageHtml.replace(
            /<link rel="canonical" href=".*?">/i,
            `<link rel="canonical" href="${canonicalUrl}">`
        );

        if (dirName) {
            const dirPath = path.join(distPath, dirName);

            // Create directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Write page-specific HTML
            const targetPath = path.join(dirPath, 'index.html');
            fs.writeFileSync(targetPath, pageHtml, 'utf8');

            console.log(`✅ Created: ${routeConfig.path} with custom SEO`);
            created++;
        } else {
            console.log(`✅ Root: Homepage SEO optimized`);
            created++;
        }
    } catch (error) {
        console.error(`❌ Error creating ${routeConfig.path}:`, error.message);
    }
});

// Create 404.html with appropriate meta tags
try {
    let notFoundHtml = indexHtml;

    notFoundHtml = notFoundHtml.replace(
        /<title>.*?<\/title>/i,
        '<title>Page Not Found - 404 Error | Tanish Physio & Fitness</title>'
    );

    notFoundHtml = notFoundHtml.replace(
        /<meta name="description" content=".*?">/i,
        '<meta name="description" content="The page you are looking for could not be found. Return to our homepage to continue exploring our professional physiotherapy services.">'
    );

    const notFoundPath = path.join(distPath, '404.html');
    fs.writeFileSync(notFoundPath, notFoundHtml, 'utf8');

    console.log(`✅ Created: 404 page with SEO`);
    created++;
} catch (error) {
    console.error(`❌ Error creating 404.html:`, error.message);
}

console.log(`\n✨ Static page generation complete!`);
console.log(`📊 Total pages created: ${created}\n`);
console.log('💡 All pages now have unique title and description meta tags for SEO!\n');
