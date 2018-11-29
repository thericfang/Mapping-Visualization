import os
from app.models import Trial, Second, Image, Acceleration
import json
from app import db
from app.models import rootdir

def add_trials(): #scan the root dir for any new trials and add to database
    for subdir, dirs, files in os.walk(rootdir):
        for dir_walk in dirs:
            new = Trial(trial_date = dir_walk)
            db.session.add(new)
    db.session.commit()


def add_seconds(Trial): #add each second to trial
    run = Trial.trial_date
    run_id = Trial.id
    with open(rootdir + "/" + Trial.trial_date + "/locations.json") as json_data:
        d = json.load(json_data)
        index = 0
        for item in d['locations']:
            new = Second(lat = item['lat'], lon = item['lon'], altitude_m = item['altitude_m'], speed_m_s = item['speed_m_s'], bearing_degrees = item['bearing_degrees'], time_usec = item['time_usec'], trial_date = run, time = index+1, trial_id = run_id)
            db.session.add(new)
            index+=1
    db.session.commit()
    

def add_all_seconds():
    trials = Trial.query.all()
    for trial in trials:
        add_seconds(trial)

def find_num_of_trials():
    counter = 0
    for trial in Trial.query.all():
        counter+=1
    return counter

def add_images():
    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            if file.endswith('.bmp'):
                new = Image(name = file, trial_date = subdir.split(os.path.sep)[-1], size = os.path.getsize(subdir+"/"+file), path = subdir)
                db.session.add(new)
                db.session.commit()
                
def add_accelerations(Trial):
    run = Trial.trial_date
    with open(rootdir + "/" + Trial.trial_date + "/accelerations.json") as json_data:
        d = json.load(json_data)
        index = 0
        for item in d['accelerations']:
            new = Acceleration(x = item['x'], y = item['y'], z = item['z'], time_usec = item['time_usec'], trial_date = run)
            db.session.add(new)
        db.session.commit()

def add_all_accelerations():
    trials = Trial.query.all()
    for trial in trials:
        add_accelerations(trial)
    