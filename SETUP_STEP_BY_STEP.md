# Karakoram Vision Pakistan — Final One-Phase Setup

## 1. Import real images and documents

1. Extract this ZIP to `D:\KarakoramVisionPakistan` or another short path.
2. Double-click `IMPORT_ASSETS.bat`.
3. Enter the full path of the folder that directly contains the raw `assets` directory.
4. Wait for `ASSET_IMPORT_REPORT.json`.
5. Keep the original 3.9 GB extraction as a separate backup.

The importer selects mapped originals, removes duplicate thumbnails, converts suitable images to WebP, organizes media folders and rewrites source URLs.

## 2. Install and verify locally

Open Windows Terminal inside the project folder:

```bat
npm install
npm run build
npm test
```

Full local preview with Cloudflare server Functions:

```bat
npm run dev:full
```

Check:

- `/tours/`
- `/trekking/`
- `/expeditions/`
- `/jeep-safaris/`
- `/hunting-services/`
- `/blog/`
- `/car-rentals/`
- `/contact-us/`
- `/api/health`
- HTMX search/load-more
- desktop/mobile menus, gallery, FAQ and enquiry modal

## 3. Complete owner settings

Edit `src/_data/site.json` directly or later in Pages CMS:

- purchased domain
- legal/business name and license number
- exact address, phone and email
- latitude, longitude and service areas
- booking Google Form
- Formspree endpoints
- WhatsApp, Telegram, Messenger, LINE, WeChat, Viber, KakaoTalk and VK/MAX
- Tawk.to IDs
- Google, Bing and Yandex verification values
- real logo, favicon and social image

## 4. Review migrated content

Use `CONTENT_REVIEW_REPORT.csv` and prioritize pages containing prices, years, departures, permits, licenses, guarantees and legal claims.

Do not make a protected page indexable until it has complete and verified content. See `THIN_CONTENT_PROTECTION_REPORT.json` and `LEGACY_SYSTEM_PAGE_PROTECTION_REPORT.json`.

## 5. GitHub, Pages CMS and Cloudflare

1. Create a private GitHub repository.
2. Push this project.
3. Connect the repository to Pages CMS.
4. Connect the same repository to Cloudflare Pages.
5. Build command: `npm run build`
6. Output directory: `_site`
7. Root directory: leave blank.

## 6. Search launch

After the final domain is live:

1. Verify the domain in Google Search Console and Bing Webmaster Tools.
2. Submit `/sitemap.xml`.
3. Inspect and request indexing for the homepage and primary category/service pages.
4. Update Google Business Profile and all social/travel directory links.
5. Configure IndexNow only after the site and key file are deployed:

```powershell
$env:INDEXNOW_KEY="YOUR_RANDOM_KEY"
npm run indexnow
# deploy the generated key file, then:
$env:SUBMIT_INDEXNOW="1"
npm run indexnow
```
