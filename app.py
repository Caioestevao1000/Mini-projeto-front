from flask import Flask

from controllers.piloto_controller import pilotos_bp
from controllers.usuario_controller import usuarios_bp
from models.conexao import close_connection

app = Flask(__name__)

app.register_blueprint(pilotos_bp, url_prefix="/api/pilotos")
app.register_blueprint(usuarios_bp, url_prefix="/api/usuarios")

app.teardown_appcontext(close_connection)

@app.route("/")
def index():
    return app.send_static_file("index.html")
