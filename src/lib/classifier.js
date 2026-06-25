// src/lib/classifier.js
// AI Lead Classification
// Uses rule-based logic by default.
// Set VITE_GEMINI_API_KEY to enable Gemini AI classification.

const RULES = [
  {
    pattern: /chatbot|ai agent|automation|ml|machine learning|nlp|gpt|llm|openai|gemini/i,
    category: 'AI Automation',
    priority: 'High',
  },
  {
    pattern: /mobile app|flutter|react native|android|ios|swift|kotlin/i,
    category: 'Mobile Development',
    priority: 'High',
  },
  {
    pattern: /website|landing page|web app|frontend|react|vue|nextjs|wordpress|ui\/ux/i,
    category: 'Web Development',
    priority: 'Medium',
  },
  {
    pattern: /seo|digital marketing|social media|content|ads|ppc|google ads/i,
    category: 'Digital Marketing',
    priority: 'Medium',
  },
  {
    pattern: /crm|erp|backend|api|database|microservices|devops|cloud|aws|azure/i,
    category: 'Backend / Integration',
    priority: 'High',
  },
  {
    pattern: /ecommerce|shopify|woocommerce|store|product listing|payment/i,
    category: 'E-Commerce',
    priority: 'High',
  },
  {
    pattern: /logo|branding|graphic design|banner|poster|illustration/i,
    category: 'Design',
    priority: 'Low',
  },
  {
    pattern: /cybersecurity|penetration test|security audit|ssl|compliance/i,
    category: 'Cybersecurity',
    priority: 'High',
  },
]

/**
 * Rule-based classifier — instant, no API call needed.
 * @param {string} requirement
 * @returns {{ category: string, priority: string }}
 */
export function classifyRuleBased(requirement) {
  for (const rule of RULES) {
    if (rule.pattern.test(requirement)) {
      return { category: rule.category, priority: rule.priority }
    }
  }
  return { category: 'General Inquiry', priority: 'Low' }
}

/**
 * Gemini AI classifier — richer understanding of complex requirements.
 * Falls back to rule-based if API key is missing or request fails.
 * @param {string} requirement
 * @returns {Promise<{ category: string, priority: string }>}
 */
export async function classifyWithGemini(requirement) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return classifyRuleBased(requirement)

  try {
    const prompt = `You are a business lead classifier. Analyze the following client requirement and return ONLY valid JSON with two fields: "category" (one of: AI Automation, Mobile Development, Web Development, Digital Marketing, Backend / Integration, E-Commerce, Design, Cybersecurity, General Inquiry) and "priority" (one of: High, Medium, Low).

Requirement: "${requirement}"

Respond with only JSON, no markdown, no explanation.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!res.ok) throw new Error('Gemini API error')
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(text.trim())

    if (parsed.category && parsed.priority) {
      return { category: parsed.category, priority: parsed.priority }
    }
    throw new Error('Invalid response shape')
  } catch (err) {
    console.warn('Gemini classification failed, falling back to rules:', err)
    return classifyRuleBased(requirement)
  }
}

/**
 * Main classify function — uses Gemini if key is set, else rule-based.
 */
export async function classify(requirement) {
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return classifyWithGemini(requirement)
  }
  return classifyRuleBased(requirement)
}
