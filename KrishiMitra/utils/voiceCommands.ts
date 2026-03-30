// ─────────────────────────────────────────────────────────────────────────────
// KrishiMitra – Voice Navigation Utility
// Maps spoken keywords to app routes.
// Works on both the landing page and the post-login home area.
// ─────────────────────────────────────────────────────────────────────────────
import { router } from 'expo-router';

export type CommandResult = {
  matched: boolean;
  label?: string;
  route?: string;
};

export type VoiceCommand = {
  keywords: string[];
  route: string;
  label: string;
};

/**
 * Full keyword → route mapping.
 * Keywords are checked with `String.includes()` on the lowercase transcript,
 * so partial matches deliberately work (e.g. "show login" → login page).
 *
 * Multilingual keywords:
 *   Hindi  – mausam (weather), yojana (govt schemes), login, register
 *   Marathi – hava (weather), yojana, nondni (registration)
 */
export const ALL_COMMANDS: VoiceCommand[] = [
  /* ── Auth ─────────────────────────────────────────────────────────────── */
  {
    keywords: ['login', 'log in', 'sign in', 'लॉगिन'],
    route: '/login',
    label: 'Login',
  },
  {
    keywords: ['sign up', 'signup', 'register', 'create account', 'new account', 'नोंदणी', 'nondni'],
    route: '/signup',
    label: 'Sign Up',
  },
  {
    keywords: ['dealer login', 'dealer log in', 'dealer sign in'],
    route: '/dealer-login',
    label: 'Dealer Login',
  },
  {
    keywords: ['dealer sign up', 'dealer signup', 'dealer register', 'dealer account'],
    route: '/dealer-signup',
    label: 'Dealer Sign Up',
  },

  /* ── Post-login pages ─────────────────────────────────────────────────── */
  {
    keywords: ['home', 'dashboard', 'main', 'homepage', 'go home'],
    route: '/(home)',
    label: 'Home',
  },
  {
    keywords: ['weather', 'mausam', 'climate', 'forecast', 'hava', 'हवामान', 'मौसम'],
    route: '/(home)/weather',
    label: 'Weather',
  },
  {
    keywords: ['government', 'schemes', 'gov schemes', 'yojana', 'subsidy', 'insurance', 'सरकारी योजना', 'sarkar'],
    route: '/(home)/gov-schemes',
    label: 'Government Schemes',
  },
  {
    keywords: ['hedging', 'hedge', 'price lock', 'lock price', 'protect price', 'price protection'],
    route: '/(home)/hedging',
    label: 'Hedging',
  },
  {
    keywords: ['crop', 'seed', 'crop suggestion', 'seeds', 'resources', 'पीक'],
    route: '/(home)/resources',
    label: 'Crop Resources',
  },
  {
    keywords: ['fertilizer', 'fertiliser', 'agri suggest', 'agriculture suggest', 'khad', 'खत', 'agri'],
    route: '/(home)/agri-suggest',
    label: 'Fertilizer / Agri Suggest',
  },
  {
    keywords: ['historical', 'price history', 'past prices', 'market history', 'old prices'],
    route: '/(home)/historical',
    label: 'Historical Prices',
  },
  {
    keywords: ['reminder', 'reminders', 'alarm', 'notification', 'alert', 'आठवण'],
    route: '/(home)/reminders',
    label: 'Reminders',
  },
  {
    keywords: ['history', 'previous history', 'my history', 'deal history'],
    route: '/(home)/history',
    label: 'History',
  },
];

/** Special keyword for "go back" – handled outside the COMMANDS array */
const BACK_KEYWORDS = ['go back', 'back', 'cancel', 'close', 'stop', 'exit', 'return'];

/**
 * Match a speech transcript to a known route.
 * Returns `{ matched: true, label, route }` or `{ matched: false }`.
 */
export function matchVoiceCommand(transcript: string): CommandResult {
  const lower = transcript.toLowerCase().trim();
  if (!lower) return { matched: false };

  // Check "go back" first so it takes priority over content keywords
  if (BACK_KEYWORDS.some((k) => lower.includes(k))) {
    return { matched: true, label: 'Go Back', route: '__back__' };
  }

  for (const cmd of ALL_COMMANDS) {
    for (const keyword of cmd.keywords) {
      if (lower.includes(keyword)) {
        return { matched: true, label: cmd.label, route: cmd.route };
      }
    }
  }

  return { matched: false };
}

/**
 * Execute a previously matched navigation result.
 * Call this AFTER showing the user visual feedback.
 */
export function executeVoiceNavigation(result: CommandResult): void {
  if (!result.matched || !result.route) return;
  if (result.route === '__back__') {
    router.back();
  } else {
    router.push(result.route as any);
  }
}
