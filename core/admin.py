from django.contrib import admin
from django.contrib.auth.models import Group

from . import models


@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    fields = ["name"]
    search_fields = ["name"]
    ordering=("name", )

@admin.register(models.Option)
class OptionAdmin(admin.ModelAdmin):
    fields = list_display = ["letter","description"]
    search_fields = ["description"]

    def has_view_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, *args, **kwargs):
        return False

    def has_add_permission(self, request, *args, **kwargs):
        return False
    
    def has_delete_permission(self, request, *args, **kwargs):
        return False

class OptionInline(admin.TabularInline):
    fields = ["letter", "description"]
    model = models.Option
    extra=4
    max=5


class AnswerInline(admin.StackedInline):
    model = models.Answer
    fields = ["question", "correct_option", "explanation"]
    list_display = ["question", "correct_option"]
    extra = 0
    max=1
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "correct_option":
                question_id = request.resolver_match.kwargs.get("object_id")
                if question_id:
                    question = models.Question.objects.get(pk=question_id)
                    kwargs["queryset"] = models.Option.objects.filter(question=question)
                else:
                    kwargs["queryset"] = models.Option.objects.none()
            
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(models.Question)
class QuestionAdmin(admin.ModelAdmin):
    fields = ["category", "question"]
    list_display = ["question", "category", "answer"]
    raw_id_fields = ["category"]
    autocomplete_fields = ["category"]
    search_fields = ["question"]
    list_filter = ["category"]
    inlines = [OptionInline, AnswerInline]
    ordering=("id", )

    class Media:
        css = {
        'screen': ('custom_admin.css',),
    }

    def answer(self, obj):
        try:
            return models.Answer.objects.get(question=obj)
        except models.Answer.DoesNotExist:
            return None


admin.site.unregister(Group)
admin.site.site_header = "Medical MCQs"
admin.site.site_title = "Medical MCQs - Admin"
admin.site.index_title = "Medical MCQs - Admin"