export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée."
    });
  }

  const { course } = req.body || {};

  if (!course || typeof course !== "string") {
    return res.status(400).json({
      error: "Veuillez fournir un cours."
    });
  }

  if (course.length > 12000) {
    return res.status(400).json({
      error: "Le cours est trop long. Réduisez-le."
    });
  }

  const prompt = `
Tu es SmartCours, un professeur patient.
Explique ce cours en français simple.
Organise ta réponse avec :
1. Une explication claire
2. Les notions importantes
3. Un résumé
4. Cinq questions pour vérifier la compréhension.

Cours :
${course}
`;

  const providers = [
    {
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      key: process.env.GEMINI_API_KEY,
      type: "gemini"
    },
    {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      type: "openrouter"
    }
  ];

  for (const provider of providers) {
    if (!provider.key) continue;

    try {
      let response;

      if (provider.type === "gemini") {
        response = await fetch(
          provider.url + "?key=" + provider.key,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          }
        );
      } else {
        response = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + provider.key,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openrouter/free",
            messages: [{
              role: "user",
              content: prompt
            }]
          })
        });
      }

      if (!response.ok) continue;

      const data = await response.json();

      const answer = provider.type === "gemini"
        ? data.candidates?.[0]?.content?.parts?.[0]?.text
        : data.choices?.[0]?.message?.content;

      if (answer) {
        return res.status(200).json({ answer });
      }
    } catch (error) {
      continue;
    }
  }

  return res.status(503).json({
    error: "Les services IA sont momentanément indisponibles. Réessaie plus tard."
  });
}
