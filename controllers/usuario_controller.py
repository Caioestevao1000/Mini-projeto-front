from flask import Blueprint, jsonify

from models.conexao import get_connection
from models.favorito import Favoritos
from models.usuario import Usuarios

usuarios_bp = Blueprint("usuarios", __name__)


# GET /api/usuarios/  (lista de perfis para o <select> do front)
@usuarios_bp.route("/")
def listar():
    model = Usuarios(get_connection().cursor(dictionary=True))
    return jsonify(model.select_all())


# GET /api/usuarios/busca/caio
@usuarios_bp.route("/busca/<string:termo>")
def buscar(termo):
    model = Usuarios(get_connection().cursor(dictionary=True))
    return jsonify(model.select_by_termo(termo))


# GET /api/usuarios/caio  (perfil: dados do usuário + pilotos favoritos)
@usuarios_bp.route("/<string:username>")
def perfil(username):
    cursor = get_connection().cursor(dictionary=True)

    usuario = Usuarios(cursor).select_by_username(username)
    if usuario is None:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    usuario["favoritos"] = Favoritos(cursor).select_by_usuario(usuario["id"])
    return jsonify(usuario)


# POST /api/usuarios/caio/favoritos/7
@usuarios_bp.route("/<string:username>/favoritos/<int:piloto_id>", methods=["POST"])
def favoritar(username, piloto_id):
    conexao = get_connection()
    cursor = conexao.cursor(dictionary=True)

    usuario = Usuarios(cursor).select_by_username(username)
    Favoritos(cursor).insert(usuario["id"], piloto_id)
    conexao.commit()

    return jsonify({"mensagem": "Piloto favoritado"}), 201


# DELETE /api/usuarios/caio/favoritos/7
@usuarios_bp.route("/<string:username>/favoritos/<int:piloto_id>", methods=["DELETE"])
def desfavoritar(username, piloto_id):
    conexao = get_connection()
    cursor = conexao.cursor(dictionary=True)

    usuario = Usuarios(cursor).select_by_username(username)
    Favoritos(cursor).delete(usuario["id"], piloto_id)
    conexao.commit()

    return jsonify({"mensagem": "Piloto removido dos favoritos"})
