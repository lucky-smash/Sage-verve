/*
  The people in the hero office, and what each of them does at every stage.
  Points are [zone, x, z] in that zone's local space (zones move, people move with them).
  Zone layout (joined): A back-left workspace · B back-right meeting room · C front-left collaboration ·
  D front-right reception · H the hub at the centre.
  A program is a loop of steps: walk to `to` over `dur` seconds, then hold there for `hold` seconds.
  Programs are indexed by stage (0 fragmented, 1 aligned, 2 leadership, 3 performance); a missing
  stage falls back to the one before it.
*/

export type ZoneId = 'A' | 'B' | 'C' | 'D' | 'H';
export type Pt = readonly [ZoneId, number, number];
export type Pose = 'stand' | 'talk' | 'listen' | 'type' | 'point' | 'shake' | 'present';
export type Step = { to: Pt; dur: number; hold: number; pose: Pose; face?: Pt; sit?: boolean };
export type Look = {
  jacket: string;
  sleeves?: string;
  shirt: string;
  trousers: string;
  shoes: string;
  skin: string;
  hair: string;
  longHair?: boolean;
};
export type CharDef = { id: string; look: Look; programs: (Step[] | undefined)[]; offset: number; compact: boolean };

const go = (to: Pt, dur: number): Step => ({ to, dur, hold: 0, pose: 'stand' });
const hold = (to: Pt, sec: number, pose: Pose = 'stand', face?: Pt): Step => ({ to, dur: 0, hold: sec, pose, face });
const walkHold = (to: Pt, dur: number, sec: number, pose: Pose = 'stand', face?: Pt): Step => ({ to, dur, hold: sec, pose, face });
const seat = (to: Pt, face: Pt, pose: Pose = 'type'): Step[] => [{ to, dur: 0, hold: 10, pose, face, sit: true }];
const seatAfterWalk = (to: Pt, dur: number, sec: number, face: Pt, pose: Pose = 'listen'): Step => ({
  to, dur, hold: sec, pose, face, sit: true,
});

const SKIN = ['#F0C8A4', '#DDA67C', '#C4895E', '#A06B45', '#7C4E31', '#E8B996'];
const HAIR = { black: '#1C1B20', dark: '#2E241E', brown: '#5A3C28', grey: '#A4A6AC', salt: '#6E6F75' };
const JACKET = { navy: '#1B2F50', ink: '#111D32', blue: '#4169E1', ivory: '#E8E3D6', grey: '#C3CCDA', sage: '#93A887', tan: '#C9A27C', lime: '#B9D96C' };
const TROUSERS = { ink: '#1E2636', slate: '#3B4558', stone: '#D9D2C2', navy: '#22355A' };
const SHIRT = { white: '#F8F7F3', sky: '#DCE6F6', ivory: '#EFE9DC' };

const look = (jacket: string, trousers: string, skin: number, hair: string, opts: Partial<Look> = {}): Look => ({
  jacket,
  shirt: SHIRT.white,
  trousers,
  shoes: '#1A1F2B',
  skin: SKIN[skin],
  hair,
  ...opts,
});

const hubSeats = {
  lead: ['H', -0.62, -0.78] as Pt,
  a: ['H', 0.98, -0.25] as Pt,
  b: ['H', 0.55, 0.86] as Pt,
  d: ['H', -0.98, 0.32] as Pt,
};
const HUB: Pt = ['H', 0, 0];

export function buildCast(compact: boolean): CharDef[] {
  const all: CharDef[] = [
    /* ── Zone A: workspace ───────────────────────────── */
    {
      id: 'A1',
      look: look(JACKET.grey, TROUSERS.ink, 1, HAIR.black, { shirt: SHIRT.sky }),
      programs: [seat(['A', -1.9, -1.32], ['A', -1.9, -0.4])],
      offset: 0.3,
      compact: true,
    },
    {
      id: 'A2',
      look: look(JACKET.ivory, TROUSERS.slate, 3, HAIR.dark, { longHair: true, shirt: SHIRT.ivory }),
      programs: [seat(['A', 0.4, 0.4], ['A', 0.4, -0.5])],
      offset: 1.7,
      compact: true,
    },
    {
      id: 'A5',
      look: look(JACKET.sage, TROUSERS.ink, 0, HAIR.brown),
      programs: [seat(['A', -0.75, 0.4], ['A', -0.75, -0.5])],
      offset: 2.9,
      compact: false,
    },
    {
      // A manager mentoring A2 at her desk; joins the leadership table at stage 2.
      id: 'A4',
      look: look(JACKET.navy, TROUSERS.navy, 2, HAIR.salt),
      programs: [
        [hold(['A', 0.98, 0.78], 5, 'point', ['A', 0.4, -0.3]), hold(['A', 0.98, 0.78], 4, 'talk', ['A', 0.4, 0.4])],
        undefined,
        [walkHold(hubSeats.a, 4, 6, 'listen', HUB), hold(hubSeats.a, 5, 'talk', HUB)],
        [walkHold(['A', 0.98, 0.78], 4, 5, 'point', ['A', 0.4, -0.3]), hold(['A', 0.98, 0.78], 4, 'talk', ['A', 0.4, 0.4])],
      ],
      offset: 0,
      compact: true,
    },
    {
      // Moves around the workspace; once aligned, carries work across to reception.
      id: 'A3',
      look: look(JACKET.blue, TROUSERS.ink, 4, HAIR.black),
      programs: [
        [
          walkHold(['A', 2.45, 1.55], 3.2, 1.2),
          walkHold(['A', 2.45, -1.35], 3.4, 2.2, 'stand', ['A', 2.6, -1.9]),
          walkHold(['A', -2.6, -1.25], 5.2, 1.6, 'stand', ['A', -2.6, -2.0]),
          walkHold(['A', -2.4, 1.4], 3.0, 1.0),
        ],
        [
          walkHold(['A', 2.6, 1.85], 2.5, 0.4),
          go(['H', -0.9, -0.95], 2.2),
          go(['H', 0.95, 0.9], 2.6),
          walkHold(['D', -1.5, -0.25], 2.6, 3.2, 'talk', ['D', -1.8, -0.43]),
          go(['H', 0.95, 0.9], 2.6),
          go(['H', -0.9, -0.95], 2.6),
          walkHold(['A', 1.4, 1.3], 2.4, 1.5),
        ],
      ],
      offset: 0.8,
      compact: true,
    },

    /* ── Zone B: meeting room ────────────────────────── */
    {
      // Two professionals walking to the meeting room together. From stage 1 they come from the workspace.
      id: 'B1',
      look: look(JACKET.ink, TROUSERS.slate, 1, HAIR.dark),
      programs: [
        [
          walkHold(['B', -2.3, 1.55], 3.4, 2.6, 'talk', ['B', -2.3, 1.95]),
          go(['B', 0.3, 1.6], 3.1),
          go(['B', 0.3, 0.55], 1.3),
          seatAfterWalk(['B', 0.55, 0.17], 0.8, 7, ['B', 0.55, -0.6], 'talk'),
          go(['B', 0.3, 0.6], 0.8),
          go(['B', 0.3, 1.6], 1.3),
        ],
        [
          walkHold(['A', 2.2, -1.3], 3.6, 2.0, 'talk', ['A', 2.2, -0.9]),
          go(['A', 2.95, 1.0], 2.6),
          go(['B', -2.9, 1.55], 2.4),
          go(['B', 0.3, 1.6], 3.3),
          go(['B', 0.3, 0.55], 1.3),
          seatAfterWalk(['B', 0.55, 0.17], 0.8, 7, ['B', 0.55, -0.6], 'talk'),
          go(['B', 0.3, 0.6], 0.8),
          go(['B', 0.3, 1.6], 1.3),
          go(['B', -2.9, 1.55], 3.3),
          go(['A', 2.95, 1.0], 2.4),
        ],
      ],
      offset: 0,
      compact: true,
    },
    {
      id: 'B2',
      look: look(JACKET.tan, TROUSERS.ink, 5, HAIR.black, { longHair: true, shirt: SHIRT.ivory }),
      programs: [
        [
          walkHold(['B', -2.3, 1.95], 3.4, 2.6, 'listen', ['B', -2.3, 1.55]),
          go(['B', -0.1, 1.95], 3.1),
          go(['B', 0.3, 0.55], 1.3),
          seatAfterWalk(['B', 1.25, 0.17], 0.8, 7, ['B', 1.25, -0.6], 'listen'),
          go(['B', 0.3, 0.6], 0.8),
          go(['B', 0.3, 1.6], 1.3),
        ],
        [
          walkHold(['A', 2.2, -0.9], 3.6, 2.0, 'listen', ['A', 2.2, -1.3]),
          go(['A', 2.6, 1.2], 2.6),
          go(['B', -2.9, 1.95], 2.4),
          go(['B', -0.1, 1.95], 3.3),
          go(['B', 0.3, 0.55], 1.3),
          seatAfterWalk(['B', 1.25, 0.17], 0.8, 7, ['B', 1.25, -0.6], 'listen'),
          go(['B', 0.3, 0.6], 0.8),
          go(['B', 0.3, 1.6], 1.3),
          go(['B', -2.9, 1.95], 3.3),
          go(['A', 2.6, 1.2], 2.4),
        ],
      ],
      offset: 0.55,
      compact: true,
    },
    {
      // Leads the meeting inside; becomes one of the leaders at the hub.
      id: 'B3',
      look: look(JACKET.navy, TROUSERS.ink, 3, HAIR.grey),
      programs: [
        seat(['B', 0.9, -1.35], ['B', 0.9, -0.6], 'talk'),
        undefined,
        [walkHold(hubSeats.b, 5, 7, 'talk', HUB), hold(hubSeats.b, 4, 'listen', HUB)],
        seat(['B', 0.9, -1.35], ['B', 0.9, -0.6], 'talk'),
      ],
      offset: 1.2,
      compact: true,
    },
    {
      id: 'B4',
      look: look(JACKET.ivory, TROUSERS.navy, 0, HAIR.brown, { longHair: true }),
      programs: [seat(['B', 1.6, -1.35], ['B', 1.6, -0.6], 'listen')],
      offset: 2.4,
      compact: true,
    },
    {
      // Sits at the desk outside the meeting room; once aligned, walks over to the workspace.
      id: 'E2',
      look: look(JACKET.grey, TROUSERS.slate, 2, HAIR.black),
      programs: [
        seat(['B', -2.2, -0.62], ['B', -2.2, -1.4]),
        [
          walkHold(['B', -2.2, -0.2], 1.4, 1.5),
          go(['B', -2.95, -1.9], 1.8),
          go(['A', 2.95, -1.9], 1.8),
          walkHold(['A', 1.2, -1.55], 2.0, 4, 'talk', ['A', -0.4, -1.32]),
          go(['A', 2.95, -1.9], 2.0),
          go(['B', -2.95, -1.9], 1.8),
          walkHold(['B', -2.2, -0.2], 1.8, 1.0),
        ],
      ],
      offset: 3.3,
      compact: false,
    },

    /* ── Zone C: collaboration ───────────────────────── */
    {
      // A leader discussing strategy with the team; takes the head of the hub table at stage 2.
      id: 'C1',
      look: look(JACKET.ink, TROUSERS.ink, 2, HAIR.salt, { shirt: SHIRT.white }),
      programs: [
        [hold(['C', 0.6, -1.06], 6, 'talk', ['C', 0.6, -0.2]), hold(['C', 0.6, -1.06], 3, 'present', ['C', 1.4, 0.05])],
        undefined,
        [walkHold(hubSeats.lead, 4.5, 6, 'talk', HUB), hold(hubSeats.lead, 3, 'present', hubSeats.b)],
        [walkHold(['C', 0.6, -1.06], 4.5, 6, 'talk', ['C', 0.6, -0.2]), hold(['C', 0.6, -1.06], 3, 'present', ['C', 1.4, 0.05])],
      ],
      offset: 0,
      compact: true,
    },
    {
      id: 'C2',
      look: look(JACKET.blue, TROUSERS.stone, 5, HAIR.dark, { longHair: true, shirt: SHIRT.white }),
      programs: [
        [hold(['C', 1.43, 0.05], 6, 'listen', ['C', 0.6, -0.2]), hold(['C', 1.43, 0.05], 3, 'talk', ['C', 0.6, -1.06])],
        undefined,
        [hold(['C', 1.43, 0.05], 5, 'talk', ['C', 0.6, -0.2]), hold(['C', 1.43, 0.05], 4, 'listen', ['C', -0.2, 0.1])],
      ],
      offset: 0.7,
      compact: true,
    },
    {
      id: 'C3',
      look: look(JACKET.sage, TROUSERS.ink, 1, HAIR.black),
      programs: [[hold(['C', -0.22, 0.1], 9, 'listen', ['C', 0.6, -0.2])]],
      offset: 1.9,
      compact: true,
    },
    {
      id: 'C4',
      look: look(JACKET.lime, TROUSERS.ink, 4, HAIR.black, { sleeves: JACKET.lime }),
      programs: [[hold(['C', 0.78, 0.66], 9, 'listen', ['C', 0.6, -0.2])]],
      offset: 2.6,
      compact: false,
    },
    {
      // Coffee break loop; from stage 1 a regular visitor to the meeting zone.
      id: 'C5',
      look: look(JACKET.ivory, TROUSERS.slate, 0, HAIR.brown),
      programs: [
        [
          walkHold(['C', -1.2, -1.35], 3.4, 3.2, 'stand', ['C', -1.2, -1.95]),
          walkHold(['C', 2.2, 1.25], 4.4, 1.2),
          walkHold(['C', -0.6, 1.75], 3.2, 2.0, 'stand', ['C', -1.7, 0.95]),
        ],
        [
          walkHold(['C', -1.2, -1.35], 3.0, 2.0, 'stand', ['C', -1.2, -1.95]),
          go(['C', 2.95, -1.6], 4.2),
          go(['H', -0.95, -1.05], 1.8),
          go(['B', -2.95, 1.9], 2.6),
          walkHold(['B', -2.2, 0.0], 1.6, 3.0, 'talk', ['B', -2.2, -0.62]),
          go(['B', -2.95, 1.9], 1.6),
          go(['H', -0.95, -1.05], 2.6),
          go(['C', 2.95, -1.6], 1.8),
        ],
      ],
      offset: 4.1,
      compact: true,
    },
    {
      // Reads on the sofa; from stage 1 crosses to reception.
      id: 'E1',
      look: look(JACKET.navy, TROUSERS.stone, 3, HAIR.dark, { longHair: true, shirt: SHIRT.sky }),
      programs: [
        seat(['C', -2.2, 1.6], ['C', -2.2, 0.6], 'listen'),
        [
          walkHold(['C', -1.4, 0.4], 1.6, 1.0),
          go(['C', 2.95, 1.7], 4.4),
          go(['D', -2.95, 1.7], 2.0),
          seatAfterWalk(['D', 1.8, 1.75], 4.8, 4, ['D', 1.8, 0.8], 'talk'),
          go(['D', -2.95, 1.7], 4.8),
          go(['C', 2.95, 1.7], 2.0),
          walkHold(['C', -1.4, 0.4], 4.4, 1.0),
        ],
      ],
      offset: 0.4,
      compact: false,
    },

    /* ── Zone D: reception ───────────────────────────── */
    {
      // The host welcoming a new joiner (in lock-step with D2: both loops are 16.6s).
      id: 'D1',
      look: look(JACKET.navy, TROUSERS.navy, 5, HAIR.black, { longHair: true, shirt: SHIRT.white }),
      programs: [
        [
          hold(['D', 1.3, -0.5], 1.2, 'stand', ['D', 3.0, 0]),
          walkHold(['D', 1.75, 0.15], 1.3, 2.6, 'shake', ['D', 2.15, 0.1]),
          go(['D', 0.1, 0.55], 2.2),
          walkHold(['D', -0.9, 0.25], 1.4, 3.5, 'present', ['D', -1.8, -1.0]),
          walkHold(['D', 1.3, -0.5], 2.4, 2.0, 'stand', ['D', 3.0, 0]),
        ],
      ],
      offset: 0,
      compact: true,
    },
    {
      id: 'D2',
      look: look(JACKET.ivory, TROUSERS.ink, 1, HAIR.dark, { sleeves: JACKET.ivory, shirt: SHIRT.sky }),
      programs: [
        [
          hold(['D', 3.0, 0], 1.2),
          walkHold(['D', 2.15, 0.1], 1.3, 2.6, 'shake', ['D', 1.75, 0.15]),
          go(['D', 0.2, 1.0], 2.2),
          walkHold(['D', -1.0, 0.75], 1.4, 3.5, 'listen', ['D', -1.8, -1.0]),
          go(['D', 1.2, 1.3], 2.4),
          go(['D', 3.0, 0], 2.0),
        ],
      ],
      offset: 0,
      compact: true,
    },
    {
      // Mentor at the hot desks; a leader at the hub during stage 2.
      id: 'D3',
      look: look(JACKET.grey, TROUSERS.ink, 2, HAIR.grey, { shirt: SHIRT.white }),
      programs: [
        [hold(['D', -1.25, 0.05], 5, 'talk', ['D', -1.8, -0.43]), hold(['D', -1.25, 0.05], 4, 'point', ['D', -1.8, -1.1])],
        undefined,
        [walkHold(hubSeats.d, 4, 7, 'listen', HUB), hold(hubSeats.d, 4, 'talk', HUB)],
        [walkHold(['D', -1.25, 0.05], 4, 5, 'talk', ['D', -1.8, -0.43]), hold(['D', -1.25, 0.05], 4, 'point', ['D', -1.8, -1.1])],
      ],
      offset: 0.9,
      compact: false,
    },
    {
      id: 'D4',
      look: look(JACKET.sage, TROUSERS.slate, 4, HAIR.black),
      programs: [seat(['D', -1.8, -0.43], ['D', -1.8, -1.2], 'type')],
      offset: 1.4,
      compact: false,
    },
  ];
  return compact ? all.filter((c) => c.compact) : all;
}
