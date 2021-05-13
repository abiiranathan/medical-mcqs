window.addEventListener("DOMContentLoaded", function () {
  var revealLinks = document.querySelectorAll(".reveal-answer");
  var categories = document.querySelectorAll(".category");
  var toggleCategories = document.querySelector("#toggle-categories");
  var options = document.querySelectorAll(".options .option");
  var pageQuestions = document.querySelectorAll(".question");
  var scoreLabel = document.getElementById("score");
  var resetButton = document.getElementById("reset");
  var answeredQuestions = [];
  var autoscroll = document.querySelector("#autoscroll");

  autoscroll.checked = !!JSON.parse(localStorage.getItem("auto-scroll"));

  if (localStorage.getItem("answered_questions")) {
    var data = JSON.parse(localStorage.getItem("answered_questions"));
    if (data) {
      answeredQuestions = data;
    }
  }

  autoscroll.addEventListener("change", function () {
    localStorage.setItem("auto-scroll", JSON.stringify(this.checked));
  });

  function revealAnswer() {
    var parent = this.parentElement;
    var targetAnswer = parent.querySelector(".answer-detail");
    targetAnswer && targetAnswer.classList.toggle("collapse");

    if (targetAnswer.classList.contains("collapse")) {
      this.innerText = "Reveal Answer";
    } else {
      this.innerText = "Hide Answer";
    }
  }

  revealLinks.forEach(function (link) {
    link.addEventListener("click", revealAnswer);
  });

  categories.forEach(function (category) {
    category.addEventListener("click", function () {
      window.location.href = "/" + "?category=" + category.innerText.trim();
    });
  });

  toggleCategories.addEventListener("click", function () {
    var categoryWrapper = document.querySelector("#category-wrapper");
    categoryWrapper.classList.toggle("visible");
  });

  options.forEach(function (option) {
    option.addEventListener("click", markOption);
  });

  function markOption() {
    var question = this.closest(".question");
    var answer = question.querySelector(".answer");
    var selectedAnswerID = this.getAttribute("data-id");
    var revealButton = question.querySelector(".reveal-answer");
    var optionMarker = this.querySelector(".marker");
    var answerMarker = answer.querySelector(".marker");

    if (question && answer) {
      var qid = question.getAttribute("data-id");

      if (
        question.classList.contains("answered") ||
        answeredQuestions.some(function (obj) {
          return obj.qid === qid;
        })
      ) {
        alert("You have already answered this question!");
      } else {
        question.classList.add("answered");

        var correctAnswerID = answer.getAttribute("data-answer");
        if (selectedAnswerID === correctAnswerID) {
          showMarkers(optionMarker, answerMarker, "correct");
        } else {
          showMarkers(optionMarker, answerMarker, "incorrect");
        }

        revealButton.classList.remove("hidden");
        answeredQuestions.push({ qid, selectedAnswerID, correctAnswerID });
        localStorage.setItem("answered_questions", JSON.stringify(answeredQuestions));
        computePercentage();

        // Go to the next question
        var nextQn = question.nextElementSibling;

        if (autoscroll && autoscroll.checked) {
          setTimeout(() => {
            nextQn && nextQn.scrollIntoView({ behavior: "smooth" });
          }, 2000);
        }
      }
    }
  }

  pageQuestions.forEach(function (item) {
    var qid = item.getAttribute("data-id");
    var answeredQn = answeredQuestions.find(function (obj) {
      return obj.qid === qid;
    });

    if (answeredQn) {
      item.classList.add("answered");
      var selectedOption = item.querySelector('[data-id="' + answeredQn.selectedAnswerID + '"]');
      var ans = item.querySelector(".answer");
      var revealAns = item.querySelector(".reveal-answer");

      revealAns && revealAns.classList.remove("hidden");

      if (selectedOption) {
        var optionMarker = selectedOption.querySelector(".marker");
        var answerMarker = ans.querySelector(".marker");

        if (answeredQn.selectedAnswerID === answeredQn.correctAnswerID) {
          showMarkers(optionMarker, answerMarker, "correct");
        } else {
          showMarkers(optionMarker, answerMarker, "incorrect");
        }
      }
    }
  });

  function showMarkers(optionMarker, answerMarker, className) {
    optionMarker.classList.add(className);
    answerMarker.classList.add(className);
  }

  function computePercentage() {
    var correctQns = answeredQuestions.filter(function (qn) {
      return qn.selectedAnswerID === qn.correctAnswerID;
    });

    var percentage = 0;

    if (answeredQuestions.length > 0) {
      percentage = (correctQns.length / answeredQuestions.length) * 100;
    }

    scoreLabel.innerText =
      correctQns.length + "/" + answeredQuestions.length + " ( " + percentage.toFixed(0) + " %) ";
  }

  resetButton &&
    resetButton.addEventListener("click", function () {
      answeredQuestions = [];
      localStorage.setItem("answered_questions", JSON.stringify(answeredQuestions));
      window.location.reload();
    });

  computePercentage();
});
