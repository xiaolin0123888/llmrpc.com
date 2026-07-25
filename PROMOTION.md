# llmrpc.com — Promotion Content
## Target: Overseas individual developers (欧美个人开发者)

---

## 1. Hacker News — Show HN

**Title:** Show HN: LLMRpc — One API key for 100+ AI models, OpenAI-compatible

**Text:**
I built LLMRpc after getting tired of managing 6 different API keys and billing dashboards. It's an OpenAI-compatible API gateway — drop it into any OpenAI client by changing the base URL.

What it does:
- 100+ models behind one endpoint (GPT-5.5, Claude Opus 4.7, Gemini 3.5, DeepSeek V3/R2, Qwen, GLM, Mistral, etc.)
- Fully OpenAI-compatible — works with any existing SDK or tool
- Prepaid credits + monthly subscription plans
- 1M free tokens on signup, no credit card
- Same rate limits and spending controls per API key

Why I built this:
OpenRouter is great but I wanted something simpler — no crypto, no confusing credit math. Just a clean dashboard, predictable pricing, and a straightforward API.

Tech stack: Next.js 15, TypeScript, PostgreSQL, Stripe + PayPal billing.

Would love feedback from the HN crowd — what would make you switch from your current provider?

URL: https://llmrpc.com
Docs: https://llmrpc.com/docs

---

## 2. Reddit — r/LocalLLaMA

**Title:** I built an OpenRouter alternative — 100+ models, one API key, 1M free tokens

**Post:**
Been working on this for a few months and finally ready to share: [llmrpc.com](https://llmrpc.com)

**What it is:**
An OpenAI-compatible API gateway. Same `v1/chat/completions` endpoint, just swap the base URL and API key. Works with any OpenAI SDK, LangChain, LiteLLM, etc.

**Models available:**
- GPT-5.5, GPT-4o, GPT-4o Mini
- Claude Opus 4.7, Sonnet 4.6, Haiku 4.5
- Gemini 3.5, 2.5 Pro, 2.5 Flash
- DeepSeek V3, DeepSeek R2
- Qwen3, QwQ-32B
- GLM-5, Mistral Medium 3.5
- Yi Lightning, Yi Large
- +90 more

**Pricing:**
- Free: 500K tokens/month
- Basic: $9.99/mo (500K)
- Pro: $49/mo (20M)
- Enterprise: $99/mo (50M)
- Unlimited: $199/mo
- Pay-as-you-go credits also available

**Why not just use OpenRouter?**
- Simpler pricing — no confusing credit multipliers per model
- Cleaner dashboard
- 1M free tokens on signup (no credit card needed)
- Built by a solo dev, ship fixes fast

Happy to answer questions. Been dogfooding it myself for a month.

---

## 3. Reddit — r/OpenAI / r/SaaS

**Title:** Tired of managing 5 different AI API keys? I built a unified gateway

**Post:**
If you're building with AI, you've probably got API keys scattered across OpenAI, Anthropic, Google, and DeepSeek. Different billing cycles, different rate limits, different SDK quirks.

I built [llmrpc.com](https://llmrpc.com) to solve this — it's a drop-in OpenAI-compatible gateway that gives you access to 100+ models through a single API key.

**The pitch:**
- Change one line of code (the base URL) → access every model
- One billing dashboard, one set of rate limits
- Prepaid credits — no surprise bills
- 1M free tokens to test everything
- Full OpenAI SDK compatibility

**Who it's for:**
Indie hackers shipping AI features, developers prototyping with multiple models, anyone who wants to stop juggling API keys.

Been running it in production for my own projects. Would love feedback from other builders.

---

## 4. Reddit — r/SideProject

**Title:** My side project hit production: LLMRpc — unified API for 100+ AI models

**Post:**
Three months ago I started building an AI API gateway as a side project. Today it's live and handling real traffic.

**Stack:** Next.js 15, TypeScript, PostgreSQL, Prisma, Stripe + PayPal, Nginx

**What I learned:**
- Billing is HARD. Prepaid credits + overage calculations + concurrent requests = many edge cases
- OpenAI compatibility is underrated — being a drop-in replacement gets you instant ecosystem support
- Rate limiting at the API gateway level matters way more than I expected

**What's next:**
- Streaming support optimization
- More provider integrations
- CLI tool for key management

Would love feedback from the side project community. What features would make you try it?

---

## 5. Twitter/X — Thread

**Tweet 1:**
Tired of managing 5 different AI API keys? 

I built LLMRpc — one API key, 100+ models, OpenAI-compatible.

Change exactly one line of code:
`base_url = "https://llmrpc.com/v1"`

1M free tokens on signup. 🧵

**Tweet 2:**
Models available right now:
• GPT-5.5, Claude Opus 4.7, Gemini 3.5
• DeepSeek V3, DeepSeek R2
• Qwen3, GLM-5, Mistral
• 100+ more

All behind the same endpoint. Switch models by changing one string.

**Tweet 3:**
Pricing (USD/month):
Free — 500K tokens
Basic — $9.99 (500K)
Pro — $49 (20M)
Enterprise — $99 (50M)
Unlimited — $199

Or just buy prepaid credits. No surprise bills.

**Tweet 4:**
Built by a solo dev. Next.js + TypeScript + PostgreSQL. Stripe & PayPal billing. 

Been dogfooding it in production for a month. Fast fixes, real support.

Check it out: llmrpc.com

---

## 6. GitHub Repo Description

**README snippet:**
```markdown
# LLMRpc — One API Key, Every AI Model

OpenAI-compatible API gateway for 100+ AI models.

curl https://llmrpc.com/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -d '{"model":"gpt-5.5","messages":[{"role":"user","content":"Hello"}]}'

## Quick Links
- Website: https://llmrpc.com
- Docs: https://llmrpc.com/docs
- Sign up (1M free tokens): https://llmrpc.com/register
```

---

## Posting Order (Recommendation)

1. **First:** Reddit r/LocalLLaMA — highest concentration of target users
2. **Same day:** Hacker News Show HN — need to time for morning US Eastern
3. **Day 2:** Reddit r/OpenAI + r/SaaS
4. **Day 3:** Twitter thread
5. **Weekend:** r/SideProject (weekend projects thread)
6. **Ongoing:** Reply to relevant comments, engage with feedback

**Pro tip for HN/Reddit:** Don't post all at once. Space them out. Reply to every comment in the first 2 hours — it drives engagement ranking.
