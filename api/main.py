from fastapi import FastAPI, File, UploadFile, Request
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


MODEL = tf.keras.models.load_model("../model/100epochspotato.keras")
class_names = ['Bacteria', 'Fungi', 'Healthy', 'Nematode', 'Pest', 'Phytopthora', 'Virus']

template = Jinja2Templates(directory='../templates')

app = FastAPI()


app.mount("/static", StaticFiles(directory="../static"), name="static")

@app.get("/ping")
async def ping():
    return "hello, I am alive"

@app.get("/")
async def index(req: Request):
    return template.TemplateResponse(
        name='index.html',
        context={"request":req},
        request=req

    )

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image


@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):
    image = read_file_as_image(await file.read())
    image_batch = np.expand_dims(image,0)
    results = MODEL.predict(image_batch)

    predicted_class = class_names[np.argmax(results[0])]
    confidence = np.max(results[0])
    return {
        'class': predicted_class,
        'confidence': float(confidence)
    }


if __name__ == "__main__":
    uvicorn.run(app,host="localhost",port=8000)