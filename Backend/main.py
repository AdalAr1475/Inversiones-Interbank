from fastapi import FastAPI
from routers import auth, users, documents, payment, invest, project
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
app.include_router(users.router, prefix="/users")
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(payment.router, prefix="/payment")
app.include_router(invest.router, prefix="/invest")
app.include_router(project.router, prefix="/project")
