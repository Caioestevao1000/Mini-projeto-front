class Favoritos:
    def __init__(self, cursor):
        self._cursor = cursor

    # Pilotos favoritados por um usuário (aparecem no perfil dele)
    def select_by_usuario(self, usuario_id):
        self._cursor.execute("""
            SELECT p.id, p.nome, p.equipe, p.nacionalidade, p.foto_url
            FROM favoritos f
            JOIN vw_pilotos p ON p.id = f.piloto_id
            WHERE f.usuario_id = %s
            ORDER BY p.nome
        """, (usuario_id,))
        return self._cursor.fetchall()

    def insert(self, usuario_id, piloto_id):
        self._cursor.execute(
            "INSERT INTO favoritos (usuario_id, piloto_id) VALUES (%s, %s)",
            (usuario_id, piloto_id),
        )

    def delete(self, usuario_id, piloto_id):
        self._cursor.execute(
            "DELETE FROM favoritos WHERE usuario_id = %s AND piloto_id = %s",
            (usuario_id, piloto_id),
        )
