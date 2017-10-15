Installation
============


Requirements
------------

* Python 3.6
* PostgreSQL
* `Sencha Cmd`_


Set up the PostgreSQL database
------------------------------

.. code-block:: sql

   CREATE DATABASE parkour;
   CREATE USER parkour WITH PASSWORD 'parkour';
   GRANT ALL PRIVILEGES ON DATABASE parkour TO parkour;


Export environment variables
----------------------------

.. code-block:: bash

  export SECRET_KEY=12345678
  export DJANGO_SETTINGS_MODULE=wui.settings.dev
  export DATABASE_URL=postgres://postgres@localhost:5432/parkour

.. note::

   Change the PostgreSQL's ``port`` if needed.


Set up Parkour
--------------

Clone the repository::

  git clone https://github.com/maxplanck-ie/parkour.git
  cd parkour

Install the requirements::

  pip install -r requirements/dev.txt

Migrate the database::

  python manage.py migrate

Create a superuser (admin)::

  python manage.py createsuperuser

Run the server::

  ./manage.py runserver


.. _Sencha Cmd: https://www.sencha.com/products/extjs/cmd-download/
