(() => {
  const startQuizBtn = document.getElementById("startQuizBtn");
  const description = document.getElementById("Descprition");
  const categoriesContainer = document.getElementById("categories-container");
  const mcqContainer = document.getElementById("mcqForm");
  startQuizBtn.addEventListener("click", () => {
    if (description) {
      description.classList.add("hidden");
    }
    if (categoriesContainer) {
      categoriesContainer.classList.remove("hidden");
    }
  });

  const categoryNextBtn = document.getElementById("categoryNextBtn");
  const categorySelect = document.getElementById("options-select");

  let questions = [];
  let currentIndex = 0;
  let correctAnswer = "";
  let Score = 0;
  let countdown;
  const totalTime = 120; // in seconds
  // Decode HTML entities
  function decodeHTML(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  // Load a single question
  function loadQuestion() {
    const q = questions[currentIndex];
    const question = decodeHTML(q.question);
    const correct = decodeHTML(q.correct_answer);
    const incorrects = q.incorrect_answers.map(decodeHTML);

    correctAnswer = correct;

    const allOptions = [...incorrects, correct].sort(() => Math.random() - 0.5);

    document.getElementById("questionText").innerText = `Q${
      currentIndex + 1
    }. ${question}`;
    document.getElementById("labelA").innerText = allOptions[0];
    document.getElementById("labelB").innerText = allOptions[1];
    document.getElementById("labelC").innerText = allOptions[2];
    document.getElementById("labelD").innerText = allOptions[3];

    document.getElementById("optA").value = allOptions[0];
    document.getElementById("optB").value = allOptions[1];
    document.getElementById("optC").value = allOptions[2];
    document.getElementById("optD").value = allOptions[3];

    document
      .querySelectorAll('input[name="answer"]')
      .forEach((r) => (r.checked = false));
    document.getElementById("feedback").innerText = "";
  }
  categoryNextBtn.addEventListener("click", () => {
    const selectedCategory = categorySelect.value;
    categoriesContainer.classList.add("hidden");
    mcqContainer.classList.remove("hidden");

    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }

    const categoryMap = {
      "General Knowledge": 9,
      "Entertainment: Books": 10,
      "Entertainment: Board Games": 16,
      "Science & Nature": 17,
      "Science: Computers": 18,
      "Science: Mathematics": 19,
      Mythology: 20,
      Sports: 21,
      Geography: 22,
      History: 23,
      Politics: 24,
      Art: 25,
      Animals: 27,
      Vehicles: 28,
      "Science: Gadgets": 30,
    };

    const selectedCategoryName = selectedCategory;
    const categoryId = categoryMap[selectedCategoryName];

    if (!categoryId) {
      alert("Invalid category selected.");
      return;
    }

    // 🔁 Send message to background
    window.postMessage(
      {
        type: "FETCH_TRIVIA",
        categoryId: categoryId,
      },
      "*"
    );

    // ✅ Listen for response
    const handleMessage = (event) => {
      if (event.source !== window) return;

      if (event.data.type === "TRIVIA_RESPONSE") {
        if (event.data.questions.length > 0) {
          console.log("✅ Questions received:", event.data.questions);
          questions = event.data.questions;
          loadQuestion();
          // Call your function here, e.g. loadQuestions(event.data.questions);
        } else {
          alert("❌ Failed to load quiz. Please try again!");
          console.error("Error fetching trivia:", event.data.error);
          categoriesContainer.classList.remove("hidden");
          mcqContainer.classList.add("hidden");
          document.getElementById("mcqForm").reset?.();
          document.getElementById("feedback").innerText = "";
        }

        // Remove listener after handling
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);
  });

  document.getElementById("mcqForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const selected = document.querySelector('input[name="answer"]:checked');
    const feedback = document.getElementById("feedback");
    const submitBtn = document.getElementById("submitBtn");

    if (!selected) {
      feedback.innerText = "❗ Please select an answer.";
      return;
    }

    submitBtn.disabled = true; // Disable after one click

    const isCorrect = selected.value === correctAnswer;
    if (isCorrect) {
      Score++;
    }

    feedback.innerHTML = `
    Correct answer: <strong>${correctAnswer}</strong><br>
    ${isCorrect ? "✅ Correct!" : "❌ Incorrect!"}
  `;

    // Delay loading the next question so user can see feedback
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < questions.length) {
        loadQuestion();
        submitBtn.disabled = false; // Re-enable for next question
      }

      // Timer logic at quiz end if score < 2
      if (Score < 2 && currentIndex === questions.length) {
        mcqContainer.classList.add("hidden");
        document.getElementById("postQuizTimer").style.display = "block";
        startEndTimer();
      }

      if (Score >= 2) {
        window.postMessage(
          {
            type: "UNLOCK_SCROLL",
          },
          "*"
        );
      }
    }, 2000); // 2-second delay
  });

  function startEndTimer() {
    let timeLeft = totalTime;
    const timerDisplay = document.getElementById("timer");

    countdown = setInterval(() => {
      const min = Math.floor(timeLeft / 60);
      const sec = timeLeft % 60;
      timerDisplay.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;

      if (timeLeft === 0) {
        window.postMessage(
          {
            type: "UNLOCK_SCROLL",
          },
          "*"
        );
      }

      timeLeft--;
    }, 1000);
  }
})();
