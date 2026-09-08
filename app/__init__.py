from os import getenv
from flask import Flask
from flask_minify import Minify


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = getenv('SECRET_KEY')

    Minify(app=app, html=True, js=True, cssless=True)

    from app.views import views
    app.register_blueprint(views)

    return app
