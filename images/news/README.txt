MASTERSTOCK USA - News Card Images
====================================

CURRENT SETUP (Apr 2026)
------------------------
The 4 news cards on the home page now load Pexels editorial photos
directly via CDN (no local files needed). Each card links to the
specific real article from Retail Dive / CNBC / TheStreet.

  Card 1 (distress)  → https://images.pexels.com/photos/12793675/
  Card 2 (tariffs)   → https://images.pexels.com/photos/906494/
  Card 3 (shifts)    → https://images.pexels.com/photos/4940756/
  Card 4 (own POV)   → https://images.pexels.com/photos/4483608/

Pexels is free for commercial use without attribution required.
Source: pexels.com/license


HOW TO UPGRADE TO REAL OG:IMAGES (publisher's actual photo)
-----------------------------------------------------------
If you want the EXACT same look as competitors who pull the
publisher's real article photo, follow these steps:

1. Open each linked article in your browser (not Chrome incognito):
   Card 1: https://www.retaildive.com/news/distressed-retailers-vulnerable-could-file-bankruptcy-2026/810234/
   Card 2: https://www.cnbc.com/2026/04/03/trump-tariffs-trade-war-impact.html
   Card 3: https://www.thestreet.com/retail/mall-retailer-francescas-closing-in-chapter-11-bankruptcy-sets-final-dates

2. Right-click → "View page source" (Ctrl+U)

3. Search (Ctrl+F) for: og:image
   You'll find a tag like:
     <meta property="og:image" content="https://image.cnbcfm.com/.../article.jpg">

4. Copy the URL from `content="..."` (just the URL, not the whole tag)

5. Paste it back to me, or replace the src= in index.html directly:
   - Find: src="https://images.pexels.com/photos/906494/..."
   - Replace with: src="<the og:image URL you copied>"

LEGAL NOTE: Hotlinking publisher og:images is what news aggregators
do (Feedly, Apple News, Flipboard). It's defensible under fair use +
attribution. Risk is low/medium. Some publishers' images are licensed
from Getty/AP and they may issue a takedown if you go viral. Pexels
is the safest path.


WHERE TO GET MORE FREE COMMERCIAL PHOTOS
----------------------------------------
  - unsplash.com  (no attribution required)
  - pexels.com    (no attribution required)
  - pixabay.com   (no attribution required)

Search terms that work well for this site:
  - retail bankruptcy: "empty retail store", "closed shop", "store closing"
  - tariffs/trade:     "cargo port", "container ship", "shipping containers"
  - market shifts:     "clothing store", "boutique interior", "final sale"
  - warehouse/ops:     "warehouse aisle", "pallets inventory", "logistics storage"
