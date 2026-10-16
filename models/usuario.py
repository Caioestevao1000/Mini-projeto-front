class Usuarios:
    def __init__(self, cursor):
        self._cursor = cursor

    def select_all(self):
        self._cursor.execute("SELECT id, nome, username, bio FROM usuarios ORDER BY nome")
        return self._cursor.fetchall()

    def select_by_termo(self, termo):
        busca = f"%{termo}%"
        self._cursor.execute("""
            SELECT id, nome, username, bio
            FROM usuarios
            WHERE nome LIKE %s OR username LIKE %s
            ORDER BY nome
        """, (busca, busca))
        return self._cursor.fetchall()

    def select_by_username(self, username):
        self._cursor.execute(
            "SELECT id, nome, username, bio FROM usuarios WHERE username = %s",
            (username,),
        )
        return self._cursor.fetchone()
