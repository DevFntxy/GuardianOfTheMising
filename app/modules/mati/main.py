from fastapi import FastAPI


app = FastAPI(
    title="Guardian Of The Missing",
    version=("1.0.0")
)

@app.get("/")
async def root():
    return{"mensaje":"EL servidor funciona correctamente"}