// Site-wide settings. SITE_URL is set automatically by the GitHub Pages
// workflow (it becomes https://<user>.github.io/<repo> or your custom domain).
export default {
  name: 'Waypoint',
  tagline: 'Irish immigration, explained simply',
  url: (process.env.SITE_URL || 'http://localhost:8080').replace(/\/$/, ''),
  repo: process.env.GITHUB_REPOSITORY || 'dhruvabisht/waypoint',
  locale: 'en_IE',
  lang: 'en-IE',

  // Shown on the About page and in structured data, so readers (and Google)
  // can see who is responsible for the content.
  maintainer: { name: 'Dhruva Bisht', url: 'https://github.com/dhruvabisht' },

  // Every fact must be re-checked against its official source this often.
  // The weekly GitHub Action opens an issue when a page goes past it.
  reviewIntervalDays: 90,

  // Paste the codes from Google Search Console / Bing Webmaster Tools here
  // (the content="..." value of the meta tag they give you).
  googleSiteVerification: '',
  bingSiteVerification: '',
};
