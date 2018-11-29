from app import db
from datetime import datetime, timedelta
import json, os

rootdir = "/Users/ericfang/Desktop/images"

class Trial(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    trial_date = db.Column(db.String(40), unique = True)
    seconds = db.relationship('Second', backref='trial', lazy = True)
    path = db.Column(db.String(120))
    def __repr__(self):
        return '<Trial {}, on date {}>'.format(self.id, self.trial_date)


class Second(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    time = db.Column(db.Integer)
    lat = db.Column(db.Integer)
    lon = db.Column(db.Integer)
    altitude_m = db.Column(db.Integer)
    speed_m_s = db.Column(db.Integer)
    bearing_degrees = db.Column(db.Integer)
    time_usec = db.Column(db.Integer)
    trial_date = db.Column(db.Integer, db.ForeignKey('trial.trial_date'))
    trial_id = db.Column(db.Integer)
    def __repr__(self):
        temp = str(timedelta(seconds=self.time))
        return '<{} (Trial {}), at GPS coordinate ({}, {}) (Date: {})>'.format(temp, self.trial_id, self.lat, self.lon, self.trial_date)
        
class Image(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(15))
    trial_date = db.Column(db.Integer)
    size = db.Column(db.String(40))
    path = db.Column(db.String(40))
    def __repr__(self):
        return '<Image {} on {} ({} Bytes)>'.format(self.name, self.trial_date, self.size)

class Acceleration(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    trial_date = db.Column(db.Integer)
    x = db.Column(db.Integer)
    y = db.Column(db.Integer)
    z = db.Column(db.Integer)
    time_usec = db.Column(db.Integer)
    def __repr__(self):
        return '<Acceleration Data in (x,y,z): ({},{},{}) part of trial {}>'.format(self.x, self.y, self.z, self.trial_date)
