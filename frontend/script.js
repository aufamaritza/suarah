// Configuration
const API_BASE_URL = 'https://suarah-server.site/api';

// Global variables for recording
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Frontend loaded successfully');
    checkAPIHealth();
    initializeRecordingStatus();
});

// Initialize recording status with helpful message
function initializeRecordingStatus() {
    document.getElementById('recordingStatus').innerHTML = `
        <strong>🎤 Siap untuk merekam</strong><br>
        <small>💡 Pastikan microphone berfungsi dan lingkungan tenang</small>
    `;
}

// Check if backend API is available
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('API Health:', data);
        
        if (!data.models_loaded) {
            showError('Backend models are not loaded. Please check the server.');
        }
    } catch (error) {
        console.error('API Health check failed:', error);
        showError('Cannot connect to backend server. Please make sure the server is running.');
    }
}

// Search by uploaded audio file
async function searchByAudio() {
    const fileInput = document.getElementById('audioFile');
    const resultsDiv = document.getElementById('results');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Silakan pilih file audio terlebih dahulu');
        return;
    }

    const file = fileInput.files[0];
    resultsDiv.innerHTML = '<div class="loading">Sedang memproses audio...</div>';
    
    try {
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('method', 'tfidf');
        formData.append('top_k', '3');
        
        const response = await fetch(`${API_BASE_URL}/search/audio`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.results);
        } else {
            resultsDiv.innerHTML = `<div class="error">Error: ${data.error}</div>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Error koneksi: ${error.message}</div>`;
    }
}

// Start recording audio
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const audioURL = URL.createObjectURL(blob);
            
            const audioPlayback = document.getElementById('audioPlayback');
            audioPlayback.src = audioURL;
            audioPlayback.style.display = 'block';
            
            // Enable search button
            document.getElementById('searchRecord').disabled = false;
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        document.getElementById('startRecord').disabled = true;
        document.getElementById('stopRecord').disabled = false;
        document.getElementById('startRecord').classList.add('recording');
        document.getElementById('recordingStatus').innerHTML = `
            <strong>🔴 Sedang merekam...</strong><br>
            <small>💡 Bacakan 1 ayat dengan jelas, hindari kebisingan</small>
        `;
        
    } catch (error) {
        alert('Error accessing microphone: ' + error.message);
    }
}

// Stop recording audio
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        // Update UI
        document.getElementById('startRecord').disabled = false;
        document.getElementById('stopRecord').disabled = true;
        document.getElementById('startRecord').classList.remove('recording');
        document.getElementById('recordingStatus').innerHTML = `
            <strong>✅ Rekaman selesai!</strong><br>
            <small>🔍 Klik "Cari" untuk memproses audio Anda</small>
        `;
    }
}

// Search by recorded audio
async function searchByRecording() {
    if (recordedChunks.length === 0) {
        alert('Tidak ada rekaman audio. Silakan rekam terlebih dahulu.');
        return;
    }
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="loading">Sedang memproses rekaman...</div>';
    
    try {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async function() {
            const base64data = reader.result;
            
            try {
                const response = await fetch(`${API_BASE_URL}/search/recording`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        audio_data: base64data,
                        method: 'tfidf',
                        top_k: 3
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    displayResults(data.results);
                } else {
                    resultsDiv.innerHTML = `<div class="error">Error: ${data.error}</div>`;
                }
            } catch (error) {
                resultsDiv.innerHTML = `<div class="error">Error koneksi: ${error.message}</div>`;
            }
        };
        
        reader.readAsDataURL(blob);
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Error memproses rekaman: ${error.message}</div>`;
    }
}

// Display search results
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    
    if (!results || results.length === 0) {
        resultsDiv.innerHTML = '<div class="error">Tidak ada hasil yang ditemukan.</div>';
        return;
    }
    
    let html = '<h2>📋 Hasil Pencarian:</h2>';
    
    results.forEach((result) => {
        html += `
            <div class="result-item">
                <h3>
                    <span dir="rtl" class="arabic-title">${result.surah_name_arabic}</span> (${result.surah_name_latin}) - Ayat ${result.ayah}
                    <span class="score">${(result.similarity_score * 100).toFixed(1)}%</span>
                </h3>
                <p><strong>Surah:</strong> ${result.surah_name_latin} - ${result.surah_name_meaning}</p>
                
                <div class="arabic-section">
                    <p><strong>📖 Teks Ayat:</strong></p>
                    <p><span dir="rtl" class="arabic-text">${result.text}</span></p>
                </div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// Show error message
function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<div class="error">${message}</div>`;
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
