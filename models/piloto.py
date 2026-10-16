class Pilotos:
    def __init__(self, cursor):
        self._cursor = cursor

    # Os 3 pilotos da página inicial
    def select_destaques(self):
        self._cursor.execute("""
            SELECT id, nome, equipe, nacionalidade, foto_url
            FROM vw_pilotos
            WHERE destaque = TRUE
        """)
        return self._cursor.fetchall()

    # Busca pelo nome, nacionalidade ou equipe, uma página por vez
    def select_by_termo(self, termo, pagina, por_pagina):
        busca = f"%{termo}%"
        offset = (pagina - 1) * por_pagina
        self._cursor.execute("""
            SELECT id, nome, equipe, nacionalidade, foto_url
            FROM vw_pilotos
            WHERE nome LIKE %s OR nacionalidade LIKE %s OR equipe LIKE %s
            ORDER BY nome
            LIMIT %s OFFSET %s
        """, (busca, busca, busca, por_pagina, offset))
        return self._cursor.fetchall()

    # Quantos pilotos a busca encontra no total (para saber quantas páginas existem)
    def count_by_termo(self, termo):
        busca = f"%{termo}%"
        self._cursor.execute("""
            SELECT COUNT(*) AS total
            FROM vw_pilotos
            WHERE nome LIKE %s OR nacionalidade LIKE %s OR equipe LIKE %s
        """, (busca, busca, busca))
        return self._cursor.fetchone()["total"]
