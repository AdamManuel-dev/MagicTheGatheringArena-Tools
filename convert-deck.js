#!/usr/bin/env node
/**
 * @fileoverview Convert Commander decklist to odds:watch deck JSON format
 * @lastmodified 2025-10-08
 */

const https = require('https');
const fs = require('fs');

// Parse the decklist
const decklistText = `
Commander
1 Scions of the Ur-Spider (OM1) 154

Deck
1 Ishkanah, Grafwidow (SIR) 204
1 Ishkanah, Broodmother (Y22) 52
1 Shelob, Child of Ungoliant (LTR) 230
1 Arasta of the Endless Web (THB) 165
1 Rotwidow Pack (MH1) 212
1 Skyfisher Spider (BRO) 221
1 Twin-Silk Spider (MH1) 188
1 Funnel-Web Recluse (MH2) 161
1 Spinner of Souls (FDN) 112
1 Nyx Weaver (PIO) 236
1 Izoni, Center of the Web (MKM) 209
1 Lolth, Spider Queen (AFR) 112
1 Kraza, the Swarm as One (OM1) 85
1 Borys, the Spider Rider (OM1) 126
1 Demera, Soul of a Spider (OM1) 132
1 Alenni, Brood Recruiter (OM1) 123
1 Rizna, the Spider-Crowned (OM1) 92
1 Cren, Undercity Dreamer (OM1) 102
1 Darval, Whose Web Protects (OM1) 9
1 Ademi of the Silkchutes (OM1) 1
1 Sarn of the Silken Throne (OM1) 18
1 Kavaero, Mind-Bitten (OM1) 140
1 Herd Heirloom (TDM) 144
1 Ilysian Caryatid (ANB) 98
1 Bloom Tender (SPG) 0
1 Twitching Doll (DSK) 201
1 Chainweb Aracnir (THB) 167
1 Mirkwood Spider (LTR) 178
1 Obelisk Spider (AKR) 249
1 Sporeweb Weaver (M21) 208
1 Drider (HBG) 152
1 A-Thran Spider (BRO) 254
1 Vinesoul Spider (Y23) 18
1 Snarespinner (DMU) 179
1 Treetop Snarespinner (FDN) 114
1 Gnottvold Recluse (KHM) 172
1 Glowstone Recluse (IKO) 156
1 Hatchery Spider (GRN) 132
1 Brood Weaver (MID) 173
1 Broodspinner (DSK) 211
1 Zora, Spider Fancier (OM1) 24
1 Surris, Spidersilk Innovator (OM1) 21
1 Arcane Signet (ELD) 331
1 Chromatic Lantern (J25) 151
1 Mox Amber (BRR) 35
1 Wayfarer's Bauble (CM2) 229
1 Patchwork Banner (BLB) 247
1 Banner of Kinship (FDN) 127
1 Vanquisher's Banner (XLN) 251
1 Reflections of Littjara (KHM) 73
1 Roaming Throne (LCI) 258
1 Maskwood Nexus (KHM) 240
1 Arachnogenesis (OMB) 0
1 Spider Spawning (SIS) 56
1 Assassin's Trophy (MKM) 187
1 Maelstrom Pulse (FDN) 661
1 Cast Down (HBG) 148
1 Sheoldred's Edict (ONE) 108
1 Eaten Alive (FDN) 172
1 Pick Your Poison (MKM) 170
1 Grave Choice (HBG) 43
1 Not Dead After All (WOE) 101
1 Cavern of Souls (LCI) 269
1 Secluded Courtyard (NEO) 275
1 Command Tower (ELD) 333
1 Swarmyard (EOS) 42
1 Temple of Malady (FDN) 700
1 Jungle Hollow (KTK) 235
1 Golgari Guildgate (FDN) 689
1 Underground Mortuary (MKM) 271
1 Night Market (DFT) 258
1 Multiversal Passage (OM1) 181
1 Unclaimed Territory (XLN) 258
16 Forest (KTK) 258
6 Swamp (KTK) 254
2 Mountain (KTK) 256
1 Plains (KTK) 250
1 Island (KTK) 252
`.trim();

// Parse decklist into structured data
function parseDecklist(text) {
  const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('Commander') && !line.startsWith('Deck'));
  const cards = [];

  const regex = /^(\d+)\s+(.+?)\s+\(([A-Z0-9]+)\)\s+(\d+)$/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const [, quantity, name, set, collectorNumber] = match;
      cards.push({
        quantity: parseInt(quantity, 10),
        name: name.trim(),
        set: set.toLowerCase(),
        collector_number: collectorNumber,
      });
    }
  }

  return cards;
}

// Fetch card data from Scryfall
async function fetchCardFromScryfall(set, collectorNumber) {
  return new Promise((resolve, reject) => {
    const url = `https://api.scryfall.com/cards/${set}/${collectorNumber}`;
    const options = {
      headers: {
        'User-Agent': 'mtga-deck-converter/1.0.0',
        'Accept': 'application/json',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Delay helper for rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main conversion function
async function convertDeck() {
  const cards = parseDecklist(decklistText);
  console.log(`Parsed ${cards.length} unique cards from decklist`);

  const deckCards = [];
  const failedCards = [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`[${i + 1}/${cards.length}] Fetching ${card.name} (${card.set} ${card.collector_number})...`);

    try {
      const scryfallCard = await fetchCardFromScryfall(card.set, card.collector_number);

      if (scryfallCard.arena_id) {
        deckCards.push({
          arena_id: scryfallCard.arena_id,
          name: card.name,
          quantity: card.quantity,
        });
        console.log(`  ✓ Arena ID: ${scryfallCard.arena_id}`);
      } else {
        console.log(`  ⚠ No Arena ID found for ${card.name}`);
        failedCards.push({...card, reason: 'no_arena_id'});
      }

      // Rate limit: 100ms between requests (Scryfall allows ~10 req/sec)
      if (i < cards.length - 1) {
        await delay(100);
      }
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      failedCards.push({...card, reason: error.message});
    }
  }

  // Create groups for tracking
  const groups = [
    {
      id: 'spiders',
      label: 'Spider Creatures',
      arena_ids: deckCards
        .filter(c => c.name.toLowerCase().includes('spider') ||
                     c.name.includes('Lolth') ||
                     c.name.includes('Ishkanah') ||
                     c.name.includes('Shelob'))
        .map(c => c.arena_id)
    },
    {
      id: 'lands',
      label: 'Lands',
      arena_ids: deckCards
        .filter(c => ['Forest', 'Swamp', 'Mountain', 'Plains', 'Island'].includes(c.name) ||
                     c.name.toLowerCase().includes('land'))
        .map(c => c.arena_id)
    },
    {
      id: 'removal',
      label: 'Removal',
      arena_ids: deckCards
        .filter(c => ['Assassin\'s Trophy', 'Maelstrom Pulse', 'Cast Down',
                      'Sheoldred\'s Edict', 'Eaten Alive', 'Pick Your Poison',
                      'Grave Choice', 'Not Dead After All'].includes(c.name))
        .map(c => c.arena_id)
    },
  ].filter(g => g.arena_ids.length > 0);

  const deckJson = {
    cards: deckCards,
    groups: groups,
  };

  // Write output
  const outputPath = 'spider-commander.json';
  fs.writeFileSync(outputPath, JSON.stringify(deckJson, null, 2), 'utf8');

  console.log(`\n✓ Deck JSON written to ${outputPath}`);
  console.log(`  - ${deckCards.length} cards with Arena IDs`);
  console.log(`  - ${failedCards.length} cards without Arena IDs`);
  console.log(`  - ${groups.length} tracking groups created`);

  if (failedCards.length > 0) {
    console.log('\nCards without Arena IDs (not available in Arena):');
    failedCards.forEach(card => {
      console.log(`  - ${card.name} (${card.set.toUpperCase()} ${card.collector_number})`);
    });
  }
}

// Run the conversion
convertDeck().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
