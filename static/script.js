const uploadBox = document.getElementById('dropzone')
const fileInput = document.getElementById('fileInput')
const preview = document.getElementById('preview')
const predictBtn = document.getElementById('predictBtn')
const labelEl = document.getElementById('className')
const confidenceEl = document.getElementById('confidenceValue')
const preview_icon = document.getElementById('previewEmpty')


let selectedFile = null


uploadBox.addEventListener('click', () => fileInput.click())


fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0]
    if (!selectedFile) return

    const reader = new FileReader()
    reader.onload = (e) => {
        preview.style.backgroundImage = `url(${e.target.result})`
        preview_icon.style.display = 'none'
    }
    reader.readAsDataURL(selectedFile)
})


predictBtn.addEventListener('click', async () => {
    if (!selectedFile) return

    predictBtn.textContent = 'Analysing...'
    predictBtn.disabled = true

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        })

        const data = await response.json()


        labelEl.textContent = data.class

        confidenceEl.textContent = (Math.round((data.confidence * 100 + Number.EPSILON) * 100) / 100) + '%'


    } catch (err) {
        alert('Something went wrong. Check the console.')
        console.error(err)
    }

    predictBtn.textContent = 'SCAN'
    predictBtn.disabled = false
})