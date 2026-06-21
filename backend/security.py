import bcrypt

# bcrypt é usado diretamente aqui pois passlib depende do módulo `crypt`
# que foi removido no Python 3.13+.

def get_password_hash(password: str) -> str:
    """Recebe a senha em texto puro e devolve o hash bcrypt ($2b$...)"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara a senha digitada no login com o hash salvo no banco"""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False