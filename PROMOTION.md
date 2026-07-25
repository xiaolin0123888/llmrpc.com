# llmrpc.com — Promotion Content (Honest)
## Target: Overseas individual developers

---

## 1. Hacker News — Show HN

**Title:** Show HN: LLMRpc — OpenRouter alternative, same models, cheaper, monthly plans

**Text:**
I built LLMRpc because I wanted an OpenRouter-like API gateway but simpler — no crypto, no per-model credit multipliers, just straightforward pricing.

What it is:
- OpenAI-compatible API endpoint. Same `v1/chat/completions`, swap the base URL
- Same models as OpenRouter: deepseek-v4-pro, deepseek-v4-flash, glm-5.1, glm-5.2, plus 100+ more via SiliconFlow
- $0.02/1K input on budget models, $0.15/1K on flagship
- Monthly plans: Free → $9.99 → $49 → $99 → $199/mo with token quotas
- 1M free credits on signup, no credit card
- PayPal for credits and subscriptions

Why I built this:
OpenRouter is great but complex. I wanted something where 1 credit = 1 token on every model, with monthly plans for predictable spending. This is for indie devs who just want to ship.

Stack: Next.js 15, TypeScript, PostgreSQL, PayPal billing.

Would love HN feedback — what would make you switch from your current API provider?

URL: https://llmrpc.com
Docs: https://llmrpc.com/docs

---

## 2. Reddit — r/LocalLLaMA

**Title:** I built an OpenRouter competitor — same models, cheaper, 1M free credits

**Post:**
Hi r/LocalLLaMA — been working on this for a few months: [llmrpc.com](https://llmrpc.com)

**What it is:**
An OpenAI-compatible API gateway. Works with any OpenAI SDK, LangChain, LiteLLM, etc. Drop-in replacement — just change the base URL and API key.

**Models available (same upstream names as OpenRouter):**
- deepseek-v4-pro (flagship)
- deepseek-v4-reason (deep reasoning)
- deepseek-v4-flash (fast + cheap)
- glm-5.1, glm-5.2
- deepseek-chat, qwen-turbo
- +90 more via SiliconFlow

**Pricing (per 1M tokens, 70/30 mix):**
- deepseek-v4-flash: $0.23
- glm-5.2: $0.31
- deepseek-v4-pro: $2.55

**Monthly plans:**
Free (500K) → Basic $9.99 (500K) → Pro $49 (20M) → Enterprise $99 (50M) → Unlimited $199

**Why this over OpenRouter:**
- 1 credit = 1 token on every model. No per-model multipliers
- 1M free credits on signup (OpenRouter gives $1)
- Monthly plans for predictable billing (OpenRouter doesn't have them)
- PayPal payments — no crypto needed
- 500K referral bonus

Built by a solo dev. Dogfooding for a month. Happy to answer questions.

---

## 3. Reddit — r/SaaS

**Title:** If you're building AI features, stop managing 5 API keys

**Post:**
Your AI-powered SaaS probably talks to multiple model providers. Each one needs its own API key, billing dashboard, and rate limit config. It's a mess.

I built [llmrpc.com](https://llmrpc.com) to fix this.

**One API key → all models:**
- Same OpenAI-compatible endpoint
- Works with any existing SDK
- Switch models by changing one string in your code
- One billing dashboard for everything

**Scale-friendly pricing:**
- $0.02/1K tokens on budget models
- Monthly plans for predictable costs
- Prepaid credits for flexibility
- No per-model markups or multipliers

**For indie devs shipping fast:**
- 1M free credits on signup (no card required)
- 500K referral bonus per person you invite
- Clean dashboard, real-time usage tracking
- PayPal for payments

Built by a solo dev who got tired of spreadsheets. Would love feedback from other SaaS builders.

---

## 4. Reddit — r/SideProject

**Title:** My side project: LLMRpc — unified API gateway for AI models

**Post:**
Started this as a side project. Today it's live and serving real traffic: [llmrpc.com](https://llmrpc.com)

**What I built:**
An AI API gateway — one API key for 100+ models. Drop-in OpenAI compatible.

**Stack:** Next.js 15, TypeScript, PostgreSQL, Prisma, PayPal, Nginx

**Things I learned building this:**
- Billing is the hardest part. Prepaid credits + overage + concurrent requests = many edge cases. Transaction-level advisory locks to prevent undercharging
- Being OpenAI-compatible gives you instant ecosystem support — works with every SDK and tool
- Rate limiting and spending controls at the gateway level matter way more than I expected
- PayPal subscription webhooks are surprisingly straightforward

**What's next:**
- Streaming support
- More provider integrations
- CLI tool

Feedback welcome from the side project community!

---

## 5. Twitter/X — Thread

**Tweet 1:**
I built an OpenRouter alternative — same models, cheaper prices, monthly plans.

1 API key. 100+ models. OpenAI-compatible.

1M free credits on signup. No credit card.

llmrpc.com 🧵

**Tweet 2:**
Models available (same names as OpenRouter):
• deepseek-v4-pro — $0.15/1K input
• deepseek-v4-flash — $0.02/1K input
• deepseek-v4-reason — $0.10/1K input
• glm-5.1, glm-5.2
• deepseek-chat, qwen-turbo

+90 more. One endpoint.

**Tweet 3:**
Monthly plans with token quotas:
Free — 500K/mo
Basic — $9.99/mo (500K)
Pro — $49/mo (20M)
Enterprise — $99/mo (50M)
Unlimited — $199/mo

Or prepaid credits. PayPal.

**Tweet 4:**
Why LLMRpc over OpenRouter:
• 1 credit = 1 token — no per-model multipliers
• Monthly plans — predictable billing
• 1M free credits (OpenRouter: $1)
• 500K referral bonus
• PayPal — no crypto

Try it: llmrpc.com

---

## 6. GitHub README

```markdown
# LLMRpc — One API Key, Every AI Model

OpenAI-compatible API gateway. Same models as OpenRouter, cheaper prices, monthly plans.

## Quick Start

curl https://llmrpc.com/v1/chat/completions \
  -H "Authorization: Bearer $LLMRPC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"Hello!"}]}'

## Why LLMRpc

- Same model names as OpenRouter — no confusing aliases
- 1 credit = 1 token on every model — no per-model multipliers
- Monthly plans with token quotas — predictable billing
- 1M free credits on signup — no credit card
- 500K referral bonus per invite
- PayPal for credits and subscriptions

## Links
- Website: https://llmrpc.com
- Docs: https://llmrpc.com/docs
- Sign up: https://llmrpc.com/register
```

---

## Posting Order

1. **Reddit r/LocalLLaMA** — highest density of target users. Post during US morning
2. **Hacker News Show HN** — same day, timing matters. Post around 8-10am ET
3. **Reddit r/SaaS** — day 2
4. **Twitter/X thread** — day 2 or 3, tag @OpenRouter and relevant accounts
5. **Reddit r/SideProject** — weekend

**For each post:** Reply to every comment in the first 2 hours. It drives ranking. Be honest about what you built — indie devs respect transparency more than marketing fluff.
