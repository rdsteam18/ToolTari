export interface Env {
  FIREBASE_PROJECT_ID: string;
  TOOLTARI_KV: KVNamespace;
  GEMINI_API_KEY?: string;
  NVIDIA_API_KEY?: string;
  OPENAI_API_KEY?: string;
}

export const dbService = {
  /**
   * Write an analytics record of tool execution to Firestore using REST
   */
  async saveAnalytics(env: Env, toolId: string, success: boolean, executionTimeMs: number): Promise<void> {
    const projectId = env.FIREBASE_PROJECT_ID;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/analytics`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            toolId: { stringValue: toolId },
            success: { booleanValue: success },
            executionTimeMs: { integerValue: String(executionTimeMs) },
            timestamp: { timestampValue: new Date().toISOString() }
          }
        })
      });

      if (!response.ok) {
        console.error('Firestore saveAnalytics HTTP Error:', await response.text());
      }
    } catch (err) {
      console.error('Firestore saveAnalytics Exception:', err);
    }
  },

  /**
   * Log worker/tool execution error to Firestore using REST
   */
  async logError(env: Env, toolId: string, errorMsg: string): Promise<void> {
    const projectId = env.FIREBASE_PROJECT_ID;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/errors`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            toolId: { stringValue: toolId },
            errorMessage: { stringValue: errorMsg },
            timestamp: { timestampValue: new Date().toISOString() }
          }
        })
      });

      if (!response.ok) {
        console.error('Firestore logError HTTP Error:', await response.text());
      }
    } catch (err) {
      console.error('Firestore logError Exception:', err);
    }
  },

  /**
   * Fetch a feature flag value (checks KV first for speed/cache, then falls back to Firestore)
   */
  async getFeatureFlag(env: Env, flagName: string): Promise<boolean> {
    // 1. Check KV Cache first
    const cached = await env.TOOLTARI_KV.get(`flag:${flagName}`);
    if (cached !== null) {
      return cached === 'true';
    }

    // 2. Fallback to Firestore REST API
    const projectId = env.FIREBASE_PROJECT_ID;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/flags/${flagName}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return false;
      }
      
      const doc = (await response.json()) as any;
      const value = doc?.fields?.enabled?.booleanValue || false;
      
      // Store in KV cache for 5 minutes (300 seconds) to avoid Firestore read limits
      await env.TOOLTARI_KV.put(`flag:${flagName}`, String(value), { expirationTtl: 300 });
      return value;
    } catch (err) {
      console.error('Firestore getFeatureFlag Exception:', err);
      return false;
    }
  }
};
