from django.contrib import admin
from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.utils.crypto import get_random_string
from authtools.admin import NamedUserAdmin
from authtools.forms import UserCreationForm

from common.models import PrincipalInvestigator, Organization, CostUnit


User = get_user_model()

@admin.register(PrincipalInvestigator)
class PrincipalInvestigatorAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization',)
    search_fields = ('name', 'organization__name',)
    list_filter = ('organization',)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    pass


@admin.register(CostUnit)
class CostUnitAdmin(admin.ModelAdmin):
    list_display = ('name', 'pi',)
    search_fields = ('name', 'pi__name', 'pi__organization__name',)
    list_filter = ('pi__organization__name', 'pi__name',)


class UserCreationForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super(UserCreationForm, self).__init__(*args, **kwargs)
        self.fields['password1'].required = False
        self.fields['password2'].required = False
        # If one field gets autocompleted but not the other, our 'neither
        # password or both password' validation will be triggered.
        self.fields['password1'].widget.attrs['autocomplete'] = 'off'
        self.fields['password2'].widget.attrs['autocomplete'] = 'off'

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = super(UserCreationForm, self).clean_password2()
        if bool(password1) ^ bool(password2):
            raise forms.ValidationError("Fill out both fields")
        return password2


class UserAdmin(NamedUserAdmin):
    add_form = UserCreationForm
    add_fieldsets = (
        (None, {
            'description': (
                "Enter the new user's name and email address and click Save."
                " The user will be emailed a link allowing him/her to login to"
                " the site and set his/her password."
            ),
            'fields': (
                'name',
                'email',
            ),
        }),
        ('Password', {
            'description': "Optionally, you may set the user's password here.",
            'fields': ('password1', 'password2'),
            'classes': ('collapse', 'collapse-closed'),
        }),
    )

    list_display = (
        'name',
        'email',
        'phone',
        'organization',
        'pi',
        'is_staff',
    )
    search_fields = (
        'name',
        'email',
        'phone',
        'organization__name',
        'pi__name',
    )
    list_filter = ('is_staff', 'organization',)
    list_display_links = ('name', 'email',)
    filter_horizontal = ('cost_unit', 'groups', 'user_permissions',)

    fieldsets = (
        (None, {
            'fields': ('name', 'email', 'password',),
        }),
        ('Personal info', {
            'fields': (
                'phone',
                'organization',
                'pi',
                'cost_unit',
            ),    
        }),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),    
        }),
        ('Other', {
            'fields': (
                'last_login',
            ),    
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change and (not form.cleaned_data['password1'] or 
            not obj.has_usable_password()):
            # Django's PasswordResetForm won't let us reset an unusable
            # password. We set it above super() so we don't have to save twice.
            obj.set_password(get_random_string())
            reset_password = True
        else:
            reset_password = False

        super(UserAdmin, self).save_model(request, obj, form, change)

        if reset_password:
            reset_form = PasswordResetForm({'email': obj.email})
            assert reset_form.is_valid()
            reset_form.save(
                request=request,
                use_https=request.is_secure(),
                subject_template_name=
                    'registration/account_creation_subject.txt',
                email_template_name='registration/account_creation_email.html',
            )

admin.site.register(User, UserAdmin)
