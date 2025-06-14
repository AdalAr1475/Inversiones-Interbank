from fastapi import FastAPI
from routers import (
    auth, documents, stripe_webhook, crear_usuarios,
    stripe_logic, project, payment, invest,
    chat                 
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://192.168.18.26:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router,  prefix="/auth")
app.include_router(crear_usuarios.router, prefix="/users")
app.include_router(project.router, prefix="/project")
app.include_router(payment.router, prefix="/payment")
app.include_router(stripe_logic.router, prefix="/stripe")
app.include_router(documents.router, prefix="/documents")
app.include_router(stripe_webhook.router)               

app.include_router(invest.router, prefix="/invest")

app.include_router(chat.router)
