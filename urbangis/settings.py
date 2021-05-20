"""
Django settings for urbangis project.

Generated by 'django-admin startproject' using Django 3.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""
import django_heroku
from sys import platform
from pathlib import Path
from django.urls import reverse_lazy
import os


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '5&h4p*m+9!1+1^2_fv@jeurfmht5=+5mwkkv6p-$np&5l6f)hk'

# SECURITY WARNING: don't run with debug turned on in production!
# develop
#if platform == "win32":
DEBUG = True
#else:
#    DEBUG = False

ALLOWED_HOSTS = ['127.0.0.1', '192.168.1.11', '192.168.1.20', 'urbangis1.herokuapp.com', 'smartcitykey.com']


# Application definition

INSTALLED_APPS = [
    'website',
    'coregis',
    'roadaccident',
    'citytree',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'storages',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    #'django.middleware.locale.LocaleMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'urbangis.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ os.path.join(BASE_DIR, 'templates') ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'urbangis.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
#}

# develop
if platform == "win32":
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'gis',
            'USER': 'postgres',
            'PASSWORD': 'admin',
            'HOST': '127.0.0.1',
            'PORT': '5432',
        }
    }
#production
else:
    import dj_database_url
    DATABASES = {}
    db_info = os.environ['HEROKU_POSTGRESQL_GREEN_URL']
    DATABASES['default'] = dj_database_url.config(default=db_info, conn_max_age=600, ssl_require=True)

#import dj_database_url
#db_url = 'postgres://astqzevmehqpyw:23f9711288d50a32c407bae95bae298bff907fe150f317605342d98df714ea8e@ec2-52-209-134-160.eu-west-1.compute.amazonaws.com:5432/d4auhpr1e9qes'
#print( dj_database_url.config(default=db_url, conn_max_age=600, ssl_require=True) )



# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

#LANGUAGE_CODE = 'en-us'
LANGUAGE_CODE = 'en'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True




EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # During development only


LOGIN_URL = reverse_lazy('login')


#USE_S3 = os.getenv('USE_S3') == 'TRUE'
USE_S3 = True

if USE_S3:
    # aws settings
    AWS_ACCESS_KEY_ID = 'AKIA2YSO7FE5PEVJC3QV'
    AWS_SECRET_ACCESS_KEY = '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'
    AWS_STORAGE_BUCKET_NAME = 'urbangis'
    #AWS_DEFAULT_ACL = None
    AWS_DEFAULT_ACL = 'public-read'
    AWS_S3_FILE_OVERWRITE = False
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}

    # s3 public media settings
    AWS_LOCATION = 'media'
    #PUBLIC_MEDIA_LOCATION = 'media'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION}/'
else:
    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/3.1/howto/static-files/


    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    MEDIA_URL = "/media/"


STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static')
]

#STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
#STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'

import _locale
_locale._getdefaultlocale = (lambda *args: ['en_US', 'utf8'])

# Activate Django-Heroku.
django_heroku.settings(locals())