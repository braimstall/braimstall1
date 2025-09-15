// Fill an input by the visible label text in the same "row"/group.
// Robust on 2-column layouts and avoids Address lines.
async function fillByGroupLabel(page, opts) {
  const { labels, value, prefer = 'any', excludeAddress = true } = opts;

  // 1) True accessible label (for/aria-labelledby)
  for (const lbl of labels) {
    const acc = page.getByLabel(new RegExp(lbl, 'i'), { exact: false });
    try {
      if (await acc.first().isVisible({ timeout: 800 })) {
        await acc.first().fill(value);
        await acc.first().blur();
        return true;
      }
    } catch {}
  }

  // 2) Visual/DOM fallback: pick the input in the same group/row as the label text.
  return await page.evaluate(({ labels, value, prefer, excludeAddress }) => {
    const labelRegexes = labels.map(s => new RegExp(s, 'i'));
    const visible = el => {
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    };
    const matchesText = el => labelRegexes.some(rx => rx.test((el.textContent || '').trim()));

    const setVal = (el, v) => {
      const proto = el.tagName.toLowerCase() === 'textarea'
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) desc.set.call(el, v); else el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const isZipish = el => {
      const t = ((el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.id || '')).toLowerCase();
      return /\b(zip|postal|post ?code|postcode|code)\b/.test(t) || el.autocomplete === 'postal-code';
    };
    const isCityish = el => /\b(city|town)\b/i.test((el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.id || ''));
    const isAddressish = el => /\baddress|addr(line|1|2|3)?\b/i.test((el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.id || ''));

    const labelCandidates = Array.from(document.querySelectorAll('label, span, div, p, strong, b'))
      .filter(visible).filter(matchesText);
    if (!labelCandidates.length) return false;

    const allInputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type]), textarea, input[type="search"], input[type="tel"]'))
      .filter(el => visible(el) && !el.disabled && !el.readOnly);

    const preferZip = prefer === 'zip';
    const preferCity = prefer === 'city';

    for (const label of labelCandidates) {
      // find a reasonable container row
      const row = label.closest('.form-group, .form-row, .row, [class*="field"], [class*="group"], [class*="col"]') || label.parentElement;
      let inputs = row ? Array.from(row.querySelectorAll('input, textarea')).filter(visible) : [];

      // fall back: look a couple of siblings ahead (same section/row)
      if (!inputs.length) {
        let sib = row ? row.nextElementSibling : null;
        for (let i = 0; i < 3 && sib && !inputs.length; i++, sib = sib.nextElementSibling) {
          inputs = Array.from(sib.querySelectorAll('input, textarea')).filter(visible);
        }
      }
      if (!inputs.length) continue;

      if (excludeAddress) inputs = inputs.filter(el => !isAddressish(el));
      if (!inputs.length) continue;

      // prefer semantically right input, then nearest to the right/below the label
      inputs.sort((a, b) => {
        const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect(), lr = label.getBoundingClientRect();
        let sa = 0, sb = 0;
        if (preferZip) { sa += isZipish(a) ? -6 : 0; sb += isZipish(b) ? -6 : 0; }
        if (preferCity){ sa += isCityish(a)? -6 : 0; sb += isCityish(b)? -6 : 0; }
        // penalize inputs above the label (we want the row below the label)
        sa += (ar.top < lr.top - 6) ? 6 : 0; sb += (br.top < lr.top - 6) ? 6 : 0;
        // tiny bias to the right of the label
        sa += (ar.left < lr.left) ? 1 : 0;  sb += (br.left < lr.left) ? 1 : 0;
        return sa - sb;
      });

      const target = inputs[0];
      if (target) { setVal(target, value); return true; }
    }
    return false;
  }, { labels, value, prefer, excludeAddress });
}
// Robustly fill an input by the visible label inside the same "form-group" row.
// Works on 2-column layouts and avoids Address lines.
async function fillByGroupLabel(page, opts) {
  const { labels, value, prefer = 'any', excludeAddress = true } = opts;

  // First try true accessible labels (for/aria-labelledby)
  for (const lbl of labels) {
    const byAcc = page.getByLabel(new RegExp(lbl, 'i'), { exact: false });
    try {
      if (await byAcc.first().isVisible({ timeout: 800 })) {
        await byAcc.first().fill(value);
        await byAcc.first().blur();
        return true;
      }
    } catch {}
  }

  // DOM/visual fallback: find the container row that contains the label text,
  // then the input/textarea in that same container (or its immediate siblings).
  return await page.evaluate(({ labels, value, prefer, excludeAddress }) => {
    const labelRegexes = labels.map(s => new RegExp(s, 'i'));
    const textMatches = el => labelRegexes.some(rx => rx.test((el.textContent || '').trim()));

    const visible = el => {
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return r.width > 0 && r.height > 0 && style.visibility !== 'hidden';
    };

    const setVal = (el, v) => {
      const proto = el.tagName.toLowerCase() === 'textarea'
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) desc.set.call(el, v); else el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const candidates = Array.from(document.querySelectorAll('label, span, div, p, strong, b'))
      .filter(visible)
      .filter(textMatches);

    const preferZip = prefer === 'zip';
    const preferCity = prefer === 'city';

    const isZipish = el => {
      const t = (el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.id || '');
      return /\b(zip|postal|post ?code|postcode|code)\b/i.test(t) || el.autocomplete === 'postal-code';
    };
    const isCityish = el => /\bcity|town\b/i.test((el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.id || ''));
    const isAddressish = el => /\baddress|addr(line|1|2|3)?\b/i.test((el.placeholder || '') + ' ' + (el.name || '') + ' ' + (el.id || ''));

    for (const label of candidates) {
      // find a reasonable "row" container
      const row = label.closest('.form-group, .form-row, .row, [class*="field"], [class*="group"], [class*="col"]') || label.parentElement;
      if (!row) continue;

      // look inside the row first
      let inputs = Array.from(row.querySelectorAll('input[type="text"], input:not([type]), textarea, input[type="search"], input[type="tel"], input[type="number"]'))
        .filter(visible)
        .filter(el => !el.disabled && !el.readOnly);

      // if not found, look in immediate following siblings (same section)
      if (!inputs.length) {
        let sib = row.nextElementSibling;
        for (let i = 0; i < 3 && sib && !inputs.length; i++, sib = sib.nextElementSibling) {
          inputs = Array.from(sib.querySelectorAll('input, textarea')).filter(visible);
        }
      }
      if (!inputs.length) continue;

      // filter out address lines when requested
      if (excludeAddress) {
        inputs = inputs.filter(el => !isAddressish(el));
      }

      // prefer semantically correct target
      inputs.sort((a, b) => {
        const aZip = isZipish(a), bZip = isZipish(b);
        const aCity = isCityish(a), bCity = isCityish(b);
        let scoreA = 0, scoreB = 0;
        if (preferZip) { scoreA += aZip ? -5 : 0; scoreB += bZip ? -5 : 0; }
        if (preferCity){ scoreA += aCity? -5 : 0; scoreB += bCity? -5 : 0; }
        // prefer inputs positioned to the right or below the label
        const lr = label.getBoundingClientRect();
        const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
        scoreA += (ar.top < lr.top - 6) ? 5 : 0;
        scoreB += (br.top < lr.top - 6) ? 5 : 0;
        scoreA += (ar.left < lr.left) ? 1 : 0;
        scoreB += (br.left < lr.left) ? 1 : 0;
        return scoreA - scoreB;
      });

      const target = inputs[0];
      if (target) { setVal(target, value); return true; }
    }
    return false;
  }, { labels, value, prefer, excludeAddress });
}
// update_fifa_profiles.js — FIFA Complete Account Setup with ENHANCED Country Support
// ---------------------------------------------------------------------
// Features:
// • Reads Excel file with FIFA account credentials  
// • Signs into each account with human-like behavior
// • Detects and handles CAPTCHA challenges
// • Anti-bot detection measures (stealth mode, random delays)
// • Handles cookie consent ("I'm OK with that")
// • FILLS PROFILE FIELDS: Last Name, Mobile, Gender + Continue
// • ENHANCED ADDRESS FIELDS: Country-specific administrative divisions
//   - United States: State field
//   - France: Department + Region fields
//   - Spain: Province field
//   - Switzerland: Canton field
//   - Italy: Region field
//   - Belgium: Region field
// • SELECTS "I accept" authorization and clicks Save
// • Browsers stay open for manual inspection
// • COMPLETE FIFA ACCOUNT SETUP AUTOMATION
// ---------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
let pLimit = require('p-limit');
if (typeof pLimit !== 'function' && pLimit && typeof pLimit.default === 'function') {
  pLimit = pLimit.default;
}
const { chromium } = require('playwright');

// ------------------------- CLI Configuration -------------------------
const argv = process.argv.slice(2);
function getFlag(name, fallback = undefined) {
  const k = `--${name}`;
  const ix = argv.findIndex(a => a === k || a.startsWith(`${k}=`));
  if (ix === -1) return fallback;
  return argv[ix].includes('=') ? argv[ix].split('=').slice(1).join('=') : argv[ix + 1];
}

const EXCEL_PATH = path.resolve(__dirname, getFlag('excel', 'Update FIFA Profiles.xlsx'));
const SHEET_NAME = getFlag('sheet', 'Blad1');
const CONCURRENCY = Math.max(1, parseInt(getFlag('concurrency', '1'), 10) || 1);
const HEADLESS = (getFlag('headless', '') || process.env.HEADLESS || '').toString().toLowerCase() === 'true';
const DELAY_BETWEEN_ACCOUNTS = parseInt(getFlag('delay', '15000'), 10) || 15000;
const KEEP_BROWSER_OPEN = parseInt(getFlag('keepOpen', '30000'), 10) || 30000;
const USE_STEALTH = (getFlag('stealth', 'true')).toLowerCase() !== 'false';

const FIFA_BASE_URL = 'https://fifaworldcup26.deposit.fifa.com';
const FIFA_SIGNIN_URL = `${FIFA_BASE_URL}/account`;

// ------------------------- Human-like Helpers -------------------------
// Fast mode: minimal delay
function randomDelay(min = 10, max = 30) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function humanClick(page, selector) {
  const element = page.locator(selector).first();
  await element.hover();
  // Fast mode: no wait
  await element.click();
}

async function humanType(page, selector, text) {
  const element = page.locator(selector).first();
  await element.click();
  await element.clear();
  // Fast mode: fill all at once
  await element.type(text, { delay: 0 });
}

// ------------------------- CAPTCHA Detection -------------------------
async function detectCaptcha(page) {
  console.log('🤖 Checking for CAPTCHA/bot detection...');
  
  const captchaIndicators = [
    'text=Slide right to complete',
    'text=unusual activity',
    'text=bot activity',
    'text=Complete the puzzle',
    'text=human verification',
    'text=verify',
    'text=captcha',
    'text=I\'m not a robot',
    '.captcha, .puzzle, .challenge',
    '[id*="captcha"]',
    '[class*="captcha"]',
    '[class*="recaptcha"]',
    'iframe[src*="recaptcha"]',
    'iframe[src*="captcha"]',
    '.cf-challenge-running',
    '[aria-label*="captcha"]'
  ];
  
  for (const indicator of captchaIndicators) {
    try {
      if (await page.locator(indicator).first().isVisible({ timeout: 2000 })) {
        console.log(`🚨 CAPTCHA detected: ${indicator}`);
        return true;
      }
    } catch (e) {
      continue;
    }
  }
  
  return false;
}

async function handleCaptcha(page, account) {
  const captchaDetected = await detectCaptcha(page);
  
  if (captchaDetected) {
    console.log(`🚨 [${account.email}] CAPTCHA DETECTED - Manual intervention required!`);
    console.log(`⏰ [${account.email}] Waiting 120 seconds for manual CAPTCHA solving...`);
    console.log(`🖱️  [${account.email}] Please solve the CAPTCHA manually in the browser`);
    console.log(`⚠️  [${account.email}] Script will continue automatically after 2 minutes`);
    
    const captchaStartTime = Date.now();
    const captchaTimeout = 120000;
    
    while ((Date.now() - captchaStartTime) < captchaTimeout) {
      await page.waitForTimeout(5000);
      
      const stillVisible = await detectCaptcha(page);
      if (!stillVisible) {
        console.log(`✅ [${account.email}] CAPTCHA solved! Continuing with form filling...`);
        return true;
      }
      
      const elapsed = Math.round((Date.now() - captchaStartTime) / 1000);
      console.log(`⏳ [${account.email}] CAPTCHA still present... (${elapsed}s elapsed)`);
    }
    
    console.log(`⚠️  [${account.email}] CAPTCHA timeout reached - attempting to continue anyway`);
    return false;
  }
  
  return true;
}

// ------------------------- ENHANCED ADDRESS FORM FILLING -------------------------

// 

// 2. REPLACE it with:
async function fillAddressForm(page, account) {
  // Use the enhanced function instead
  return await enhancedFillAddressForm(page, account);
}

// 3. ADD all the aggressive helper functions BEFORE the fillAddressForm function:

// AGGRESSIVE CITY FIELD FILLING
async function aggressiveFillCity(page, account) {
  // For UK, use city, not postcode
  let cityValue = account.city || 'Paris';
  if ((account.country || '').toLowerCase().includes('united kingdom')) {
    cityValue = account.city || 'London';
  }
  console.log(`🏙️  [${account.email}] AGGRESSIVE City filling: "${cityValue}"`);
  
  const strategies = [
    // Strategy 1: Standard selectors
    async () => {
      const selectors = [
        'input[placeholder*="City" i]',
        'input[name*="city" i]', 
        'input[id*="city" i]',
        'label:has-text("City") + input',
        'label:has-text("City") ~ input'
      ];
      
      for (const selector of selectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible({ timeout: 1000 })) {
            await field.click();
            await field.clear();
            await field.fill(cityValue);
            await field.blur();
            
            const value = await field.inputValue();
            if (value === cityValue) {
              console.log(`✅ [${account.email}] City filled via selector: ${selector}`);
              return true;
            }
          }
        } catch (e) { continue; }
      }
      return false;
    },
    
    // Strategy 2: Position-based detection
    async () => {
      try {
        const allInputs = page.locator('input[type="text"]');
        const count = await allInputs.count();
        
        for (let i = 0; i < count; i++) {
          const field = allInputs.nth(i);
          if (await field.isVisible({ timeout: 500 })) {
            const placeholder = await field.getAttribute('placeholder').catch(() => '');
            const value = await field.inputValue().catch(() => '');
            
            // Skip if already filled with address or zip
            if (value && (value.includes('Street') || value.includes('Avenue') || /^\d+$/.test(value))) {
              continue;
            }
            
            // Look for city indicators
            if (placeholder.toLowerCase().includes('city') || 
                placeholder.toLowerCase().includes('ville') ||
                (placeholder === '' && i >= 1 && i <= 5)) {
              
              await field.click();
              await field.clear();
              await field.fill(cityValue);
              await field.blur();
              
              const newValue = await field.inputValue();
              if (newValue === cityValue) {
                console.log(`✅ [${account.email}] City filled via position ${i}`);
                return true;
              }
            }
          }
        }
      } catch (e) {}
      return false;
    },
    
    // Strategy 3: JavaScript DOM manipulation
    async () => {
      try {
        const result = await page.evaluate((cityValue) => {
          // Find by placeholder
          const inputs = document.querySelectorAll('input[type="text"]');
          for (const input of inputs) {
            const placeholder = input.placeholder || '';
            const name = input.name || '';
            const id = input.id || '';
            
            if (placeholder.toLowerCase().includes('city') || 
                name.toLowerCase().includes('city') ||
                id.toLowerCase().includes('city')) {
              input.value = cityValue;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return input.value;
            }
          }
          
          // Find by label association
          const labels = document.querySelectorAll('label');
          for (const label of labels) {
            if (label.textContent && label.textContent.toLowerCase().includes('city')) {
              const input = label.querySelector('input') || 
                           document.getElementById(label.getAttribute('for')) ||
                           label.nextElementSibling;
              if (input && input.tagName === 'INPUT') {
                input.value = cityValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                return input.value;
              }
            }
          }
          
          return null;
        }, cityValue);
        
        if (result) {
          console.log(`✅ [${account.email}] City filled via JavaScript: "${result}"`);
          return true;
        }
      } catch (e) {}
      return false;
    },
    
  // Strategy 4: Brute force - fill empty fields that might be city
  // Disabled due to risk of filling unrelated fields (e.g., Address Line 2/3)
  // async () => {
  //   try {
  //     await page.evaluate((cityValue) => {
  //       const inputs = document.querySelectorAll('input[type="text"]');
  //       for (let i = 0; i < inputs.length; i++) {
  //         const input = inputs[i];
  //         // Skip if already has data that looks like address or zip
  //         if (input.value && 
  //             (input.value.includes('Street') || 
  //              input.value.includes('Avenue') ||
  //              /^\d+$/.test(input.value) ||
  //              input.value.length > 20)) {
  //           continue;
  //         }
  //         // Try filling if it's empty and in a reasonable position
  //         if (input.value === '' && i > 0 && i < inputs.length - 1) {
  //           input.value = cityValue;
  //           input.dispatchEvent(new Event('input', { bubbles: true }));
  //           input.dispatchEvent(new Event('change', { bubbles: true }));
  //         }
  //       }
  //     }, cityValue);
  //     await page.waitForTimeout(500);
  //     return false; // Always return false to continue to next strategy
  //   } catch (e) {}
  //   return false;
  // }
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      if (await strategies[i]()) {
        return true;
      }
    } catch (e) {
      console.log(`City strategy ${i + 1} failed: ${e.message}`);
    }
  }
  
  console.log(`❌ [${account.email}] All city filling strategies failed`);
  return false;
}

// AGGRESSIVE ZIP CODE FIELD FILLING
async function aggressiveFillZipCode(page, account) {
  // For UK, use postcode, not city
  let zipValue = account.zipCode || '75001';
  if ((account.country || '').toLowerCase().includes('united kingdom')) {
    zipValue = account.zipCode || 'SW1A 1AA';
  }
  console.log(`📮 [${account.email}] AGGRESSIVE Zip Code filling: "${zipValue}"`);
  
  const strategies = [
    // Strategy 1: Standard selectors
    async () => {
      const selectors = [
        'input[placeholder*="Zip" i]',
        'input[placeholder*="Code" i]',
        'input[placeholder*="Postal" i]',
        'input[name*="zip" i]',
        'input[name*="postal" i]',
        'input[id*="zip" i]',
        'input[id*="postal" i]'
      ];
      
      for (const selector of selectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible({ timeout: 1000 })) {
            await field.click();
            await field.clear();
            await field.fill(zipValue);
            await field.blur();
            
            const value = await field.inputValue();
            if (value === zipValue) {
              console.log(`✅ [${account.email}] Zip filled via selector: ${selector}`);
              return true;
            }
          }
        } catch (e) { continue; }
      }
      return false;
    },
    
    // Strategy 2: Numeric field detection
    async () => {
      try {
        const allInputs = page.locator('input[type="text"]');
        const count = await allInputs.count();
        
        for (let i = 0; i < count; i++) {
          const field = allInputs.nth(i);
          if (await field.isVisible({ timeout: 500 })) {
            const placeholder = await field.getAttribute('placeholder').catch(() => '');
            const maxLength = await field.getAttribute('maxlength').catch(() => '');
            const pattern = await field.getAttribute('pattern').catch(() => '');
            
            // Look for numeric patterns or short length
            if (placeholder.toLowerCase().includes('zip') ||
                placeholder.toLowerCase().includes('postal') ||
                placeholder.toLowerCase().includes('code') ||
                maxLength === '5' || maxLength === '6' ||
                pattern.includes('[0-9]') ||
                (placeholder === '' && /^\d+$/.test(zipValue) && i >= 2)) {
              
              await field.click();
              await field.clear();
              await field.fill(zipValue);
              await field.blur();
              
              const newValue = await field.inputValue();
              if (newValue === zipValue) {
                console.log(`✅ [${account.email}] Zip filled via numeric detection ${i}`);
                return true;
              }
            }
          }
        }
      } catch (e) {}
      return false;
    },
    
    // Strategy 3: JavaScript DOM manipulation
    async () => {
      try {
        const result = await page.evaluate((zipValue) => {
          const inputs = document.querySelectorAll('input[type="text"]');
          for (const input of inputs) {
            const placeholder = input.placeholder || '';
            const name = input.name || '';
            const id = input.id || '';
            const maxLength = input.maxLength;
            
            if (placeholder.toLowerCase().includes('zip') || 
                placeholder.toLowerCase().includes('postal') ||
                placeholder.toLowerCase().includes('code') ||
                name.toLowerCase().includes('zip') ||
                name.toLowerCase().includes('postal') ||
                id.toLowerCase().includes('zip') ||
                id.toLowerCase().includes('postal') ||
                maxLength === 5 || maxLength === 6) {
              
              input.value = zipValue;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return input.value;
            }
          }
          return null;
        }, zipValue);
        
        if (result) {
          console.log(`✅ [${account.email}] Zip filled via JavaScript: "${result}"`);
          return true;
        }
      } catch (e) {}
      return false;
    },
    
    // Strategy 4: Position-based (zip usually comes after city)
    async () => {
      try {
        const result = await page.evaluate((zipValue) => {
          const inputs = document.querySelectorAll('input[type="text"]');
          
          // Look for empty short fields that could be zip codes
          for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            
            if (input.value === '' && 
                (input.maxLength <= 10 || input.size <= 10) &&
                i > 0) { // Not the first field
              
              input.value = zipValue;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Verify it stuck
              if (input.value === zipValue) {
                console.log(`Position-based zip fill at index ${i}`);
                return input.value;
              }
            }
          }
          return null;
        }, zipValue);
        
        if (result) {
          console.log(`✅ [${account.email}] Zip filled via position: "${result}"`);
          return true;
        }
      } catch (e) {}
      return false;
    }
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      if (await strategies[i]()) {
        return true;
      }
    } catch (e) {
      console.log(`Zip strategy ${i + 1} failed: ${e.message}`);
    }
  }
  
  console.log(`❌ [${account.email}] All zip code filling strategies failed`);
  return false;
}

// AGGRESSIVE STATE/ADMINISTRATIVE DIVISION FILLING
async function aggressiveFillAdminDivision(page, account) {
  const countryLower = (account.country || 'france').toLowerCase();
  console.log(`🏛️  [${account.email}] AGGRESSIVE Admin Division filling for: ${account.country}`);
  
  // Determine what type of field and data we need
  const getAdminInfo = (country, city, state) => {
    const configs = {
      'united states': { type: 'state', data: state || 'California' },
      'usa': { type: 'state', data: state || 'California' },
      'us': { type: 'state', data: state || 'California' },
      'france': { type: 'department', data: state || '75' },
      'spain': { type: 'province', data: state || 'Madrid' },
      'switzerland': { type: 'canton', data: state || 'Zurich' },
      'italy': { type: 'region', data: state || 'Lazio' },
      'belgium': { type: 'region', data: state || 'Brussels-Capital Region' }
    };
    
    return configs[country] || { type: 'none', data: '' };
  };
  
  const adminInfo = getAdminInfo(countryLower, account.city, account.state);
  
  if (adminInfo.type === 'none') {
    console.log(`✅ [${account.email}] No admin division required for ${account.country}`);
    return true;
  }
  
  console.log(`🎯 [${account.email}] Looking for ${adminInfo.type} field with value: "${adminInfo.data}"`);
  
  const strategies = [
    // Strategy 1: Standard selectors
    async () => {
      const selectorMap = {
        'state': ['select[name*="state" i]', 'select[id*="state" i]'],
        'department': ['select[name*="department" i]', 'select[id*="department" i]'],
        'province': ['select[name*="province" i]', 'select[id*="province" i]'],
        'canton': ['select[name*="canton" i]', 'select[id*="canton" i]'],
        'region': ['select[name*="region" i]', 'select[id*="region" i]']
      };
      
      const selectors = selectorMap[adminInfo.type] || [];
      
      for (const selector of selectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible({ timeout: 1000 })) {
            // Try selectOption first
            try {
              await field.selectOption({ label: adminInfo.data });
              const value = await field.inputValue();
              if (value && value !== '--' && value !== '') {
                console.log(`✅ [${account.email}] ${adminInfo.type} set via selectOption: ${value}`);
                return true;
              }
            } catch (e) {
              // Try manual option clicking
              await field.click();
              await page.waitForTimeout(500);
              
              const option = page.locator(`option:has-text("${adminInfo.data}")`).first();
              if (await option.isVisible({ timeout: 1000 })) {
                await option.click();
                const value = await field.inputValue();
                if (value && value !== '--' && value !== '') {
                  console.log(`✅ [${account.email}] ${adminInfo.type} set via option click: ${value}`);
                  return true;
                }
              }
            }
          }
        } catch (e) { continue; }
      }
      return false;
    },
    
    // Strategy 2: Any visible select that's not country
    async () => {
      try {
        const selects = page.locator('select:not([name*="country" i]):not([id*="country" i])');
        const count = await selects.count();
        
        for (let i = 0; i < count; i++) {
          const field = selects.nth(i);
          if (await field.isVisible({ timeout: 500 })) {
            const name = await field.getAttribute('name').catch(() => '');
            const id = await field.getAttribute('id').catch(() => '');
            
            // Skip mobile country code selectors
            if (name.includes('mobile') || id.includes('mobile') || name.includes('phone')) {
              continue;
            }
            
            try {
              await field.selectOption({ label: adminInfo.data });
              const value = await field.inputValue();
              if (value && value !== '--' && value !== '') {
                console.log(`✅ [${account.email}] ${adminInfo.type} set via generic select ${i}: ${value}`);
                return true;
              }
            } catch (e) {
              try {
                await field.click();
                await page.waitForTimeout(500);
                
                const option = page.locator(`option:has-text("${adminInfo.data}")`).first();
                if (await option.isVisible({ timeout: 1000 })) {
                  await option.click();
                  const value = await field.inputValue();
                  if (value && value !== '--' && value !== '') {
                    console.log(`✅ [${account.email}] ${adminInfo.type} set via generic option click: ${value}`);
                    return true;
                  }
                }
              } catch (e2) { continue; }
            }
          }
        }
      } catch (e) {}
      return false;
    },
    
    // Strategy 3: JavaScript brute force
    async () => {
      try {
        const result = await page.evaluate((adminData) => {
          const selects = document.querySelectorAll('select');
          
          for (const select of selects) {
            const name = select.name || '';
            const id = select.id || '';
            
            // Skip country and mobile selectors
            if (name.toLowerCase().includes('country') || 
                id.toLowerCase().includes('country') ||
                name.toLowerCase().includes('mobile') ||
                name.toLowerCase().includes('phone')) {
              continue;
            }
            
            // Try to find matching option
            for (let i = 0; i < select.options.length; i++) {
              const option = select.options[i];
              if (option.text.toLowerCase().includes(adminData.toLowerCase()) ||
                  adminData.toLowerCase().includes(option.text.toLowerCase()) ||
                  option.value === adminData) {
                
                select.selectedIndex = i;
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`JavaScript selected: ${option.text} (${option.value})`);
                return option.value;
              }
            }
          }
          return null;
        }, adminInfo.data);
        
        if (result) {
          console.log(`✅ [${account.email}] ${adminInfo.type} set via JavaScript: ${result}`);
          return true;
        }
      } catch (e) {}
      return false;
    }
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      if (await strategies[i]()) {
        return true;
      }
    } catch (e) {
      console.log(`Admin division strategy ${i + 1} failed: ${e.message}`);
    }
  }
  
  console.log(`❌ [${account.email}] All admin division strategies failed`);
  return false;
}

// AGGRESSIVE FORM VALIDATION
async function aggressiveValidateForm(page, account) {
  console.log(`🔍 [${account.email}] AGGRESSIVE form validation...`);
  
  const validation = {
    city: false,
    zipCode: false,
    country: false,
    adminDivision: false
  };
  
  // Check City
  try {
    const result = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      for (const input of inputs) {
        const placeholder = input.placeholder || '';
        const name = input.name || '';
        const id = input.id || '';
        
        if ((placeholder.toLowerCase().includes('city') || 
             name.toLowerCase().includes('city') ||
             id.toLowerCase().includes('city')) &&
            input.value && input.value.trim() !== '') {
          return input.value;
        }
      }
      return null;
    });
    
    if (result) {
      validation.city = true;
      console.log(`✅ [${account.email}] City validation passed: "${result}"`);
    } else {
      console.log(`❌ [${account.email}] City validation failed - field empty`);
    }
  } catch (e) {
    console.log(`❌ [${account.email}] City validation error: ${e.message}`);
  }
  
  // Check Zip Code
  try {
    const result = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      for (const input of inputs) {
        const placeholder = input.placeholder || '';
        const name = input.name || '';
        const id = input.id || '';
        
        if ((placeholder.toLowerCase().includes('zip') || 
             placeholder.toLowerCase().includes('postal') ||
             placeholder.toLowerCase().includes('code') ||
             name.toLowerCase().includes('zip') ||
             name.toLowerCase().includes('postal') ||
             id.toLowerCase().includes('zip') ||
             id.toLowerCase().includes('postal')) &&
            input.value && input.value.trim() !== '') {
          return input.value;
        }
      }
      return null;
    });
    
    if (result) {
      validation.zipCode = true;
      console.log(`✅ [${account.email}] Zip Code validation passed: "${result}"`);
    } else {
      console.log(`❌ [${account.email}] Zip Code validation failed - field empty`);
    }
  } catch (e) {
    console.log(`❌ [${account.email}] Zip Code validation error: ${e.message}`);
  }
  
  // Check Country
  try {
    const result = await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      for (const select of selects) {
        const name = select.name || '';
        const id = select.id || '';
        
        if ((name.toLowerCase().includes('country') ||
             id.toLowerCase().includes('country')) &&
            select.value && select.value !== '--' && select.value !== '') {
          return select.value;
        }
      }
      return null;
    });
    
    if (result) {
      validation.country = true;
      console.log(`✅ [${account.email}] Country validation passed: "${result}"`);
    } else {
      console.log(`❌ [${account.email}] Country validation failed - not selected`);
    }
  } catch (e) {
    console.log(`❌ [${account.email}] Country validation error: ${e.message}`);
  }
  
  // Check Admin Division (State/Province/etc.)
  try {
    const result = await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      for (const select of selects) {
        const name = select.name || '';
        const id = select.id || '';
        
        if ((name.toLowerCase().includes('state') ||
             name.toLowerCase().includes('province') ||
             name.toLowerCase().includes('region') ||
             name.toLowerCase().includes('department') ||
             name.toLowerCase().includes('canton') ||
             id.toLowerCase().includes('state') ||
             id.toLowerCase().includes('province') ||
             id.toLowerCase().includes('region')) &&
            select.value && select.value !== '--' && select.value !== '') {
          return { field: name || id, value: select.value };
        }
      }
      return null;
    });
    
    if (result) {
      validation.adminDivision = true;
      console.log(`✅ [${account.email}] Admin Division validation passed: ${result.field} = "${result.value}"`);
    } else {
      // For some countries, admin division might not be required
      const countryLower = (account.country || '').toLowerCase();
      if (['canada', 'germany', 'netherlands', 'united kingdom','uk','great britain','england', 'portugal'].includes(countryLower)) {
        validation.adminDivision = true;
        console.log(`✅ [${account.email}] Admin Division not required for ${account.country}`);
      } else {
        console.log(`❌ [${account.email}] Admin Division validation failed - not selected`);
      }
    }
  } catch (e) {
    console.log(`❌ [${account.email}] Admin Division validation error: ${e.message}`);
  }
  
  const allValid = validation.city && validation.zipCode && validation.country && validation.adminDivision;
  
  console.log(`📊 [${account.email}] Validation Summary:`);
  console.log(`   City: ${validation.city ? '✅' : '❌'}`);
  console.log(`   Zip Code: ${validation.zipCode ? '✅' : '❌'}`);
  console.log(`   Country: ${validation.country ? '✅' : '❌'}`);
  console.log(`   Admin Division: ${validation.adminDivision ? '✅' : '❌'}`);
  console.log(`   Overall: ${allValid ? '✅ PASSED' : '❌ FAILED'}`);
  
  return { valid: allValid, details: validation };
}

// Prefer explicit label-based targeting over heuristics.
// Works across single/dual-column layouts and with/without placeholders.
async function fillCityAndZipByLabels(page, account) {
  const cityValue = account.city || 'City';
  const zipValue  = account.zipCode || '00000';

  // Try common English label variants
  const cityLabels = [/^city\b/i, /town\/?city/i];
  const zipLabels  = [/^zip code\b/i, /^postal code\b/i, /^postcode\b/i, /\bzip\b/i];

  const fillByLabels = async (patterns, value) => {
    for (const pat of patterns) {
      const loc = page.getByLabel(pat, { exact: false });
      const n = await loc.count();
      if (n > 0) {
        const el = loc.first();
        if (await el.isVisible({ timeout: 1500 })) {
          await el.fill(value);
          await el.blur();
          return true;
        }
      }
    }
    return false;
  };

  const cOK = await fillByLabels(cityLabels, cityValue);
  const zOK = await fillByLabels(zipLabels, zipValue);

  return { cOK, zOK };
}

// Find the input visually nearest to a label whose text matches one of the patterns,
// then set value via the native setter (works with React/controlled inputs).
async function fillByNearestLabel(page, labelPatterns, value) {
  return await page.evaluate(({ labelPatterns, value }) => {
    const regexes = labelPatterns.map(p => new RegExp(p, 'i'));

    const textMatch = (el) => {
      const t = (el.textContent || '').trim();
      return t && regexes.some(rx => rx.test(t));
    };

    const labels = Array.from(document.querySelectorAll('label, legend, span, div, p, strong, b'))
      .filter(el => {
        // visible enough
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && textMatch(el);
      });

    if (!labels.length) return false;

    const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type]), textarea'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !el.disabled && !el.readOnly;
      });

    if (!inputs.length) return false;

    const setValue = (el, v) => {
      const proto = el.tagName.toLowerCase() === 'textarea'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      desc && desc.set ? desc.set.call(el, v) : (el.value = v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // For each matching label, choose the closest input on the same row (small vertical delta),
    // preferring inputs to the right of the label (as in 2-column forms).
    for (const label of labels) {
      const lr = label.getBoundingClientRect();
      let best = null;
      let bestScore = Infinity;

      for (const input of inputs) {
        const ir = input.getBoundingClientRect();
        const yDelta = Math.abs((ir.top + ir.bottom) / 2 - (lr.top + lr.bottom) / 2);
        const xBias = ir.left >= lr.left ? 0 : 50; // prefer to the right of label
        const dist = yDelta + xBias + Math.abs(ir.left - lr.right) * 0.02; // light horizontal influence
        if (yDelta < 40 && dist < bestScore) { // "same row" ≈ within 40px vertically
          best = input; bestScore = dist;
        }
      }

      if (best) {
        setValue(best, value);
        return true;
      }
    }
    return false;
  }, { labelPatterns, value });
}

// MAIN ENHANCED ADDRESS FORM FUNCTION
async function enhancedFillAddressForm(page, account) {
  console.log(`🚀 [${account.email}] Starting ENHANCED address form...`);
  try {
    await page.waitForTimeout(2000);
    
    const isUK = (account.country || '').toLowerCase().includes('united kingdom');
    
    // Pre-clear postcode field for UK forms
    if (isUK) {
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="text"]');
        for (const input of inputs) {
          const attrs = (input.placeholder || '') + ' ' + 
                       (input.name || '') + ' ' + 
                       (input.id || '') + ' ' +
                       (input.getAttribute('aria-label') || '');
          if (/postcode|post.*code|zip/i.test(attrs)) {
            input.value = '';
            return true;
          }
        }
      });
      await page.waitForTimeout(500);
    }

    // Step 1: City/Town (label-led; layout-proof)
    console.log(`\n🏙️  [${account.email}] Step 1: City/Town by label`);
    const cityOK = await fillByGroupLabel(page, {
      labels: ['^city\\b', '^town\\b', 'city \\(max', 'town \\(max'],   // matches UK City/Town variations
      value: account.city || ((account.country || '').toLowerCase().includes('united kingdom') ? 'London' : 'City'),
      prefer: 'city',
      excludeAddress: true
    });

    // Step 2: Direct Postcode Fill for UK
    console.log(`\n📮 [${account.email}] Step 2: Postcode fill`);
    let zipOK = false;
    
    if (isUK && account.zipCode) {
      zipOK = await page.evaluate((postcode) => {
        const inputs = document.querySelectorAll('input[type="text"]');
        for (const input of inputs) {
          const attrs = (input.placeholder || '') + ' ' + 
                       (input.name || '') + ' ' + 
                       (input.id || '') + ' ' +
                       (input.getAttribute('aria-label') || '');
          if (/postcode|post.*code|zip/i.test(attrs)) {
            input.value = postcode;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
        return false;
      }, account.zipCode);
      
      await page.waitForTimeout(500);
    }
    
    // Fallback to label-based fill if needed
    if (!zipOK) {
      zipOK = await fillByGroupLabel(page, {
        labels: ['^zip code\\b', '^postal code\\b', '^post code\\b', '^postcode\\b', '\\bzip\\b'],
        value: account.zipCode || (isUK ? 'SW1A 1AA' : '00000'),
        prefer: 'zip',
        excludeAddress: true
      });
    }
    
    // UK forms often need a small delay between city and postcode
    if (isUK) await page.waitForTimeout(500);

    // Only if still empty, fall back to your aggressive routines
    if (!cityOK) {
      console.log('(City by label not found) falling back to aggressive city…');
      await aggressiveFillCity(page, account);  // keep, but see step 3
    }
    if (!zipOK) {
      console.log('(Zip by label not found) falling back to aggressive zip…');
      await aggressiveFillZipCode(page, account);  // keep, but see step 3
    }
    
    // Step 3: Fill Address (less critical)
    console.log(`\n🏠 [${account.email}] Step 3: Address Filling`);
    try {
      const addressValue = account.address || '123 Main Street';
      const result = await page.evaluate((addressValue) => {
        const inputs = document.querySelectorAll('input[type="text"], textarea');
        for (const input of inputs) {
          const placeholder = input.placeholder || '';
          const name = input.name || '';
          
          if (placeholder.toLowerCase().includes('address') || 
              name.toLowerCase().includes('address')) {
            input.value = addressValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
        }
        return false;
      }, addressValue);
      
      if (result) {
        console.log(`✅ [${account.email}] Address filled`);
      }
    } catch (e) {
      console.log(`⚠️  [${account.email}] Address filling failed: ${e.message}`);
    }
    
    // Step 4: Country Selection (must be done before state)
    console.log(`\n🌍 [${account.email}] Step 4: Country Selection`);
    try {
      const countryValue = account.country || 'France';
      const countrySuccess = await page.evaluate((countryValue) => {
        const selects = document.querySelectorAll('select');
        for (const select of selects) {
          const name = select.name || '';
          const id = select.id || '';
          
          if (name.toLowerCase().includes('country') || 
              id.toLowerCase().includes('country')) {
            
            // Find matching option
            for (let i = 0; i < select.options.length; i++) {
              const option = select.options[i];
              if (option.text.toLowerCase().includes(countryValue.toLowerCase()) ||
                  countryValue.toLowerCase().includes(option.text.toLowerCase())) {
                select.selectedIndex = i;
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return option.value;
              }
            }
          }
        }
        return false;
      }, countryValue);
      
      if (countrySuccess) {
        console.log(`✅ [${account.email}] Country selected: ${countrySuccess}`);
        await page.waitForTimeout(2000); // Wait for state field to appear
      } else {
        console.log(`❌ [${account.email}] Country selection failed`);
      }
    } catch (e) {
      console.log(`❌ [${account.email}] Country selection error: ${e.message}`);
    }
    
    // Step 5: Aggressive Admin Division Filling
    console.log(`\n🏛️  [${account.email}] Step 5: Aggressive Admin Division Filling`);
    const adminSuccess = await aggressiveFillAdminDivision(page, account);
    await page.waitForTimeout(1000);
    
    // Step 6: Mobile Number
    console.log(`\n📱 [${account.email}] Step 6: Mobile Number Filling`);
    try {
      const mobileValue = account.mobileNumber || '123456789';
      const result = await page.evaluate((mobileValue) => {
        const inputs = document.querySelectorAll('input[type="tel"], input[type="text"]');
        for (const input of inputs) {
          const placeholder = input.placeholder || '';
          const name = input.name || '';
          
          if ((placeholder.toLowerCase().includes('mobile') || 
               name.toLowerCase().includes('mobile') ||
               placeholder.toLowerCase().includes('phone') ||
               name.toLowerCase().includes('phone')) &&
              !input.value.includes('+')) { // Skip country code fields
            input.value = mobileValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
        }
        return false;
      }, mobileValue);
      
      if (result) {
        console.log(`✅ [${account.email}] Mobile number filled`);
      }
    } catch (e) {
      console.log(`⚠️  [${account.email}] Mobile filling failed: ${e.message}`);
    }
    
    // Step 7: Accept Authorization
    console.log(`\n✅ [${account.email}] Step 7: Accept Authorization`);
    try {
      const acceptResult = await page.evaluate(() => {
        const radios = document.querySelectorAll('input[type="radio"]');
        for (const radio of radios) {
          const label = radio.parentElement?.textContent || 
                       radio.nextElementSibling?.textContent || '';
          if (label.toLowerCase().includes('accept')) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
        return false;
      });
      
      if (acceptResult) {
        console.log(`✅ [${account.email}] Authorization accepted`);
      } else {
        console.log(`⚠️  [${account.email}] Could not find accept checkbox`);
      }
    } catch (e) {
      console.log(`⚠️  [${account.email}] Accept authorization failed: ${e.message}`);
    }
    
    // Step 8: Validate All Fields Before Save
    console.log(`\n🔍 [${account.email}] Step 8: Final Validation Before Save`);
    const validation = await aggressiveValidateForm(page, account);
    
    if (!validation.valid) {
      console.log(`🔧 [${account.email}] Validation failed - attempting emergency fixes...`);
      
      // Emergency re-fill failed fields
      if (!validation.details.city) {
        console.log(`🆘 [${account.email}] Emergency city re-fill...`);
        await aggressiveFillCity(page, account);
      }
      
      if (!validation.details.zipCode) {
        console.log(`🆘 [${account.email}] Emergency zip code re-fill...`);
        await aggressiveFillZipCode(page, account);
      }
      
      if (!validation.details.adminDivision) {
        console.log(`🆘 [${account.email}] Emergency admin division re-fill...`);
        await aggressiveFillAdminDivision(page, account);
      }
      
      // Re-validate
      await page.waitForTimeout(1000);
      const revalidation = await aggressiveValidateForm(page, account);
      if (!revalidation.valid) {
        console.log(`❌ [${account.email}] Emergency fixes failed - proceeding anyway`);
      } else {
        console.log(`✅ [${account.email}] Emergency fixes successful!`);
      }
    }
    
    // Step 9: Save
    console.log(`\n💾 [${account.email}] Step 9: Saving Form`);
    const saveSuccess = await page.evaluate(() => {
      // Try multiple save strategies
      const strategies = [
        () => {
          const spans = document.querySelectorAll('span.text');
          for (const span of spans) {
            if (span.textContent && span.textContent.trim() === 'Save') {
              const button = span.closest('button');
              if (button) {
                button.click();
                return 'span.text button';
              }
            }
          }
          return null;
        },
        () => {
          const buttons = document.querySelectorAll('button');
          for (const button of buttons) {
            if (button.textContent && button.textContent.includes('Save')) {
              button.click();
              return 'save button';
            }
          }
          return null;
        },
        () => {
          const submits = document.querySelectorAll('button[type="submit"], input[type="submit"]');
          if (submits.length > 0) {
            submits[0].click();
            return 'submit button';
          }
          return null;
        }
      ];
      
      for (const strategy of strategies) {
        const result = strategy();
        if (result) return result;
      }
      return null;
    });
    
    if (saveSuccess) {
      console.log(`✅ [${account.email}] Save clicked via: ${saveSuccess}`);
    } else {
      console.log(`❌ [${account.email}] All save strategies failed`);
      return false;
    }
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Check for errors
    const errorCheck = await page.evaluate(() => {
      const errorTexts = [
        'Please complete all mandatory fields',
        'mandatory fields',
        'required fields'
      ];
      
      const allText = document.body.textContent || '';
      for (const errorText of errorTexts) {
        if (allText.includes(errorText)) {
          return errorText;
        }
      }
      return null;
    });
    
    if (errorCheck) {
      console.log(`❌ [${account.email}] Error detected: ${errorCheck}`);
      return false;
    } else {
      console.log(`🎉 [${account.email}] ENHANCED address form completed successfully!`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ [${account.email}] Enhanced address form error: ${error.message}`);
    return false;
  }
}

// 4. UPDATE the main script's console.log messages to reflect aggressive detection:
console.log('🚀 FIFA World Cup 2026 AGGRESSIVE Field Detection Bot Starting...');
console.log('🎯 AGGRESSIVE Features:');
console.log('   • Multiple detection strategies for each field');
console.log('   • Position-based field detection');
console.log('   • JavaScript DOM manipulation');
console.log('   • Brute force field filling');
console.log('   • Comprehensive form validation');
console.log('   • Emergency re-fill on validation failure');
console.log('   • Country-specific administrative divisions');
console.log('   • Enhanced error detection and recovery');
// ------------------------- Profile Form Filling -------------------------
async function fillProfileForm(page, account) {
  console.log(`📝 [${account.email}] Starting profile form completion...`);
  
  try {
    console.log(`🔍 [${account.email}] Looking for profile form...`);
    
    const profileIndicators = [
      'text=Update Profile',
      'text=Personal details',
      'text=Last Name',
      'input[placeholder*="Last"]',
      'input[name*="last"]',
      'text=Continue'
    ];
    
    let profileFormFound = false;
    for (const indicator of profileIndicators) {
      try {
        if (await page.locator(indicator).first().isVisible({ timeout: 5000 })) {
          console.log(`✅ [${account.email}] Profile form detected: ${indicator}`);
          profileFormFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!profileFormFound) {
      console.log(`⚠️  [${account.email}] Profile form not found - may already be completed`);
      return true;
    }
    
    await page.waitForTimeout(randomDelay(2000, 4000));
    
    // Fill Last Name
    console.log(`👤 [${account.email}] Filling Last Name: "${account.lastName}"`);
    try {
      const lastNameSelectors = [
        'input[placeholder*="Last Name"]',
        'input[name*="lastName"]',
        'input[name*="last_name"]',
        'input[id*="lastName"]',
        'input[id*="last"]',
        'label:has-text("Last Name") + input',
        'label:has-text("Last Name") ~ input'
      ];
      
      let lastNameFilled = false;
      for (const selector of lastNameSelectors) {
        try {
          const lastNameField = page.locator(selector).first();
          if (await lastNameField.isVisible({ timeout: 2000 })) {
            await humanType(page, selector, account.lastName || 'Smith');
            console.log(`✅ [${account.email}] Last Name filled successfully`);
            lastNameFilled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!lastNameFilled) {
        console.log(`⚠️  [${account.email}] Could not find Last Name field`);
      }
    } catch (e) {
      console.log(`⚠️  [${account.email}] Error filling Last Name: ${e.message}`);
    }
    
    // Fill Mobile
    console.log(`📱 [${account.email}] Filling Mobile: "${account.mobile}"`);
    try {
      const mobileSelectors = [
        'input[placeholder*="Mobile"]',
        'input[name*="mobile"]',
        'input[name*="phone"]',
        'input[id*="mobile"]',
        'input[id*="phone"]',
        'label:has-text("Mobile") + input',
        'label:has-text("Mobile") ~ input',
        'input[type="tel"]'
      ];
      
      let mobileFilled = false;
      for (const selector of mobileSelectors) {
        try {
          const mobileField = page.locator(selector).first();
          if (await mobileField.isVisible({ timeout: 2000 })) {
            await humanType(page, selector, account.mobile || '123456789');
            console.log(`✅ [${account.email}] Mobile filled successfully`);
            mobileFilled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!mobileFilled) {
        console.log(`⚠️  [${account.email}] Could not find Mobile field`);
      }
    } catch (e) {
      console.log(`⚠️  [${account.email}] Error filling Mobile: ${e.message}`);
    }
    
    // Select Gender
    console.log(`👫 [${account.email}] Setting Gender: "${account.gender}"`);
    try {
      const genderSelectors = [
        'select[name*="gender"]',
        'select[id*="gender"]',
        'label:has-text("Gender") + select',
        'label:has-text("Gender") ~ select'
      ];
      
      let genderSet = false;
      for (const selector of genderSelectors) {
        try {
          const genderField = page.locator(selector).first();
          if (await genderField.isVisible({ timeout: 2000 })) {
            await genderField.click();
            await page.waitForTimeout(randomDelay(500, 1000));
            
            const genderValue = (account.gender || 'Male').toLowerCase();
            const genderOptions = [
              `option:has-text("${account.gender || 'Male'}")`,
              `option[value="${genderValue}"]`,
              `option[value="${account.gender || 'Male'}"]`,
              genderValue === 'male' ? 'option:has-text("Male")' : 'option:has-text("Female")'
            ];
            
            for (const optionSelector of genderOptions) {
              try {
                if (await page.locator(optionSelector).isVisible({ timeout: 1000 })) {
                  await page.locator(optionSelector).click();
                  console.log(`✅ [${account.email}] Gender selected successfully`);
                  genderSet = true;
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            
            if (genderSet) break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!genderSet) {
        console.log(`⚠️  [${account.email}] Could not set Gender field`);
      }
    } catch (e) {
      console.log(`⚠️  [${account.email}] Error setting Gender: ${e.message}`);
    }
    
    await page.waitForTimeout(randomDelay(1000, 2000));
    
    // Click Continue
    console.log(`▶️  [${account.email}] Clicking Continue button...`);
    try {
      const continueSelectors = [
        'button:has-text("CONTINUE")',
        'button:has-text("Continue")',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Save")',
        'button:has-text("SAVE")'
      ];
      
      let continueClicked = false;
      for (const selector of continueSelectors) {
        try {
          const continueButton = page.locator(selector).first();
          if (await continueButton.isVisible({ timeout: 2000 })) {
            await humanClick(page, selector);
            console.log(`✅ [${account.email}] Continue button clicked`);
            continueClicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!continueClicked) {
        console.log(`⚠️  [${account.email}] Could not find Continue button`);
      }
    } catch (e) {
      console.log(`⚠️  [${account.email}] Error clicking Continue: ${e.message}`);
    }
    
    await page.waitForTimeout(randomDelay(3000, 5000));
    
    console.log(`✅ [${account.email}] Profile form completion finished`);
    return true;
    
  } catch (error) {
    console.error(`❌ [${account.email}] Profile form error: ${error.message}`);
    return false;
  }
}

function loadAccounts() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Excel file not found at ${EXCEL_PATH}`);
  }
  
  console.log(`📁 Reading Excel file: ${EXCEL_PATH}`);
  const wb = XLSX.readFile(EXCEL_PATH);
  const sheetName = SHEET_NAME || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Available: ${wb.SheetNames.join(' | ')}`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows.length) throw new Error('Excel sheet appears empty.');

  console.log(`📊 Found ${rows.length} rows in sheet "${sheetName}"`);
  
  const accounts = rows.slice(1)
    .filter(row => row.some(cell => String(cell).trim()))
    .map((row, index) => {
      const account = {
        firstName: String(row[0] || '').trim(),
        lastName: String(row[1] || '').replace(/[\r\n]+/g, '').trim(),
        email: String(row[3] || '').trim(),
        password: String(row[7] || '').trim(),
        country: String(row[5] || '').trim(),
        mobile: String(row[2] || '').trim(),
        gender: String(row[6] || '').trim(),
        mobileNumber: String(row[12] || '').trim(),
        address: String(row[8] || '').trim(),
        city: String(row[10] || '').trim(),
        zipCode: String(row[9] || '').trim(),
        state: String(row[11] || '').trim()
      };
      
      if (!account.email || !account.password) {
        console.warn(`⚠️  Row ${index + 2}: Missing email or password - skipping`);
        return null;
      }
      
      return account;
    })
    .filter(account => account !== null);

  console.log(`✅ Loaded ${accounts.length} valid accounts`);
  return accounts;
}

async function signIntoFIFA(page, account) {
  console.log(`🔐 [${account.email}] Starting FIFA sign-in...`);
  
  try {
    await page.goto(FIFA_SIGNIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`🌐 [${account.email}] Navigated to: ${page.url()}`);
    
    // Handle cookie consent
    console.log(`🍪 [${account.email}] Handling cookie consent...`);
    await page.waitForTimeout(4000);
    
    try {
      await page.waitForSelector('button:has-text("I\'m OK with that")', { timeout: 10000 });
      await page.click('button:has-text("I\'m OK with that")');
      console.log(`✅ [${account.email}] Cookie consent clicked`);
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log(`⚠️  [${account.email}] Cookie consent not found - continuing`);
    }
    
    // Fill email
    console.log(`📧 [${account.email}] Filling email...`);
    const emailInput = page.locator('input[type="email"], input[placeholder*="Email"], input[name*="email"]').first();
    await emailInput.waitFor({ timeout: 10000 });
    await emailInput.clear();
    await emailInput.fill(account.email);
    console.log(`✅ [${account.email}] Email filled`);
    
    // Fill password
    console.log(`🔒 [${account.email}] Filling password...`);
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.clear();
    await passwordInput.fill(account.password);
    console.log(`✅ [${account.email}] Password filled`);
    
    // Click Sign In
    console.log(`🔍 [${account.email}] Clicking Sign In...`);
    
    try {
      await page.click('button:has-text("SIGN IN")');
      console.log(`✅ [${account.email}] Sign In clicked`);
    } catch (e) {
      try {
        await page.click('button[type="submit"]');
        console.log(`✅ [${account.email}] Submit button clicked`);
      } catch (e2) {
        await passwordInput.press('Enter');
        console.log(`✅ [${account.email}] Enter pressed`);
      }
    }
    
    // Wait for redirect
    console.log(`⏳ [${account.email}] Waiting for OAuth redirect or profile page...`);
    await page.waitForTimeout(5000);
    
    let currentUrl = page.url();
    console.log(`🔍 [${account.email}] Current URL after sign-in: ${currentUrl}`);
    
    const maxWaitTime = 30000;
    const startTime = Date.now();
    
    while ((Date.now() - startTime) < maxWaitTime) {
      await page.waitForTimeout(2000);
      currentUrl = page.url();
      
      if (currentUrl.includes('auth.fifa.com/as/authorize')) {
        console.log(`🎯 [${account.email}] OAuth redirect detected!`);
        break;
      }
      
      if (currentUrl.includes('account') || currentUrl.includes('profile')) {
        console.log(`📝 [${account.email}] Profile page detected`);
        break;
      }
      
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏳ [${account.email}] Still waiting... (${elapsed}s elapsed)`);
    }
    
    currentUrl = page.url();
    console.log(`🔍 [${account.email}] Final URL: ${currentUrl}`);
    
    if (currentUrl.includes('auth.fifa.com') || currentUrl.includes('account') || currentUrl.includes('profile')) {
      console.log(`✅ [${account.email}] Successfully reached FIFA authenticated area!`);
      
      await page.waitForTimeout(randomDelay(2000, 4000));
      
      // Determine form state
      console.log(`🔍 [${account.email}] Detecting current form state...`);
      
      const addressFormIndicators = [
        'text=Address',
        'text=City', 
        'text=Zip Code',
        'text=AUTHORIZATION',
        'input[placeholder*="Address"]',
        'button:has-text("Save")'
      ];
      
      let onAddressForm = false;
      for (const indicator of addressFormIndicators) {
        try {
          if (await page.locator(indicator).first().isVisible({ timeout: 3000 })) {
            console.log(`🏠 [${account.email}] Already on address form`);
            onAddressForm = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (onAddressForm) {
        console.log(`⏩ [${account.email}] Skipping profile form - proceeding to enhanced address form`);
        
        const addressSuccess = await fillAddressForm(page, account);
        if (addressSuccess) {
          console.log(`✅ [${account.email}] Enhanced address form completed successfully!`);
        } else {
          console.log(`⚠️  [${account.email}] Enhanced address form had issues`);
        }
      } else {
        console.log(`📝 [${account.email}] Starting with profile form first`);
        
        const profileSuccess = await fillProfileForm(page, account);
        if (profileSuccess) {
          console.log(`✅ [${account.email}] Profile form completed successfully!`);
          
          await page.waitForTimeout(randomDelay(3000, 5000));
          
          const addressSuccess = await fillAddressForm(page, account);
          if (addressSuccess) {
            console.log(`✅ [${account.email}] Enhanced address form completed successfully!`);
          } else {
            console.log(`⚠️  [${account.email}] Enhanced address form had issues`);
          }
        } else {
          console.log(`⚠️  [${account.email}] Profile form had issues`);
          
          console.log(`🔄 [${account.email}] Attempting enhanced address form anyway...`);
          const addressSuccess = await fillAddressForm(page, account);
          if (addressSuccess) {
            console.log(`✅ [${account.email}] Enhanced address form completed successfully!`);
          }
        }
      }
      
      return true;
    } else {
      console.log(`⚠️  [${account.email}] Unexpected final URL - manual check needed`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ [${account.email}] Failed: ${error.message}`);
    return false;
  }
}

async function processAccount(account, index, total) {
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: [
      '--no-sandbox',
      '--disable-web-security',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--no-default-browser-check',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--disable-translate',
      '--disable-web-resources',
      '--safebrowsing-disable-auto-update',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-dev-shm-usage'
    ]
  });
  
  const context = await browser.newContext({
    userAgent: randomUserAgent(),
    viewport: randomViewport(),
    locale: 'en-US',
    timezoneId: randomTimezone(),
    permissions: [],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  });
  
await context.addInitScript(() => {
  // Remove webdriver flag
  delete navigator.__proto__.webdriver;

  // Realistic navigator spoofing
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
  Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 1 });
  Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });

  // Canvas fingerprint spoof
  const toBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function() {
    const ctx = this.getContext('2d');
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, 10, 10);
    return toBlob.apply(this, arguments);
  };

  // SpeechSynthesis spoof
  const originalVoices = speechSynthesis.getVoices;
  speechSynthesis.getVoices = function () {
    return [{ voiceURI: 'Google US English', name: 'Google US English' }];
  };

  // Permissions spoof
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) =>
    parameters.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : originalQuery(parameters);
});

  
  const page = await context.newPage();
  
  // Trigger human events on page load
  await page.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('mousemove'));
    window.dispatchEvent(new Event('scroll'));
  });
  
  try {
    console.log(`\n🔄 [${index + 1}/${total}] Processing ENHANCED: ${account.email}`);
    console.log(`👤 [${account.email}] Profile: ${account.firstName} ${account.lastName} | ${account.country} | ${account.gender}`);
    console.log(`🏠 [${account.email}] Address: ${account.address} | ${account.city} | ${account.zipCode} | ${account.state}`);
    console.log(`📱 [${account.email}] Contact: ${account.mobile} | ${account.mobileNumber}`);
    console.log(`🎯 [${account.email}] Enhanced country-specific handling enabled`);
    
    const initialDelay = randomDelay(3000, 8000);
    console.log(`⏳ [${account.email}] Initial delay: ${initialDelay}ms`);
    await page.waitForTimeout(initialDelay);
    
    const signInSuccess = await signIntoFIFA(page, account);
    
    if (signInSuccess) {
      console.log(`🎉 [${account.email}] ENHANCED account setup completed successfully!`);
      
      console.log(`🕐 [${account.email}] Keeping browser open for ${KEEP_BROWSER_OPEN/1000} seconds...`);
      await page.waitForTimeout(KEEP_BROWSER_OPEN);
      
      return { success: true, email: account.email };
    } else {
      console.log(`❌ [${account.email}] Enhanced account setup failed`);
      return { success: false, email: account.email, error: 'Enhanced setup process failed' };
    }
    
  } catch (error) {
    console.error(`❌ [${account.email}] Unexpected error: ${error.message}`);
    return { success: false, email: account.email, error: error.message };
  } finally {
    if (await detectCaptcha(page).catch(() => false)) {
      console.log(`🚨 [${account.email}] CAPTCHA still present - browser left open`);
    } else {
      console.log(`ℹ️  [${account.email}] Browser left open for manual inspection`);
    }
  }
}

// ------------------------- Main Orchestrator -------------------------
(async () => {
  console.log('🚀 FIFA World Cup 2026 ENHANCED Account Setup Bot Starting...');
  console.log(`📁 Excel file: ${EXCEL_PATH}`);
  console.log(`📊 Sheet: ${SHEET_NAME}`);
  console.log(`🔧 Concurrency: ${CONCURRENCY}`);
  console.log(`🎭 Headless mode: ${HEADLESS}`);
  console.log(`⏱️  Delay between accounts: ${DELAY_BETWEEN_ACCOUNTS/1000} seconds`);
  console.log(`🕐 Keep browser open: ${KEEP_BROWSER_OPEN/1000} seconds`);
  console.log(`🛡️  Anti-bot features: Enabled`);
  console.log(`🤖 CAPTCHA detection: Enabled`);
  console.log(`🌍 ENHANCED Country Support:`);
  console.log(`   • United States → State field`);
  console.log(`   • France → Department + Region fields`);
  console.log(`   • Spain → Province field`);
  console.log(`   • Switzerland → Canton field`);
  console.log(`   • Italy → Region field`);
  console.log(`   • Belgium → Region field`);
  console.log(`   • Others → General form`);
  console.log(`📝 Profile filling: Last Name, Mobile, Gender + Continue`);
  console.log(`🏠 Address filling: Address, City*, Zip*, Country*, Admin Division, Mobile + Accept + Save`);
  console.log(`🎯 Target: FIFA World Cup 2026 OAuth System`);
  console.log(`⚠️  Auto-generated data for missing fields`);
  console.log('');

  let accounts;
  try {
    accounts = loadAccounts();
  } catch (e) {
    console.error('❌ Excel loading error:', e.message);
    process.exit(1);
  }

  if (!accounts.length) {
    console.error('❌ No valid accounts found in Excel file');
    process.exit(1);
  }

  console.log(`🎯 Processing ${accounts.length} FIFA accounts with ENHANCED support...`);
  
  const results = {
    total: accounts.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  const limit = pLimit(CONCURRENCY);
  const startTime = Date.now();
  
  const promises = accounts.map((account, index) => 
    limit(async () => {
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_ACCOUNTS));
      }
      
      const result = await processAccount(account, index, accounts.length);
      
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          email: result.email,
          error: result.error
        });
      }
      
      return result;
    })
  );
  
  await Promise.all(promises);
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  // Enhanced Final Summary
  console.log('\n🏁 FIFA World Cup 2026 ENHANCED Account Setup Complete!');
  console.log(`⏱️  Total execution time: ${duration} minutes`);
  console.log('📊 ENHANCED Results Summary:');
  console.log(`   • Total accounts processed: ${results.total}`);
  console.log(`   • ✅ Successful completions: ${results.successful}`);
  console.log(`   • ❌ Failed completions: ${results.failed}`);
  console.log(`   • 📈 Success rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed Accounts Summary:');
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.email}: ${error.error}`);
    });
  }
  
  console.log('\n✨ ENHANCED FIFA World Cup 2026 Setup Process Summary:');
  console.log('🎯 Enhanced Features Applied:');
  console.log('   • Country-specific administrative division detection');
  console.log('   • Smart default data generation for missing fields');
  console.log('   • Multiple field detection strategies');
  console.log('   • Enhanced error handling and validation');
  console.log('   • Comprehensive CAPTCHA detection');
  console.log('   • Anti-bot measures with human-like behavior');
  console.log('');
  console.log('📝 Profile Fields Completed:');
  console.log('   • Last Name (with auto-generation)');
  console.log('   • Mobile Number (with auto-generation)');
  console.log('   • Gender Selection (with defaults)');
  console.log('   • Continue button activation');
  console.log('');
  console.log('🏠 Enhanced Address Fields Completed:');
  console.log('   • Address (with intelligent defaults)');
  console.log('   • City* (mandatory - with auto-generation)');
  console.log('   • Zip Code* (mandatory - with auto-generation)');
  console.log('   • Country* (mandatory - with smart detection)');
  console.log('   • Administrative Divisions (country-specific):');
  console.log('     ○ United States: State field');
  console.log('     ○ France: Department + Region fields');
  console.log('     ○ Spain: Province field');
  console.log('     ○ Switzerland: Canton field');
  console.log('     ○ Italy: Region field');
  console.log('     ○ Belgium: Region field');
  console.log('   • Mobile Number (with auto-generation)');
  console.log('   • Authorization: "I accept" selection');
  console.log('   • Save button activation (enhanced detection)');
  console.log('');
  console.log('🛡️  Enhanced Security & Reliability:');
  console.log('   • Multiple selector strategies for each field');
  console.log('   • JavaScript fallback methods');
  console.log('   • Position-based field detection');
  console.log('   • Comprehensive form validation');
  console.log('   • Error detection and reporting');
  console.log('   • CAPTCHA pause for manual solving');
  console.log('   • Browser anti-detection measures');
  console.log('');
  console.log('🔗 Target System: FIFA World Cup 2026 Deposit/Ticketing OAuth');
  console.log('🏆 Expected OAuth URL: https://auth.fifa.com/as/authorize...');
  console.log('');
  console.log('ℹ️  Important Notes:');
  console.log('   • Fields marked with * are mandatory');
  console.log('   • Auto-generated data used when Excel data missing');
  console.log('   • Browsers left open for manual result verification');
  console.log('   • Manual CAPTCHA solving supported with 2-minute pause');
  console.log('   • Enhanced country detection for administrative divisions');
  console.log('   • Smart city-to-region mapping for accurate data');
  console.log('');
  console.log('⚠️  Post-Process Actions Required:');
  console.log('   • Manually close browsers when finished reviewing');
  console.log('   • Verify successful account setups in FIFA system');
  console.log('   • Review any failed accounts for manual completion');
  console.log('   • Check for any CAPTCHA-blocked accounts');
  console.log('');
  console.log('🎉 Enhanced FIFA World Cup 2026 account setup process completed!');
  console.log('📧 For support or issues, review the detailed logs above.');
  
})().catch(err => {
  console.error('💥 Fatal Enhanced Setup Error:', err.message);
  console.error('🔍 Error Details:', err.stack);
  process.exit(1);
});

// Jitter helpers
function randomTimezone() {
  const zones = ['America/New_York', 'Europe/Paris', 'Asia/Dubai', 'Europe/Berlin', 'Asia/Singapore', 'America/Los_Angeles'];
  return zones[Math.floor(Math.random() * zones.length)];
}

function randomUserAgent() {
  const chromeVersion = Math.floor(Math.random() * 10 + 110); // 110–119
  const winVersion = Math.floor(Math.random() * 2) ? '10.0' : '11.0';
  return `Mozilla/5.0 (Windows NT ${winVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`;
}

function randomViewport() {
  return {
    width: 1360 + Math.floor(Math.random() * 21), // 1360–1380
    height: 760 + Math.floor(Math.random() * 21)  // 760–780
  };
}