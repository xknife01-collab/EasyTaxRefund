/**
 * Multi-Page Facebook Access Token Manager for KTRS
 * Maps country-specific Facebook Page IDs to their respective Page Access Tokens.
 */

export const FACEBOOK_PAGE_TOKENS: Record<string, { name: string; countryCode: string; defaultLang: string; token: string }> = {
  // 1. Cambodia (KTRS - 캄보디아)
  '1272479639283122': {
    name: 'KTRS - សងប្រាក់ពន្ធកូរ៉េ (Cambodia)',
    countryCode: 'kh',
    defaultLang: 'km',
    token: 'EAAToYrFkGWYBSAwsEIlJiCe6HgkVcWFCEMRCZBjDuJpMDFTMmV6UPnc5ancZBbwfnhPtZBfDBkIZBy62uGFmX4I21n2ndqmECWZAoL1Oj026vW0XJ38Rm3laa4DIlZCe6EP6vPncMqNRCH839FtWs3UHYkw9w7n1ioq0uBrqgZCdiULcUpkmAtZCD5kbkXZBpZCQqGZCxlkCoUzhm6XoQ6EMIqG7AZDZD',
  },
  // 2. Vietnam (Ktrs-Việt Nam)
  '1348239181695751': {
    name: 'Ktrs-Việt Nam',
    countryCode: 'vn',
    defaultLang: 'vi',
    token: 'EAAToYrFkGWYBSOUJco4xu47rYae3LVe4A2rDRR6bwbTrSq9WVjGOnTSlMUZB0uRYnGR36OvnqdBzpkijmzjoUlfCfZAxcNc7h9kzgq0l2N3cXxE8PZBhypM3xNirqMn5QFnAzas2acoKkVBQMuFh9M15id9GWDxffR3zajRnjcbf1uCLAA5cBC150y0keCLeRwk76mP1utAg1YykyHVJW6bRgZDZD',
  },
  // 3. Indonesia (KTRS - Pengembalian Pajak Korea)
  '1273227885873224': {
    name: 'KTRS - Pengembalian Pajak Korea',
    countryCode: 'id',
    defaultLang: 'id',
    token: 'EAAToYrFkGWYBSFYAtkUKJ57VM1X7a7AbUXafZAIKCTPQm04vZCIBF9pv9g8Q91ASzZAOfARIVKqgJLWlzemNtWn9pNksLdmEDszVpEAPNRQJdHLzjLo8ZBtgnPLyDZC1H3LPdruMQsOYWwLuEuBvPj6Eigb42pCWaadLhJgcYD7Rp8QouE96JhLmqoYYhQdvHDzJOqN5rOWYh4VLmYdbFk7KusgZDZD',
  },
  // 4. Uzbekistan (KTRS - Koreyada Soliq Qaytarish)
  '1182883278252015': {
    name: 'KTRS - Koreyada Soliq Qaytarish',
    countryCode: 'uz',
    defaultLang: 'uz',
    token: 'EAAToYrFkGWYBSFPKnrD9a0ouFIucgPrMSzi7iOOybNEfY8cOYzCpFgIIzLevEwriZAilFZBcoqZCWuxUZBrJHmyilGBAxvomw48Wk0M5VtyuSVnXOH0ZCR47VujgMCckGqhn5CFZCzZCsUwVQjasPmWnZA6duoEZAhp3FoF440VC2foeWmZBDZBtFinqBCgXNdtVNKZApMhgaIKNgcqqoonb6ZCUn7e10rQZDZD',
  },
  // 5. Myanmar (Ktrs- မြန်မာအခွန်ပြန်အမ်းငွေ)
  '1215636948310325': {
    name: 'Ktrs- မြန်မာအခွန်ပြန်အမ်းငွေ',
    countryCode: 'mm',
    defaultLang: 'my',
    token: 'EAAToYrFkGWYBSJKBowVYQEbZBDsT8QZBgaavjJmEYQsE9fY9NAXRZBuZCZBQOMD9gjpoQo17rG4ZAy6474cRUexudGDvsmPkWtX8SS17vh2Uup8Jt3VQ5J84Nj7o4Be2GBAAqgQklaZC2bN5L5WEiGqnHaCqb5tJGqZAh4ahYZCFOQEpnZCDWLiKMrXMhdZBu6SN86bFUFpdwJYrK0wTsuC8I5LnFtMLQZDZD',
  },
  // 6. Nepal (Ktrs-नेपाल)
  '1304270589428864': {
    name: 'Ktrs-नेपाल (Nepal)',
    countryCode: 'np',
    defaultLang: 'ne',
    token: 'EAAToYrFkGWYBSBGb1UFS2AETzjMGQJLf8CdehPFBudkpwfxoRBrzoTbIAhT6PSP0ft3rFepZCIZAUgIijeT7FwbQ8NjLlPEUllAF1zOIYwHOnLVgg72BIFdnnZBE1xWDoOapsKpZCltHGpnG28ueo0vdGTeBZAhcZBs9U6JYV8pavCaPVhCN40Q1xCAoZAsnCr5NFR9datfVE4H3SHXMgZBEiuikwwZDZD',
  },
};

/**
 * Resolves the correct Facebook Page Access Token by Page ID,
 * falling back to process.env.FACEBOOK_PAGE_ACCESS_TOKEN.
 */
export function getFacebookPageToken(pageId?: string): string {
  if (pageId && FACEBOOK_PAGE_TOKENS[pageId]?.token) {
    return FACEBOOK_PAGE_TOKENS[pageId].token;
  }
  // Try environment JSON override if present
  if (process.env.FACEBOOK_PAGE_TOKENS_JSON) {
    try {
      const customTokens = JSON.parse(process.env.FACEBOOK_PAGE_TOKENS_JSON);
      if (pageId && customTokens[pageId]) {
        return customTokens[pageId];
      }
    } catch {}
  }
  return process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
}
