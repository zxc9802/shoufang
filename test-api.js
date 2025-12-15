// Test listing API
const testAPI = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/generate/listing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'test-user-id',
                propertyInfo: {
                    community: '测试小区',
                    area: '80',
                    layout: '2室1厅',
                    platform: 'beike'
                },
                imageUrls: ['https://example.com/image.jpg']
            })
        })

        const data = await response.json()
        console.log('Status:', response.status)
        console.log('Response:', JSON.stringify(data, null, 2))
    } catch (error) {
        console.error('Error:', error.message)
    }
}

testAPI()
