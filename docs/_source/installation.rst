Installation
============

Requirements
------------

* Python 3
* PostgreSQL
* `Sencha Cmd`_

Set up the PostgreSQL database
------------------------------

.. code-block:: sql

   CREATE DATABASE parkour;
   CREATE USER parkour WITH PASSWORD 'parkour';
   GRANT ALL PRIVILEGES ON DATABASE parkour TO parkour;


Set up Parkour
--------------

Clone the repository::

  git clone https://github.com/maxplanck-ie/parkour.git
  cd parkour

Install the pip requirements::

  pip install -r requirements/dev.txt

Migrate the database::

  python manage.py migrate

Create a superuser (admin)::

  python manage.py createsuperuser

Run the server::

  ./run.sh


.. _Sencha Cmd: https://www.sencha.com/products/extjs/cmd-download/
