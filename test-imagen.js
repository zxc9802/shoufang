// Test Google Imagen API
const testImagenAPI = async () => {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict', {
            method: 'POST',
            headers: {
                'x-goog-api-key': 'AIzaSyCeDt2_IBO1y3RYo8nQ07XHBZOboRkvL_g',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [{
                    prompt: 'Robot holding a red skateboard'
                }],
                parameters: {
                    sampleCount: 1
                }
            })
        })

        const data = await response.json()
        console.log('Status:', response.status)
        console.log('Response:', JSON.stringify(data, null, 2))
    } catch (error) {
        console.error('Error:', error)
    }
}

testImagenAPI()
