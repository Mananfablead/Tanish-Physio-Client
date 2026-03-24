#!/usr/bin/env node

/**
 * SEO Validation Script for Tanish Physio & Fitness
 * 
 * This script automates testing of various SEO elements
 * Run: node scripts/test-seo.js
 */

import https from 'https';
import http from 'http';
import { parseStringPromise } from 'xml2js';

const BASE_URL = 'https://tanishphysiofitness.in';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

console.log(`\n${colors.blue}╔════════════════════════════════════════╗`);
console.log(`║   Tanish Physio - SEO Test Suite      ║`);
console.log(`╚════════════════════════════════════════╝${colors.reset}\n`);

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
};

/**
 * Make HTTP request and return response
 */
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                });
            });
        }).on('error', reject);
    });
}

/**
 * Test redirect
 */
async function testRedirect(name, url, expectedLocation) {
    try {
        const response = await fetchUrl(url);

        if (response.statusCode === 301 && response.headers.location?.includes(expectedLocation)) {
            console.log(`${colors.green}✓${colors.reset} ${name}`);
            results.passed++;
            return true;
        } else {
            console.log(`${colors.red}✗${colors.reset} ${name}`);
            console.log(`  Expected: 301 → ${expectedLocation}`);
            console.log(`  Got: ${response.statusCode} → ${response.headers.location || 'none'}`);
            results.failed++;
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} ${name} - Error: ${error.message}`);
        results.failed++;
        return false;
    }
}

/**
 * Test status code
 */
async function testStatusCode(name, url, expectedCode) {
    try {
        const response = await fetchUrl(url);

        if (response.statusCode === expectedCode) {
            console.log(`${colors.green}✓${colors.reset} ${name}`);
            results.passed++;
            return true;
        } else {
            console.log(`${colors.red}✗${colors.reset} ${name}`);
            console.log(`  Expected: ${expectedCode}, Got: ${response.statusCode}`);
            results.failed++;
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} ${name} - Error: ${error.message}`);
        results.failed++;
        return false;
    }
}

/**
 * Test meta tags in HTML
 */
async function testMetaTags(name, url, checks) {
    try {
        const response = await fetchUrl(url);
        const html = response.body;

        let allPassed = true;

        for (const check of checks) {
            const regex = check.pattern;
            const found = regex.test(html);

            if (found) {
                console.log(`${colors.green}✓${colors.reset} ${name}: ${check.label}`);
                results.passed++;
            } else {
                console.log(`${colors.red}✗${colors.reset} ${name}: ${check.label}`);
                results.failed++;
                allPassed = false;
            }
        }

        return allPassed;
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} ${name} - Error: ${error.message}`);
        results.failed++;
        return false;
    }
}

/**
 * Test sitemap validity
 */
async function testSitemap() {
    try {
        const response = await fetchUrl(`${BASE_URL}/sitemap.xml`);

        if (response.statusCode !== 200) {
            console.log(`${colors.red}✗${colors.reset} Sitemap returns ${response.statusCode}`);
            results.failed++;
            return false;
        }

        // Parse XML
        const result = await parseStringPromise(response.body);

        if (result.urlset && result.urlset.url) {
            const urls = result.urlset.url;
            console.log(`${colors.green}✓${colors.reset} Sitemap valid (${urls.length} URLs)`);
            results.passed++;

            // Check for important pages
            const importantPages = ['/', '/about', '/services', '/contact'];
            const pageUrls = urls.map(u => u.loc[0]);

            for (const page of importantPages) {
                if (pageUrls.some(url => url.includes(page))) {
                    console.log(`${colors.green}✓${colors.reset} Sitemap contains ${page}`);
                    results.passed++;
                } else {
                    console.log(`${colors.yellow}⚠${colors.reset} Sitemap missing ${page}`);
                    results.warnings++;
                }
            }

            return true;
        } else {
            console.log(`${colors.red}✗${colors.reset} Sitemap structure invalid`);
            results.failed++;
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} Sitemap test failed - ${error.message}`);
        results.failed++;
        return false;
    }
}

/**
 * Test robots.txt
 */
async function testRobotsTxt() {
    try {
        const response = await fetchUrl(`${BASE_URL}/robots.txt`);

        if (response.statusCode !== 200) {
            console.log(`${colors.red}✗${colors.reset} robots.txt not accessible`);
            results.failed++;
            return false;
        }

        const content = response.body;

        // Check for sitemap reference
        if (content.includes('Sitemap:')) {
            console.log(`${colors.green}✓${colors.reset} robots.txt contains sitemap reference`);
            results.passed++;
        } else {
            console.log(`${colors.yellow}⚠${colors.reset} robots.txt missing sitemap reference`);
            results.warnings++;
        }

        return true;
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} robots.txt test failed - ${error.message}`);
        results.failed++;
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log(`${colors.blue}[1/6] Testing Redirects${colors.reset}\n`);

    await testRedirect(
        'HTTP → HTTPS redirect',
        'http://tanishphysiofitness.in',
        'https://tanishphysiofitness.in'
    );

    await testRedirect(
        'WWW → Non-WWW redirect',
        'https://www.tanishphysiofitness.in',
        'https://tanishphysiofitness.in'
    );

    await testRedirect(
        'Trailing slash removal',
        'https://tanishphysiofitness.in/services/',
        'https://tanishphysiofitness.in/services'
    );

    await testRedirect(
        'index.html → root redirect',
        'https://tanishphysiofitness.in/index.html',
        'https://tanishphysiofitness.in/'
    );

    console.log(`\n${colors.blue}[2/6] Testing Status Codes${colors.reset}\n`);

    await testStatusCode(
        'Homepage returns 200',
        `${BASE_URL}/`,
        200
    );

    await testStatusCode(
        'About page returns 200',
        `${BASE_URL}/about`,
        200
    );

    await testStatusCode(
        'Non-existent page returns 404',
        `${BASE_URL}/this-page-does-not-exist`,
        404
    );

    console.log(`\n${colors.blue}[3/6] Testing Meta Tags${colors.reset}\n`);

    await testMetaTags('Homepage', `${BASE_URL}/`, [
        { label: 'Title tag', pattern: /<title>.*Tanish Physio.*<\/title>/i },
        { label: 'Meta description', pattern: /<meta[^>]*name=["']description["'][^>]*>/i },
        { label: 'Canonical tag', pattern: /<link[^>]*rel=["']canonical["'][^>]*>/i },
        { label: 'Hreflang tags', pattern: /hreflang=["'](en-in|x-default)["']/i },
        { label: 'Open Graph tags', pattern: /og:title/i },
        { label: 'Twitter Card', pattern: /twitter:card/i },
        { label: 'Structured data (JSON-LD)', pattern: /application\/ld\+json/i },
    ]);

    await testMetaTags('About Page', `${BASE_URL}/about`, [
        { label: 'Unique title', pattern: /<title>.*About.*<\/title>/i },
        { label: 'H1 tag', pattern: /<h1[^>]*>.*<\/h1>/i },
    ]);

    await testMetaTags('Services Page', `${BASE_URL}/services`, [
        { label: 'Unique title', pattern: /<title>.*Services.*<\/title>/i },
        { label: 'H1 tag', pattern: /<h1[^>]*>.*<\/h1>/i },
    ]);

    await testMetaTags('Contact Page', `${BASE_URL}/contact`, [
        { label: 'Unique title', pattern: /<title>.*Contact.*<\/title>/i },
        { label: 'H1 tag', pattern: /<h1[^>]*>.*<\/h1>/i },
    ]);

    console.log(`\n${colors.blue}[4/6] Testing Sitemap${colors.reset}\n`);
    await testSitemap();

    console.log(`\n${colors.blue}[5/6] Testing Robots.txt${colors.reset}\n`);
    await testRobotsTxt();

    console.log(`\n${colors.blue}[6/6] Checking Performance Headers${colors.reset}\n`);

    try {
        const response = await fetchUrl(BASE_URL);

        if (response.headers['strict-transport-security']) {
            console.log(`${colors.green}✓${colors.reset} HSTS header present`);
            results.passed++;
        } else {
            console.log(`${colors.yellow}⚠${colors.reset} HSTS header missing`);
            results.warnings++;
        }

        if (response.headers['content-encoding']?.includes('gzip')) {
            console.log(`${colors.green}✓${colors.reset} Gzip compression enabled`);
            results.passed++;
        } else {
            console.log(`${colors.yellow}⚠${colors.reset} Gzip compression not detected`);
            results.warnings++;
        }
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} Performance test failed - ${error.message}`);
        results.failed++;
    }

    // Print summary
    console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}              TEST SUMMARY${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.green}Passed:${colors.reset}   ${results.passed}`);
    console.log(`${colors.red}Failed:${colors.reset}   ${results.failed}`);
    console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings}\n`);

    const total = results.passed + results.failed;
    const percentage = ((results.passed / total) * 100).toFixed(1);

    console.log(`Score: ${percentage}%\n`);

    if (results.failed === 0 && results.warnings === 0) {
        console.log(`${colors.green}🎉 All tests passed! SEO implementation is excellent.${colors.reset}\n`);
    } else if (results.failed === 0) {
        console.log(`${colors.yellow}⚠ Some warnings found. Review and fix for optimal SEO.${colors.reset}\n`);
    } else {
        console.log(`${colors.red}❌ Critical issues found. Please fix failed tests immediately.${colors.reset}\n`);
    }

    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});
