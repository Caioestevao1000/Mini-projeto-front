import math

from flask import Blueprint, jsonify, request

from models.conexao import get_connection
from models.piloto import Pilotos

pilotos_bp = Blueprint("pilotos", __name__)

POR_PAGINA = 4

# GET /api/pilotos/destaques
@pilotos_bp.route("/destaques")
def destaques():
    model = Pilotos(get_connection().cursor(dictionary=True))
    return jsonify(model.select_destaques())


# GET /api/pilotos/busca/senna?pagina=1
@pilotos_bp.route("/busca/<string:termo>")
def buscar(termo):
    pagina = request.args.get("pagina", default=1, type=int)

    model = Pilotos(get_connection().cursor(dictionary=True))
    pilotos = model.select_by_termo(termo, pagina, POR_PAGINA)
    total = model.count_by_termo(termo)

    return jsonify({
        "pagina": pagina,
        "total_paginas": math.ceil(total / POR_PAGINA),
        "resultados": pilotos,
    })
