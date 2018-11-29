from flask import render_template, flash, redirect, url_for, jsonify, json, request
from app import app, db
from app.forms import LoginForm
import json, os, re
from app.models import Trial, Second, rootdir, Acceleration, Image
from app.queries import find_num_of_trials, add_trials, add_all_seconds, add_seconds, add_images
global trialNum 
trialNum = find_num_of_trials()
#global trials
#trials = Trial.query.all()
#global trialDate
#trialDate = trials[trialNum-1].trial_date 
global points
points = []
for i in range(1, trialNum+1):
    points.append(Second.query.filter_by(trial_id=i).first())

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='Home')
    
@app.route('/streetview')
def street_view():
    image_list = []
    global directory
    directory = "/Users/ericfang/Desktop/images" # change to whichever directory has trial folders, images
    # for subdir, dirs, files in os.walk(directory):
    #     for file in files:
    #         image_list.append(file)
    # image_list.sort()
    image_list = []
    for image in Image.query.filter_by(trial_date="2018_06_05-10_04_16").order_by(Image.name).all():
        image_list.append(image.name)
    print(image_list)
    seconds_list = []
    for i in range(1, trialNum+1):
        points = []
        for second in Second.query.filter_by(trial_id=i).all():
            points.append(second)
        seconds_list.append(points)
    return render_template('street.html', date = "2018_06_05-10_04_16", image_list = image_list, seconds_list = seconds_list, directory = directory)
@app.route('/map')
def map():
    #updatedb()
    return render_template('map.html', title='Home', points = points)
@app.route('/login', methods=['GET', 'POST']) #POST requests are when the browser submits form data to the server, GET requests are those that return information to the client
def login():
    form = LoginForm()
    if form.validate_on_submit(): #When browser sends POST request, gathers all the data and runs validators and return true if POST request 
        flash('Login requested for user {}, remember_me={}'.format( #Show a message to user, flash stores messages in Flask and to show, must use get_flashed_messages()
            form.username.data, form.remember_me.data))
        return redirect(url_for('index')) #redirects page
    return render_template('login.html', title='Sign in', form=form)

@app.route('/<trialDate>', methods=['GET'])
def trial(trialDate):
    seconds = Second.query.filter_by(trial_date=trialDate).all()
    accelerations = Acceleration.query.filter_by(trial_date=trialDate).all()
    print(len(accelerations))
    return render_template('trial.html', date = trialDate, seconds = seconds, accelerations = accelerations)

def updatedb():
    db.drop_all()
    db.session.commit()
    db.create_all()
    db.session.commit()
    add_trials()
    add_all_seconds()
    add_images()
   
    
  
@app.route('/image_set', methods=['POST'])
def image_set():
    image_list = []
    for image in Image.query.filter_by(trial_date=request.form['date']).order_by(Image.name).all():
        image_list.append(image.name)
    return jsonify(image_list)
