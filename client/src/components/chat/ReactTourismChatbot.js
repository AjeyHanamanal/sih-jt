import React, { useMemo, useState } from 'react';
import ChatBot from 'react-chatbotify';

// Lightweight, client-side chatbot using react-chatbotify
// No backend required. You can later replace `getAnswer` with an API call.

const faqData = [
  {
    intent: /best time|when to visit|season/i,
    answer: 'The best time to visit Jharkhand is October to March for pleasant weather. Monsoons (July–September) are lush but expect rains.'
  },
  {
    intent: /popular|famous|top places|destinations/i,
    answer: 'Popular places: Ranchi (Dassam Falls, Patratu Valley), Netarhat, Deoghar (Baidyanath Temple), Betla National Park, Hundru Falls, Parasnath Hill.'
  },
  {
    intent: /how to reach|reach ranchi|transport|route/i,
    answer: 'Ranchi is well-connected by air (IXR), rail (RNC), and road. Regular trains from major cities. Taxis and buses available locally.'
  },
  {
    intent: /tribal|culture|handicraft|festival/i,
    answer: 'Jharkhand has rich tribal culture (Santhal, Munda, Oraon). Handicrafts include bamboo, dokra, and textiles. Notable festivals: Karam, Sarhul, Sohrai.'
  },
  {
    intent: /eco|park|wildlife|safari/i,
    answer: 'Try Betla National Park (Palamu Tiger Reserve), Dalma Wildlife Sanctuary, and scenic treks around Netarhat and Parasnath.'
  },
  {
    intent: /hotel|stay|accommodation/i,
    answer: 'Ranchi, Netarhat, and Deoghar offer hotels across budgets. Use trusted platforms or official Jharkhand Tourism links for bookings.'
  },
  {
    intent: /safety|tips|advice/i,
    answer: 'Carry ID, check local weather, prefer licensed guides, keep emergency numbers handy, and respect local customs and wildlife rules.'
  }
];

const getAnswer = (text) => {
  if (!text) return null;
  for (const { intent, answer } of faqData) {
    if (intent.test(text)) return answer;
  }
  return null;
};

const ReactTourismChatbot = ({ botName = 'Tourism Assistant' }) => {
  const [open, setOpen] = useState(false);

  const theme = useMemo(() => ({
    header: {
      backgroundColor: '#0ea5e9',
      color: '#ffffff'
    },
    chatWindow: {
      backgroundColor: '#ffffff'
    },
    userMessage: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    botMessage: {
      backgroundColor: '#f3f4f6',
      color: '#111827'
    }
  }), []);

  const flow = useMemo(() => ({
    start: {
      message: `Hi! I'm ${botName}. Ask about places, routes, best times, or tips.`,
      path: 'loop'
    },
    loop: {
      message: async ({ userInput }) => {
        const ans = getAnswer(userInput || '');
        if (ans) return ans;
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 20000);
          const res = await fetch('/api/ai/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput }),
            signal: controller.signal
          });
          clearTimeout(id);
          const data = await res.json();
          if (data?.status === 'success') {
            return data?.data?.response || 'Sorry, I could not find an answer.';
          }
          throw new Error(data?.message || 'Request failed');
        } catch (err) {
          console.error('Chat backend error:', err);
          return "I'm having trouble reaching the server. Try again, or ask about: popular places, best time to visit, tribal culture, travel routes.";
        }
      },
      path: 'loop'
    }
  }), []);

  const settings = useMemo(() => ({
    general: {
      embedded: true,
      showHeader: false,
      showFooter: false
    },
    chatButton: {
      position: 'bottom-right'
    },
    voice: {
      disabled: true
    }
  }), []);

  return (
    <>
      {open ? (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 shadow-2xl">
          <div className="rounded-t-xl px-4 py-3 text-white flex items-center justify-between" style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}>
            <div className="font-semibold">{botName}</div>
            <button aria-label="Minimize chatbot" className="text-white/90 hover:text-white text-xl leading-none" onClick={() => setOpen(false)}>×</button>
          </div>
          <ChatBot theme={theme} settings={settings} flow={flow} />
          <div className="text-[11px] text-gray-400 mt-1 text-right pr-2">{botName}</div>
        </div>
      ) : (
        <button
          aria-label="Open chatbot"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary-600 text-white shadow-lg hover:scale-105 transition-transform duration-150 flex items-center justify-center animate-bounce"
        >
          <span role="img" aria-label="robot">🤖</span>
        </button>
      )}
    </>
  );
};

export default ReactTourismChatbot;


