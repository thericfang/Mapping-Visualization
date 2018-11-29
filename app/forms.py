## The flask-wtf extension imports the forms within this python application. 
## The four classes that represent the field type or imported directly within this application
## An object is created as a class variable with the first parameter of each as a description of what the field is, and an optional second parameter of validators
## The validator DataRequired() simply means that the field cannot be empty.

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()]) 
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')

