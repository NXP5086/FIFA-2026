// One-time script to pre-register all participants in Supabase auth.
// Run once: node scripts/register-participants.mjs
//
// Requires SUPABASE_SERVICE_ROLE_KEY in your .env
// Get it from: Supabase → Settings → API → service_role key

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Read .env manually (no dotenv needed)
const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const supabaseUrl     = env.VITE_SUPABASE_URL;
const serviceRoleKey  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const participants = [
  { email: "mriganksanghvi@gmail.com"      },
  { email: "pooja.jose94@gmail.com"        },
  { email: "herilshah419@gmail.com"        },
  { email: "shefali.gaglani05@gmail.com"   },
  { email: "imtinokpongener@gmail.com"     },
  { email: "taliimchen72@gmail.com"        },
  { email: "puraka10@gmail.com"            },
  { email: "bivinq@gmail.com"              },
  { email: "aosen.xeno@gmail.com"          },
  { email: "jamir.arenanung@gmail.com"     },
  { email: "hussainsm89@gmail.com"         },
  { email: "moatenzuklongkumer@gmail.com"  },
  { email: "richardkath2@gmail.com"        },
  { email: "meyipokao@gmail.com"           },
  { email: "emmanuelamrittopno@gmail.com"  },
  { email: "onen4032@gmail.com"            },
  { email: "harshini226@gmail.com"         },
  { email: "prakulkr.07@gmail.com"         },
  { email: "vijitkumar30@gmail.com"        },
  { email: "kimalongz079@gmail.com"        },
  { email: "mxd.216@gmail.com"             },
  { email: "nehavs24@gmail.com"            },
  { email: "longkumer.longtilong@gmail.com"},
  { email: "sungtirongimchen@gmail.com"    },
  { email: "panyukuru@gmail.com"           },
  { email: "esthernbm@gmail.com"           },
  { email: "nathanxpaul@hotmail.com"       },
];

console.log(`Registering ${participants.length} participants…\n`);

let ok = 0, skipped = 0, failed = 0;

for (const { email } of participants) {
  const { error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,   // marks email as verified — no confirmation email sent
  });

  if (!error) {
    console.log(`  ✓  ${email}`);
    ok++;
  } else if (error.message?.toLowerCase().includes('already registered')) {
    console.log(`  –  ${email}  (already exists)`);
    skipped++;
  } else {
    console.error(`  ✗  ${email}  →  ${error.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} created · ${skipped} already existed · ${failed} failed`);
