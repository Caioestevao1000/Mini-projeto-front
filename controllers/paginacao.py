import math

from flask import request

POR_PAGINA_PADRAO = 5
POR_PAGINA_MAXIMO = 50


def ler_paginacao():
    pagina = request.args.get("pagina", default=1, type=int)
    por_pagina = request.args.get("por_pagina", default=POR_PAGINA_PADRAO, type=int)

    pagina = max(pagina, 1)
    por_pagina = min(max(por_pagina, 1), POR_PAGINA_MAXIMO)
    return pagina, por_pagina


def resposta_paginada(resultados, total, pagina, por_pagina):
    return {
        "pagina": pagina,
        "por_pagina": por_pagina,
        "total": total,
        "total_paginas": math.ceil(total / por_pagina),
        "resultados": resultados,
    }
