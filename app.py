'''
sessalgd3 -- Angela Tom
'''

import os
import sqlite3

from flask import Flask, render_template, request, session, redirect, url_for, flash


app = Flask(__name__)
app.secret_key = os.urandom(8)

@app.route('/')
def home():
    return render_template('index.html')
 
if __name__ == "__main__":
    app.run(debug=True)
