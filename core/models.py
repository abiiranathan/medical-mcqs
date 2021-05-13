from django.db import models

class AnsweredQuestionManager(models.Manager):
    def get_queryset(self):
        questions = super().get_queryset()
        # Return questions with answers
        answerIds = Answer.objects.values_list("question", flat=True)
        return questions.filter(id__in=answerIds)

class Category(models.Model):
    name = models.CharField(max_length=200, unique=True, db_index=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"


class Question(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    question = models.TextField()
    objects = models.Manager()
    answered = AnsweredQuestionManager()

    def __str__(self):
        return self.question

    class Meta:
        ordering = ("id", )

class Option(models.Model):
    choices = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('E', 'E'),
    ]

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    description = models.CharField(max_length=200, unique=True)
    letter = models.CharField(max_length=1, choices=choices)
    
    def __str__(self):
        return self.letter

    class Meta:
        unique_together = ("question", "letter")

class Answer(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name="answer")
    correct_option = models.ForeignKey(Option, on_delete=models.CASCADE)
    explanation = models.TextField(default="", blank=True, null=True)

    def __str__(self):
        return self.correct_option.letter
