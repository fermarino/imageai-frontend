import { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');  
  const [imageUrl, setImageUrl] = useState('');  
  const [loading, setLoading] = useState(false);  
  const [apiResponseTime, setApiResponseTime] = useState<number | null>(null);  
  const [error, setError] = useState<string | null>(null);  
  const [darkMode, setDarkMode] = useState(false);  

  const generateImage = async () => {
    if (!prompt) return;  

    setLoading(true);  
    setError(null);  

    const startTime = performance.now();  

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',  
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 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',  
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,  
          }),
        }
      );

      const endTime = performance.now();  
      const responseTime = endTime - startTime;  
      setApiResponseTime(responseTime);  

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const imageBlob = await response.blob();  
      const contentType = response.headers.get('Content-Type');  

      if (contentType && contentType.startsWith('image')) {
        const imageObjectUrl = URL.createObjectURL(imageBlob);  
        setImageUrl(imageObjectUrl);  
      } else {
        throw new Error('A resposta não contém uma imagem');
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Erro ao gerar a imagem: ${error.message}`);  
      } else {
        setError('Erro desconhecido ao gerar a imagem.');
      }
    } finally {
      setLoading(false);  
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);  
    document.body.classList.toggle('dark-mode', !darkMode);  
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'generated-image.png';  
      link.click();  
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <header className="header">
        <h1 className="title">GenImageAI</h1>
        <button className="dark-light-toggle" onClick={toggleDarkMode}>
          <span className="toggle-icon">🌙</span>
        </button>
      </header>

      <div className="prompt-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="input"
          placeholder="Digite seu prompt aqui..."
        />
        <button
          className="button"
          onClick={generateImage}
          disabled={loading} 
        >
          {loading ? 'Gerando...' : 'Gerar Imagem'}
        </button>
      </div>

      {imageUrl && (
        <div className="image-container">
          <img src={imageUrl} alt="Generated" className="generated-image" />
        </div>
      )}

      {imageUrl && (
        <div className="action-buttons">
          <button className="button" onClick={downloadImage}>
            Baixar Imagem
          </button>
          <button className="button" onClick={generateImage}>
            Gerar Novamente
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {apiResponseTime !== null && (
        <div className="response-time">
          Tempo de resposta: {apiResponseTime.toFixed(2)} ms
        </div>
      )}
    </div>
  );
}

export default App;
