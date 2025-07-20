const startQuizBtn = document.getElementById("startQuizBtn");
const description = document.getElementById("Descprition");
const categoriesContainer = document.getElementById("categories-container");

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

categoryNextBtn.addEventListener("click", () => {
  const selectedCategory = categorySelect.value;

  if (!selectedCategory) {
    alert("Please select a category first.");
    return;
  }

  //const jsonUrl = browser.runtime.getURL("category-id.json");

  fetch("./category-id.json")
    .then(response => response.json())
    .then(data => {
      console.log("Category map:", data);

      const selectedCategoryName = selectedCategory;
      const categoryId = data[selectedCategoryName];

      if (!categoryId) {
        alert("Invalid category selected.");
        return;
      }

      const apiUrl = `https://opentdb.com/api.php?amount=3&category=${categoryId}&type=multiple`;

      fetch(apiUrl, {
        method: 'GET'
        // No headers object needed for simple GET requests
      })
      .then(response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        // Your code to unlock the card or display data
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    }); // <--- This closing brace was missing!
});





document.getElementById("mcqForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const answer = document.querySelector('input[name="q1"]:checked');

  if (answer) {
    alert("You selected: " + answer.value.toUpperCase());
  } else {
    alert("Please select an answer.");
  }
});