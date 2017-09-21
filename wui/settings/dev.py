from .base import *


DEBUG = True

# INSTALLED_APPS += (
#     'debug_toolbar',
# )

# MIDDLEWARE_CLASSES += (
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
# )

# def show_toolbar(request):
#     return True

# DEBUG_TOOLBAR_CONFIG = {
#     'SHOW_TOOLBAR_CALLBACK': show_toolbar,
# }

LOGGING['loggers'] = {
    'django.request': {
        'handlers': ['mail_admins'],
        'level': 'ERROR',
        'propagate': True,
    },
    'django': {
        'handlers': ['console'],
        'level': 'DEBUG',
        'propagate': False,
    },
    'django.db.backends': {
        'handlers': ['console'],
        'level': 'DEBUG',
        'propagate': False,
    },
    'db': {
        'handlers': ['console', 'dblogfile'],
        'level': 'DEBUG',
    },
}

# pdfkit
# https://wkhtmltopdf.org/usage/wkhtmltopdf.txt
PDF_OPTIONS = {
    'encoding': 'UTF-8',
    'quiet': '',
    'minimum-font-size': 60,
    'footer-center': 'Page [page] of [topage]',
    'footer-font-size': 8,
}
