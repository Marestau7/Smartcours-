const generateButton = document.getElementById("generate");
const courseInput = document.getElementById("course");
const result = document.getElementById("result");
const quizArea = document.getElementById("quiz-area");

generateButton.addEventListener("click", async function () {
  const course = courseInput.value.trim();

  if (!course) {
    result.textContent = "⚠️ Colle d'abord ton cours.";
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "Préparation en cours...";
  result.textContent = "SmartCours prépare ton explication...";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ course })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Une erreur est survenue.");
    }

    result.textContent = data.answer;
    quizArea.textContent = "Ton explication est prête. Le quiz sera ajouté ensuite.";

  } catch (error) {
    result.textContent = "Impossible de contacter SmartCours : " + error.message;
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "Générer mon explication";
  }
});