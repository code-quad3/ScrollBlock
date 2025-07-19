// Core logic for unlock card and MCQ

document.getElementById('unlockBtn').addEventListener('click', function() {
  document.getElementById('blurred-bg').style.display = "none";
  document.getElementById('unlock-card').style.display = "none";
  // Optionally, call your unlock logic here, e.g.:
  // unlockScroll();
});


// --- MCQ Support ---
// Provide a function to inject MCQ into the card

function showMCQ(question, options, correctIndex, onAnswer) {
  const mcqContainer = document.getElementById('mcq-container');
  mcqContainer.innerHTML = ''; // Clear previous

  // Question
  const q = document.createElement('div');
  q.className = 'mcq-question';
  q.textContent = question;
  mcqContainer.appendChild(q);

  // Options
  const optsDiv = document.createElement('div');
  optsDiv.className = 'mcq-options';

  options.forEach((opt, idx) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'mcq';
    radio.value = idx;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + opt));
    optsDiv.appendChild(label);
  });
  mcqContainer.appendChild(optsDiv);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit';
  submitBtn.className = 'unlock-btn';
  submitBtn.style.marginTop = '10px';
  mcqContainer.appendChild(submitBtn);

  submitBtn.onclick = () => {
    const checked = optsDiv.querySelector('input[name="mcq"]:checked');
    if (!checked) {
      alert("Please select an option!");
      return;
    }
    const selected = parseInt(checked.value, 10);
    // Show feedback
    if (selected === correctIndex) {
      onAnswer(true);
    } else {
      onAnswer(false);
    }
  };
}

// Example usage:
// showMCQ(
//   "What is the capital of France?",
//   ["Berlin", "Paris", "London", "Madrid"],
//   1,
//   (isCorrect) => {
//     alert(isCorrect ? "Correct!" : "Wrong. Try again!");
//   }
// );

// To use this in your extension, just call showMCQ() with your MCQ data when needed.