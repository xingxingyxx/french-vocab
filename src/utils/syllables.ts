/**
 * French syllable splitting utilities.
 * Rule-based approach for common French patterns.
 */

// Common French vowel combinations
const VOWEL_GROUPS = ['eau', 'au', 'ou', 'oi', 'ai', 'ei', 'eu', 'œu', 'ui', 'an', 'en', 'in', 'on', 'un', 'oin', 'ien', 'ain', 'ein', 'uil', 'ill', 'ail', 'eil', 'euil', 'ouil'];

// Common consonant clusters that stay together
const CONSONANT_CLUSTERS = ['ch', 'ph', 'th', 'gn', 'gu', 'qu', 'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'vr', 'bl', 'cl', 'fl', 'gl', 'pl', 'spl', 'spr', 'str', 'scr'];

/**
 * Split a French word into syllables using rule-based approach.
 * This is a heuristic and won't be perfect, but works for common words.
 */
export function splitSyllables(word: string): string[] {
  const cleaned = word.toLowerCase().trim();
  const syllables: string[] = [];
  let current = '';
  let i = 0;

  while (i < cleaned.length) {
    // Check for multi-char vowel groups
    let foundVowelGroup = false;
    for (const group of VOWEL_GROUPS) {
      if (cleaned.startsWith(group, i) && group.length >= 2) {
        if (current) {
          syllables.push(current);
          current = '';
        }
        current = cleaned.slice(i, i + group.length);
        i += group.length;
        foundVowelGroup = true;

        // If there's a consonant after the vowel group that starts a new syllable
        if (i < cleaned.length) {
          const remaining = cleaned.slice(i);
          // Check if next chars could be start of new syllable (consonant + vowel)
          if (remaining.length >= 2 && isConsonant(remaining[0]) && isVowel(remaining[1])) {
            // The consonant goes with the next vowel
            if (current) {
              syllables.push(current);
              current = '';
            }
          } else if (remaining.length >= 1 && isConsonant(remaining[0]) && i + 1 < cleaned.length && isConsonant(cleaned[i + 1])) {
            // Multiple consonants at end - first one closes current syllable
            current += cleaned[i];
            i++;
            syllables.push(current);
            current = '';
          }
        }
        break;
      }
    }

    if (!foundVowelGroup) {
      const char = cleaned[i];

      // Check for consonant clusters
      let foundCluster = false;
      for (const cluster of CONSONANT_CLUSTERS) {
        if (cleaned.startsWith(cluster, i) && cluster.length >= 2) {
          if (current && isVowel(current[current.length - 1])) {
            // Cluster starts new syllable when after a vowel and followed by a vowel
            const afterCluster = cleaned[i + cluster.length];
            if (afterCluster && isVowel(afterCluster)) {
              syllables.push(current);
              current = '';
            }
          }
          current += cluster;
          i += cluster.length;
          foundCluster = true;
          break;
        }
      }

      if (!foundCluster) {
        // Handle silent 'e' at end of word
        if (char === 'e' && i === cleaned.length - 1 && current.length > 0) {
          current += char;
          i++;
        } else if (isVowel(char) && current.length > 0 && isVowel(current[current.length - 1])) {
          // Two vowels meeting (rare, usually part of a group)
          current += char;
          i++;
        } else if (isVowel(char) && current.length > 0) {
          // New vowel = new syllable
          syllables.push(current);
          current = char;
          i++;
        } else {
          current += char;
          i++;
        }
      }
    }
  }

  if (current) {
    syllables.push(current);
  }

  // Merge very short syllables with neighbors
  return mergeShortSyllables(syllables);
}

function isVowel(char: string): boolean {
  return 'aeiouyàâäéèêëîïôöùûüæœ'.includes(char);
}

function isConsonant(char: string): boolean {
  return !isVowel(char) && char !== '-' && char !== '\'';
}

function mergeShortSyllables(syllables: string[]): string[] {
  if (syllables.length <= 1) return syllables;

  const result: string[] = [];
  let i = 0;

  while (i < syllables.length) {
    const current = syllables[i];

    // If this syllable is a single consonant, merge with next
    if (current.length === 1 && isConsonant(current[0]) && i + 1 < syllables.length) {
      result.push(current + syllables[i + 1]);
      i += 2;
    }
    // If next syllable is just a silent 'e', merge
    else if (i + 1 < syllables.length && syllables[i + 1] === 'e' && i + 1 === syllables.length - 1) {
      result.push(current + 'e');
      i += 2;
    }
    else {
      result.push(current);
      i++;
    }
  }

  return result;
}

/**
 * Get a Chinese-style pinyin hint for a French syllable.
 */
export function getPinyinHint(syllable: string): string {
  // Simplified mapping of French sounds to approximate pinyin
  const mappings: Record<string, string> = {
    'a': 'a',
    'â': 'a',
    'à': 'a',
    'ai': 'ai',
    'ais': 'ai',
    'ait': 'ai',
    'an': 'ang',
    'en': 'ang',
    'em': 'ang',
    'au': 'ou',
    'eau': 'ou',
    'b': 'b',
    'c': 'k',
    'ç': 's',
    'ch': 'sh',
    'd': 'd',
    'é': 'ei',
    'è': 'ai',
    'ê': 'ai',
    'e': 'e',
    'eu': 'e',
    'euil': 'ey',
    'f': 'f',
    'g': 'g',
    'gn': 'ni',
    'gu': 'g',
    'h': '',
    'i': 'i',
    'î': 'i',
    'ï': 'i',
    'ien': 'ian',
    'il': 'yi',
    'ill': 'yi',
    'in': 'an',
    'j': 'r',
    'k': 'k',
    'l': 'l',
    'm': 'm',
    'n': 'n',
    'o': 'o',
    'ô': 'o',
    'oi': 'wa',
    'oin': 'wan',
    'on': 'ong',
    'om': 'ong',
    'ou': 'u',
    'où': 'u',
    'p': 'p',
    'ph': 'f',
    'qu': 'k',
    'r': 'h',
    's': 's',
    't': 't',
    'th': 't',
    'u': 'yu',
    'û': 'yu',
    'ù': 'yu',
    'ui': 'we',
    'un': 'an',
    'um': 'ang',
    'v': 'v',
    'w': 'w',
    'x': 'ks',
    'y': 'yi',
    'z': 'z',
  };

  let result = '';
  let i = 0;
  const lower = syllable.toLowerCase();

  while (i < lower.length) {
    let matched = false;

    // Try longer matches first
    for (let len = Math.min(4, lower.length - i); len >= 1; len--) {
      const chunk = lower.slice(i, i + len);
      if (mappings[chunk] !== undefined) {
        result += mappings[chunk];
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result += lower[i];
      i++;
    }
  }

  return result || syllable;
}
