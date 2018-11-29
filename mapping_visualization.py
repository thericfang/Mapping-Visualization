from app import app, db
from app.models import Trial, Second, rootdir, Image, Acceleration
import json
from app.queries import add_trials, add_seconds, add_all_seconds, add_images, add_accelerations
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Second': Second, 'Trial': Trial, 'Image': Image, 'Acceleration': Acceleration, 'rootdir': rootdir, 'add_trials': add_trials, 'add_seconds': add_seconds, 'add_all_seconds': add_all_seconds, 'add_images': add_images, 'add_accelerations': add_accelerations}
