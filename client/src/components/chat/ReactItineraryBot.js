import React, { useMemo, useState } from 'react';
import ChatBot from 'react-chatbotify';

// Client-side itinerary planner using react-chatbotify (no backend needed)
// Collects basic preferences and returns a simple day-wise plan.

// Heuristics
const parseDaysFromText = (text = '') => {
  const m = String(text).match(/(\d{1,2})\s*(day|days|d)\b/i);
  if (m) return parseInt(m[1], 10);
  const n = parseInt(text, 10);
  return Number.isFinite(n) ? n : undefined;
};

const parseDestinationFromText = (text = '') => {
  const trimmed = String(text).trim();
  // If only a number, that's not a destination
  if (/^\d+\s*(day|days|d)?$/i.test(trimmed)) return undefined;
  return trimmed || undefined;
};

const ensureMemory = (params) => {
  if (!params.memory || typeof params.memory !== 'object') {
    params.memory = {};
  }
  return params.memory;
};

const generatePlan = ({ destination, days, interests, budget, travelStyle }) => {
  const safeDestination = destination || 'Jharkhand';
  const parsedDays = parseInt(days, 10);
  const totalDays = Number.isFinite(parsedDays)
    ? Math.min(Math.max(parsedDays, 1), 10)
    : 3;
  const style = travelStyle || (budget && Number(budget) > 20000 ? 'comfort' : 'budget');
  const interestList = (interests || '').split(/,|\n/).map(s => s.trim()).filter(Boolean);

  const suggestionsPool = [
    'local markets and handicrafts',
    'waterfalls and scenic viewpoints',
    'temples and heritage sites',
    'nature walks and parks',
    'local cuisine tasting',
    'tribal culture experiences',
    'sunrise/sunset point',
    'nearby day trip'
  ];

  const pick = (i) => suggestionsPool[i % suggestionsPool.length];

  const daysPlan = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    morning: `Explore ${pick(i)} in ${safeDestination}.`,
    afternoon: `Visit ${pick(i + 1)}; try regional lunch.`,
    evening: `Relax at ${pick(i + 2)}; sample street food.`
  }));

  const tips = [
    'Carry ID and keep some cash handy.',
    'Check local weather before outdoor plans.',
    'Prefer licensed guides and registered transport.',
    'Respect local customs and eco-rules.'
  ];

  return {
    destination: safeDestination,
    days: totalDays,
    travelStyle: style,
    interests: interestList,
    budget: budget ? `Approx ₹${budget}` : 'Flexible',
    plan: daysPlan,
    tips
  };
};

const ReactItineraryBot = ({ botName = 'Itinerary Planner' }) => {
  const [open, setOpen] = useState(false);

  const theme = useMemo(() => ({
    header: { backgroundColor: '#0ea5e9', color: '#ffffff' },
    chatWindow: { backgroundColor: '#ffffff' },
    userMessage: { backgroundColor: '#10b981', color: '#ffffff' },
    botMessage: { backgroundColor: '#f3f4f6', color: '#111827' }
  }), []);

  const settings = useMemo(() => ({
    general: { embedded: true, showHeader: false, showFooter: false },
    chatButton: { position: 'bottom-right' },
    voice: { disabled: true }
  }), []);

  const flow = useMemo(() => ({
    start: {
      message: `Hi! I'm ${botName}. I will plan your trip. First, which place should I plan for? (e.g., Ranchi, Netarhat, Deoghar)`,
      path: 'get_destination'
    },
    // Keep alias in case flow directs here later
    ask_destination: { message: 'Which place should I plan for?', path: 'get_destination' },
    get_destination: {
      user: true,
      path: async (params) => {
        ensureMemory(params);
        // If user gave days first (e.g., "2 days"), capture and ask destination again
        const daysMaybe = parseDaysFromText(params.userInput);
        const placeMaybe = parseDestinationFromText(params.userInput);
        if (daysMaybe && !placeMaybe) {
          params.memory.days = daysMaybe;
          return 'ask_destination_only';
        }
        params.memory.destination = placeMaybe || params.userInput;
        // If we already have days, go for budget next
        if (params.memory.days) return 'ask_budget';
        return 'ask_days';
      }
    },
    // simplified flow: collect interests/budget/style after destination+days
    ask_destination_only: {
      message: 'Great! Which destination? (e.g., Ranchi, Netarhat, Deoghar)',
      path: 'get_destination_only'
    },
    get_destination_only: {
      user: true,
      path: async (params) => {
        ensureMemory(params);
        try {
          params.memory.destination = parseDestinationFromText(params.userInput) || params.userInput;
          // If days already captured earlier, proceed to interests; otherwise ask interests or days
          return params.memory.days ? 'ask_interests' : 'ask_interests_or_days';
        } catch (_) {
          return 'ask_destination_only';
        }
      }
    },
    // Simplify: only days then budget
    ask_days: { message: 'How many days? (1-10)', path: 'get_days' },
    get_days: {
      user: true,
      path: async (params) => {
        ensureMemory(params);
        // If user typed a place here, swap steps gracefully
        const place = parseDestinationFromText(params.userInput);
        if (place && !/^\d/.test(params.userInput)) {
          params.memory.destination = place;
          return 'ask_interests';
        }
        const n = parseDaysFromText(params.userInput);
        if (!Number.isFinite(n) || n < 1 || n > 10) {
          return 'ask_days_invalid';
        }
        params.memory.days = n;
        // After days, proceed to budget
        return 'ask_budget';
      }
    },
    ask_days_invalid: {
      message: 'Please enter a number of days between 1 and 10 (e.g., 3).',
      path: 'get_days'
    },
    ask_budget: { message: 'What is your approximate budget in ₹?', path: 'get_budget' },
    get_budget: {
      user: true,
      path: async (params) => {
        ensureMemory(params);
        params.memory.budget = params.userInput;
        return 'show_plan';
      }
    },
    // Style step removed for simplicity per requirement
    show_plan: {
      message: async ({ memory }) => {
        try {
          const data = generatePlan(memory);
          const lines = [
          `Plan for ${data.destination} (${data.days} days, ${data.travelStyle})`,
          data.interests?.length ? `Interests: ${data.interests.join(', ')}` : undefined,
          data.budget ? `Budget: ${data.budget}` : undefined,
          '',
          ...data.plan.map(d => `Day ${d.day}:\n- Morning: ${d.morning}\n- Afternoon: ${d.afternoon}\n- Evening: ${d.evening}`),
          '',
          `Tips: ${data.tips.join(' | ')}`
        ].filter(Boolean).join('\n');
          return lines;
        } catch (err) {
          console.error('Itinerary plan error:', err);
          return 'Sorry, I could not generate the plan. Please re-enter days as a number between 1 and 10 and try again.';
        }
      },
      path: 'restart_or_end'
    },
    // removed quick generation; always gather details then show_plan
    restart_or_end: {
      message: 'Would you like to plan another trip? (yes/no)',
      path: 'restart_choice'
    },
    restart_choice: {
      user: true,
      path: async ({ userInput }) => (/^y(es)?$/i.test(userInput) ? 'ask_destination' : 'end')
    },
    end: { message: 'Happy travels! You can reopen me anytime from the icon.', path: 'end' }
  }), [botName]);

  return (
    <>
      {open ? (
        <div className="fixed bottom-6 left-6 z-50 w-80 md:w-96 shadow-2xl">
          <div className="rounded-t-xl px-4 py-3 text-white flex items-center justify-between" style={{ background: 'linear-gradient(90deg, #22c55e, #14b8a6)' }}>
            <div className="font-semibold">{botName}</div>
            <button aria-label="Minimize itinerary bot" className="text-white/90 hover:text-white text-xl leading-none" onClick={() => setOpen(false)}>×</button>
          </div>
          <ChatBot theme={theme} settings={settings} flow={flow} />
        </div>
      ) : (
        <button
          aria-label="Open itinerary planner"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-emerald-600 text-white shadow-lg hover:scale-105 transition-transform duration-150 flex items-center justify-center animate-bounce"
        >
          🧭
        </button>
      )}
    </>
  );
};

export default ReactItineraryBot;


