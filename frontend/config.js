// Frontend Configuration
const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://54.251.194.64:5050/api',
    
    // Search Configuration
    DEFAULT_TOP_K: 3,
    DEFAULT_METHOD: 'tfidf',
    
    // File Upload Configuration
    MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
    ALLOWED_AUDIO_TYPES: [
        'audio/wav',
        'audio/mp3',
        'audio/mpeg',
        'audio/m4a',
        'audio/aac',
        'audio/ogg',
        'audio/webm'
    ],
    
    // Recording Configuration
    RECORDING_OPTIONS: {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    },
    
    // UI Configuration
    MESSAGES: {
        NO_FILE_SELECTED: 'Silakan pilih file audio terlebih dahulu',
        NO_RECORDING: 'Tidak ada rekaman audio. Silakan rekam terlebih dahulu.',
        PROCESSING_AUDIO: 'Sedang memproses audio...',
        PROCESSING_RECORDING: 'Sedang memproses rekaman...',
        RECORDING_ACTIVE: 'Sedang merekam... 🔴',
        RECORDING_COMPLETE: 'Rekaman selesai. Siap untuk pencarian.',
        RECORDING_READY: 'Siap untuk merekam',
        NO_RESULTS: 'Tidak ada hasil yang ditemukan.',
        CONNECTION_ERROR: 'Error koneksi ke server',
        MICROPHONE_ERROR: 'Error accessing microphone',
        API_UNAVAILABLE: 'Cannot connect to backend server. Please make sure the server is running.',
        MODELS_NOT_LOADED: 'Backend models are not loaded. Please check the server.'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
