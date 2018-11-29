# Mapping Visualization Web App

This application is responsible for creating a database for GPS coordinate locations and tracking a vehicle's route, while also displaying a video while tracking. 

## Quickstart

Python is needed, if you do not have it already, please download it.

### Set up Virtual Environment

Since python3 natively supports the use of virtual environments, use it to create a virtual environment.

```
$ python3 -m venv venv
```

For versions before 3.4, use the tool [virtualenv](https://virtualenv.pypa.io/en/stable/) and the command
```
$ virtualenv venv
```

Activate the virtual enviornment:
```
$ source venv/bin/activate
```

For Windows:
```
$ venv\Scripts\activate
```

### Install Necessary Packages

* #### Flask
```
(venv) $ pip install flask
```

* #### Setting Enviornment Variable
```
(venv) $ export FLASK_APP=mapping_visualization.py
```

* #### SQLAlchemy
```
(venv) $ pip install flask-sqlalchemy
```

### Migrations

To make use for easy migrations or manipulations of objects/tables, use the Flask extension Flask-Migrate.

```
(venv) $ pip install flask-migrate
```

Now you can easily make changes in columns, objects, names, etc.

When migrating, 
1. Create migrate repo
```
(venv) $ flask db init
```
2. Generate migration scripts
```
(venv) $ flask db migrate -m "your comment here"
```
3. Upgrade
```
(venv) $ flask db upgrade
```

## Details

The application makes use of the Google Maps Javascript API and SQLAlchemy Objects as its models. The GPS route data is collected beforehand and uploaded to the SQLite database using two Objects, Trial and Second. Each Second is linked to a specific Trial, and they each have dates.

### Run

Start the app with Flask
```
(venv) $ flask run
```

In order to test things within the shell enviornment without the need to import variables, make sure the FLASK_APP is pointing to the right file, and use
```
(venv) $ flask shell
```

### Database

Currently, the application uses SQLAlchemy and Flask structures for the database integration. The application uses Python in order to query and effectively use the database, so the functions and methods are used in Flask native files or the python interpreter, which can be easily accessed by 
```
(venv) $ flask shell
```

As variables are imported automatically through shell scripts as written in _mapping_visualization.py_, use SQLAlchemy and Flask commands to query and edit the database.

Here are a few commands from the flask-sqlalchemy documentation that are commonly used.
```
Python 3.6.5 (default, Apr 25 2018, 14:23:58)
[GCC 4.2.1 Compatible Apple LLVM 9.1.0 (clang-902.0.39.1)] on darwin
App: app [production]
Instance: yourinstancehere
>>> Trial.query.all()
[<Trial 1, on date 2018_06_05-10_04_16>, <Trial 2, on date 2018_06_08-13_05_20>, <Trial 3, on date 2018_06_08-11_44_28>, <Trial 4, on date 2018_06_08-11_59_39>, <Trial 5, on date 2018_06_08-11_40_50>, <Trial 6, on date 2018_06_08-11_54_22>, <Trial 7, on date 2018_06_08-11_29_28>, <Trial 8, on date assets>, <Trial 9, on date 2018_06_08-11_16_18>]
```
Someclassname.query.all() will list all of that class's objects in a list. Within the shell context, initializing variables to hold information and manipulate them is easy.
```
>>> listOfTrials = Trial.query.all()
>>> print(listOfTrials)
[<Trial 1, on date 2018_06_05-10_04_16>, <Trial 2, on date 2018_06_08-13_05_20>, <Trial 3, on date 2018_06_08-11_44_28>, <Trial 4, on date 2018_06_08-11_59_39>, <Trial 5, on date 2018_06_08-11_40_50>, <Trial 6, on date 2018_06_08-11_54_22>, <Trial 7, on date 2018_06_08-11_29_28>, <Trial 8, on date assets>, <Trial 9, on date 2018_06_08-11_16_18>]
>>> print(listOfTrials[2])
<Trial 3, on date 2018_06_08-11_44_28>
>>> Trial.query.all()[2]
<Trial 3, on date 2018_06_08-11_44_28>
```

In order to drop all tables from the database, use the command drop_all()
```
>>> db.drop_all()
```
In order for the changes to be saved, commit the session with the following:
```
>>> db.session.commit()
```
Similarly, with an empty database, in order to create tables according to the models given by our files, use the commands:
```
>>> db.create_all()
>>> db.session.commit()
```
to initialize our tables and have our general structure met.

In order to create objects and add them to the session, use the command add:
```
>>> a = Trial(trial_date = 2018_06_08-13_05_20, path = "this/path/here")
>>> db.session.add(a)
>>> db.session.commit()
```
For a full list of commands and queries, please read the [FlaskSQLAlchemy Documentation](http://flask-sqlalchemy.pocoo.org/2.3/)