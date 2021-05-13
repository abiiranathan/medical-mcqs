from django.shortcuts import render
from django.core.paginator import Paginator

from .models import Question, Category


def index(request):
    template_name = "index.html"

    query = request.GET.get("query", "")
    category = request.GET.get("category", "")

    categories = Category.objects.all()
    questions = Question.answered.all()
    
    if query:
        questions = questions.filter(question__icontains=query)
    
    if category:
        questions = questions.filter(category__name=category)

    # Paginate after filtering
    paginator = Paginator(questions, 5) 
    page_number = request.GET.get('page', 1)
    questions = paginator.get_page(page_number)

    context = {
        "questions": questions,
        "categories": categories,
        "query": query,
        "category": category,
        "totalCount":paginator.count
    }

    return render(request, template_name, context=context)