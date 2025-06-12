from fastapi import FastAPI
<<<<<<< HEAD
from routers import crear_usuarios
from routers import auth, documents, payment, invest, project
=======
from routers import auth, stripe_webhook, users, documents, stripe_logic, project
>>>>>>> 59fbbdc27cabe7b6559c924f5beb1d57590a7628
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#Tratar de separar los endpoints de todos los módulos en otros archivos, dentro de la carpeta routers

origins = [
    "http://localhost:5173",
    "http://localhost:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

#app.include_router(documents.router, prefix="/documents")
app.include_router(auth.router, prefix="/auth")
app.include_router(crear_usuarios.router, prefix="/users")
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(project.router, prefix="/project")
app.include_router(stripe_logic.router, prefix="/stripe")
app.include_router(stripe_webhook.router)
