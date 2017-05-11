from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import int_to_base36
from django.template.loader import render_to_string
from django.core.mail import send_mail


class PassworResetForm(forms.Form):
    error_messages = {
        'unknown': ('That email address doesn\'t have an associated '
                    'user account. Are you sure you\'ve registered?'),
        'unusable': ('The user account associated with this email '
                     'address cannot reset the password.'),
    }

    def clean_email(self):
        """
        Validates that an active user exists with the given email address.
        """
        User = get_user_model()
        email = self.cleaned_data['email']
        self.users_cache = User._default_manager.filter(email__iexact=email)

        if not len(self.users_cache):
            raise forms.ValidationError(self.error_messages['unknown'])

        if not any([user.is_active for user in self.users_cache]):
            # none of the filtered users are active
            raise forms.ValidationError(self.error_messages['unknown'])

        # if any((user.password == UNUSABLE_PASSWORD) for user in self.users_cache):
        #     raise forms.ValidationError(self.error_messages['unusable'])

        return email

    def save(self, domain_override=None,
             subject_template_name='registration/password_reset_subject.txt',
             email_template_name='registration/password_reset_email.html',
             use_https=False, token_generator=default_token_generator,
             from_email=None, request=None):
        """
        Generates a one-use only link for resetting password and sends it to
        the user.
        """
        for user in self.users_cache:
            if not domain_override:
                current_site = get_current_site(request)
                site_name = current_site.name
                domain = current_site.domain
            else:
                site_name = domain = domain_override

            c = {
                'email': user.email,
                'domain': domain,
                'site_name': site_name,
                'uid': int_to_base36(user.pk),
                'user': user,
                'token': token_generator.make_token(user),
                'protocol': use_https and 'https' or 'http',
                }

            subject = render_to_string(subject_template_name, c)
            # Email subject *must not* contain newlines
            subject = ''.join(subject.splitlines())
            email = render_to_string(email_template_name, c)
            send_mail(subject, email, from_email, [user.email])
