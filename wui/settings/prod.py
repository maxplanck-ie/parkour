from .base import *


DEBUG = False

LOGGING['loggers'] = {
    'django.request': {
        'handlers': ['mail_admins'],
        'level': 'ERROR',
        'propagate': True,
    },
    'django': {
        'handlers': ['console', 'logfile'],
        'level': 'ERROR',
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
    'minimum-font-size': 12,

    # 'header-center': 'Deep Sequencing Request',
    # 'header-font-name': 'Helvetica',
    # 'header-font-size': 12,
    # 'header-spacing': 20,

    'footer-center': 'Page [page] of [topage]',
    'footer-font-size': 8,
}
