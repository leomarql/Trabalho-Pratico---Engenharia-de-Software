from passlib.context import CryptContext

# Define que usaremos o algoritmo bcrypt para esconder a senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    """Recebe a senha em texto puro e devolve o hash embaralhado"""
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    """Compara a senha digitada no login com o hash salvo no banco"""
    return pwd_context.verify(plain_password, hashed_password)