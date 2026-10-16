import mysql.connector
from flask import g

import config

def get_connection():
    if "db" not in g:
        g.db = mysql.connector.connect(
            host=config.DB_HOST,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME,
        )
    return g.db

def close_connection(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()
